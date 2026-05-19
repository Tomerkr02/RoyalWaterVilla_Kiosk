import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', ['VITE_', 'HA_']);
  const haBaseUrl = (env.HA_BASE_URL ?? env.VITE_HA_BASE_URL)?.replace(/\/$/, '');
  const haToken = env.HA_TOKEN;

  const sendJson = (res: { statusCode: number; setHeader: (key: string, value: string) => void; end: (body: string) => void }, statusCode: number, body: unknown) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(body));
  };

  const readBody = (req: { on: (event: string, handler: (chunk?: Buffer) => void) => void }) =>
    new Promise<Record<string, unknown>>((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk?: Buffer) => {
        if (chunk) chunks.push(chunk);
      });
      req.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        if (!raw) {
          resolve({});
          return;
        }
        try {
          resolve(JSON.parse(raw) as Record<string, unknown>);
        } catch (error) {
          reject(error);
        }
      });
    });

  const validateEntityId = (entityId: unknown) => {
    if (typeof entityId !== 'string' || !/^(switch|light|fan|climate)\.[a-zA-Z0-9_]+$/.test(entityId)) {
      const error = new Error('Invalid entity_id') as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }
    return entityId;
  };

  const haRequest = async (path: string, init?: RequestInit) => {
    if (!haBaseUrl || !haToken) {
      const missing = { HA_BASE_URL: !haBaseUrl, HA_TOKEN: !haToken };
      const error = new Error('Home Assistant proxy is not configured') as Error & { statusCode?: number; details?: unknown };
      error.statusCode = 500;
      error.details = { missing };
      throw error;
    }

    const requestUrl = `${haBaseUrl}${path}`;
    let response: Response;
    try {
      response = await fetch(requestUrl, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${haToken}`,
          ...init?.headers
        }
      });
    } catch (error) {
      const proxyError = new Error('Home Assistant is unreachable') as Error & { statusCode?: number; details?: unknown };
      proxyError.statusCode = 502;
      proxyError.details = { requestUrl, cause: error instanceof Error ? error.message : String(error) };
      throw proxyError;
    }

    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    if (!response.ok) {
      const error = new Error('Home Assistant service call failed') as Error & { statusCode?: number; details?: unknown };
      error.statusCode = response.status >= 500 ? 502 : response.status;
      error.details = { requestUrl, status: response.status, body };
      throw error;
    }
    return body;
  };

  const callService = (domain: string, service: string, data: unknown) => {
    if (!/^(switch|light|fan|climate)$/.test(domain) || !/^[a-zA-Z0-9_]+$/.test(service)) {
      const error = new Error('Invalid Home Assistant service') as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }
    return haRequest(`/api/services/${domain}/${service}`, {
      method: 'POST',
      body: JSON.stringify(data ?? {})
    });
  };

  return {
    plugins: [
      react(),
      {
        name: 'local-ha-api',
        configureServer(server) {
          server.middlewares.use('/api/ha', async (req, res, next) => {
            const url = new URL(req.url ?? '/', 'http://localhost');
            const path = url.pathname;

            try {
              if (req.method === 'GET' && path === '/states') {
                const entityIds = (url.searchParams.get('entity_id') ?? '')
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .map(validateEntityId);
                const states = entityIds.length
                  ? await Promise.all(entityIds.map((entityId) => haRequest(`/api/states/${encodeURIComponent(entityId)}`)))
                  : await haRequest('/api/states');
                sendJson(res, 200, { states });
                return;
              }

              if (req.method === 'POST' && path === '/toggle') {
                const body = await readBody(req);
                const entityId = validateEntityId(body.entity_id);
                const isOn = body.is_on;
                if (typeof isOn !== 'boolean') {
                  sendJson(res, 400, { error: 'is_on must be a boolean' });
                  return;
                }
                const [domain] = entityId.split('.');
                try {
                  await callService(domain, isOn ? 'turn_on' : 'turn_off', { entity_id: entityId });
                } catch (error) {
                  if (domain !== 'climate') throw error;
                  await callService('climate', 'set_hvac_mode', { entity_id: entityId, hvac_mode: isOn ? 'heat' : 'off' });
                }
                const state = await haRequest(`/api/states/${encodeURIComponent(entityId)}`);
                sendJson(res, 200, { state });
                return;
              }

              if (req.method === 'POST' && path === '/service') {
                const body = await readBody(req);
                const result = await callService(String(body.domain ?? ''), String(body.service ?? ''), body.data);
                sendJson(res, 200, { result });
                return;
              }

              next();
            } catch (error) {
              const typedError = error as Error & { statusCode?: number; details?: unknown };
              sendJson(res, typedError.statusCode ?? 500, {
                error: typedError.message,
                details: typedError.details
              });
            }
          });
        }
      }
    ],
    server: {
      port: 5173
    }
  };
});

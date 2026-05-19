const hopByHopHeaders = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade'
]);

function readBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined;
  }

  if (typeof req.body === 'string') {
    return req.body;
  }

  if (req.body && typeof req.body === 'object') {
    return JSON.stringify(req.body);
  }

  return undefined;
}

function copyRequestHeaders(req) {
  const headers = {};

  for (const [key, value] of Object.entries(req.headers)) {
    const normalizedKey = key.toLowerCase();
    if (hopByHopHeaders.has(normalizedKey) || normalizedKey === 'authorization') {
      continue;
    }

    if (Array.isArray(value)) {
      headers[key] = value.join(', ');
    } else if (value) {
      headers[key] = value;
    }
  }

  return headers;
}

export default async function handler(req, res) {
  const haBaseUrl = process.env.HA_BASE_URL?.replace(/\/$/, '');
  const haToken = process.env.HA_TOKEN;

  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (!haBaseUrl || !haToken) {
    res.status(500).json({
      error: 'Home Assistant proxy is not configured',
      missing: {
        HA_BASE_URL: !haBaseUrl,
        HA_TOKEN: !haToken
      }
    });
    return;
  }

  const incomingUrl = new URL(req.url, `https://${req.headers.host ?? 'localhost'}`);
  const haPath = incomingUrl.pathname.replace(/^\/api\/ha/, '') || '/';
  const upstreamUrl = `${haBaseUrl}${haPath}${incomingUrl.search}`;

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: req.method,
      headers: {
        ...copyRequestHeaders(req),
        Authorization: `Bearer ${haToken}`,
        'Content-Type': req.headers['content-type'] ?? 'application/json'
      },
      body: readBody(req)
    });

    const responseBody = await upstreamResponse.arrayBuffer();
    const contentType = upstreamResponse.headers.get('content-type');

    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    res.status(upstreamResponse.status).send(Buffer.from(responseBody));
  } catch (error) {
    console.error('[Vercel HA Proxy] request failed', {
      method: req.method,
      upstreamUrl,
      error
    });
    res.status(502).json({
      error: 'Home Assistant proxy request failed'
    });
  }
}

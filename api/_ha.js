const allowedDomains = new Set(['switch', 'light', 'fan', 'climate']);
const entityPattern = /^(switch|light|fan|climate)\.[a-zA-Z0-9_]+$/;

export function getHaConfig() {
  const haBaseUrl = process.env.HA_BASE_URL?.replace(/\/$/, '');
  const haToken = process.env.HA_TOKEN;

  if (!haBaseUrl || !haToken) {
    const missing = {
      HA_BASE_URL: !haBaseUrl,
      HA_TOKEN: !haToken
    };
    const error = new Error('Home Assistant proxy is not configured');
    error.statusCode = 500;
    error.details = { missing };
    throw error;
  }

  return { haBaseUrl, haToken };
}

export function sendError(res, error) {
  const statusCode = error.statusCode ?? 500;
  res.status(statusCode).json({
    error: error.message ?? 'Home Assistant proxy error',
    details: error.details
  });
}

export function parseEntityIds(value) {
  const raw = Array.isArray(value) ? value.join(',') : value;
  if (!raw) return [];

  const entityIds = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  entityIds.forEach(validateEntityId);
  return entityIds;
}

export function validateEntityId(entityId) {
  if (!entityId || !entityPattern.test(entityId)) {
    const error = new Error('Invalid entity_id');
    error.statusCode = 400;
    error.details = { entity_id: entityId };
    throw error;
  }
}

export function serviceFor(entityId, isOn) {
  validateEntityId(entityId);
  const domain = entityId.split('.')[0];

  if (!allowedDomains.has(domain)) {
    const error = new Error('Unsupported Home Assistant domain');
    error.statusCode = 400;
    error.details = { domain, entity_id: entityId };
    throw error;
  }

  return {
    domain,
    service: isOn ? 'turn_on' : 'turn_off'
  };
}

export async function haRequest(path, init = {}) {
  const { haBaseUrl, haToken } = getHaConfig();
  const requestUrl = `${haBaseUrl}${path}`;

  let response;
  try {
    response = await fetch(requestUrl, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${haToken}`,
        ...init.headers
      }
    });
  } catch (error) {
    const proxyError = new Error('Home Assistant is unreachable');
    proxyError.statusCode = 502;
    proxyError.details = { requestUrl, cause: error instanceof Error ? error.message : String(error) };
    throw proxyError;
  }

  const responseText = await response.text().catch(() => '');
  let responseBody = null;

  if (responseText) {
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }
  }

  if (!response.ok) {
    const error = new Error('Home Assistant service call failed');
    error.statusCode = response.status >= 500 ? 502 : response.status;
    error.details = {
      requestUrl,
      status: response.status,
      body: responseBody
    };
    throw error;
  }

  return responseBody;
}

export async function fetchEntityState(entityId) {
  validateEntityId(entityId);
  return haRequest(`/api/states/${encodeURIComponent(entityId)}`);
}

export async function callService(domain, service, data) {
  if (!allowedDomains.has(domain) || !/^[a-zA-Z0-9_]+$/.test(service)) {
    const error = new Error('Invalid Home Assistant service');
    error.statusCode = 400;
    error.details = { domain, service };
    throw error;
  }

  return haRequest(`/api/services/${domain}/${service}`, {
    method: 'POST',
    body: JSON.stringify(data ?? {})
  });
}

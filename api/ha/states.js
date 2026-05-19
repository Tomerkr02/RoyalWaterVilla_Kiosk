import { fetchEntityState, haRequest, parseEntityIds, sendError } from '../_ha.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const entityIds = parseEntityIds(req.query.entity_id);
    const states = entityIds.length
      ? await Promise.all(entityIds.map((entityId) => fetchEntityState(entityId)))
      : await haRequest('/api/states');

    res.status(200).json({ states });
  } catch (error) {
    sendError(res, error);
  }
}

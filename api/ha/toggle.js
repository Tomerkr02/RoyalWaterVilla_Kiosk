import { callService, fetchEntityState, sendError, serviceFor, validateEntityId } from '../_ha.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {};
    const { entity_id: entityId, is_on: isOn } = body;
    validateEntityId(entityId);

    if (typeof isOn !== 'boolean') {
      res.status(400).json({ error: 'is_on must be a boolean' });
      return;
    }

    const { domain, service } = serviceFor(entityId, isOn);

    try {
      await callService(domain, service, { entity_id: entityId });
    } catch (error) {
      if (domain !== 'climate') throw error;
      await callService('climate', 'set_hvac_mode', {
        entity_id: entityId,
        hvac_mode: isOn ? 'heat' : 'off'
      });
    }

    const state = await fetchEntityState(entityId);
    res.status(200).json({ state });
  } catch (error) {
    sendError(res, error);
  }
}

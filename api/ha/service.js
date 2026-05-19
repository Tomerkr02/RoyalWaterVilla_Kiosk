import { callService, sendError } from '../_ha.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {};
    const { domain, service, data } = body;
    const result = await callService(domain, service, data);
    res.status(200).json({ result });
  } catch (error) {
    sendError(res, error);
  }
}

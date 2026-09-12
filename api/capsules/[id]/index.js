const { getCapsules, saveCapsules } = require('../../../lib/db');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end('Method not allowed');
  }

  const { id } = req.query;
  const capsules = await getCapsules();
  const filtered = capsules.filter(c => c.id !== id);

  if (filtered.length === capsules.length) {
    return res.status(404).json({ error: 'Capsule not found.' });
  }

  await saveCapsules(filtered);
  return res.status(200).json({ ok: true });
};

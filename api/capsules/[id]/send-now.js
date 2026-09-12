const { getCapsules, saveCapsules } = require('../../../lib/db');
const { sendCapsuleEmail } = require('../../../lib/mailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method not allowed');
  }

  const { id } = req.query;
  const capsules = await getCapsules();
  const capsule = capsules.find(c => c.id === id);

  if (!capsule) return res.status(404).json({ error: 'Capsule not found.' });
  if (capsule.delivered) return res.status(400).json({ error: 'Already delivered.' });

  try {
    await sendCapsuleEmail(capsule);
    capsule.delivered = true;
    capsule.deliveredAt = new Date().toISOString();
    await saveCapsules(capsules);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

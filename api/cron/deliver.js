const { getCapsules, saveCapsules } = require('../../lib/db');
const { sendCapsuleEmail } = require('../../lib/mailer');

module.exports = async function handler(req, res) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers['authorization'];
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const capsules = await getCapsules();
  const now = new Date();
  let changed = false;
  const results = [];

  for (const capsule of capsules) {
    if (!capsule.delivered && new Date(capsule.deliveryDate) <= now) {
      try {
        await sendCapsuleEmail(capsule);
        capsule.delivered = true;
        capsule.deliveredAt = new Date().toISOString();
        changed = true;
        results.push({ id: capsule.id, status: 'sent' });
      } catch (err) {
        results.push({ id: capsule.id, status: 'failed', error: err.message });
      }
    }
  }

  if (changed) await saveCapsules(capsules);

  return res.status(200).json({ checked: capsules.length, results });
};

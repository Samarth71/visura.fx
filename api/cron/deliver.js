const { getCapsules, saveCapsules } = require('../../lib/db');
const { sendCapsuleEmail } = require('../../lib/mailer');
const { sendCapsuleWhatsApp } = require('../../lib/whatsapp');

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
      const result = { id: capsule.id };

      try {
        await sendCapsuleEmail(capsule);
        result.email = 'sent';
      } catch (err) {
        result.email = 'failed';
        result.emailError = err.message;
      }

      if (capsule.recipientPhone) {
        try {
          await sendCapsuleWhatsApp(capsule);
          result.whatsapp = 'sent';
        } catch (err) {
          result.whatsapp = 'failed';
          result.whatsappError = err.message;
        }
      }

      capsule.delivered = true;
      capsule.deliveredAt = new Date().toISOString();
      changed = true;
      results.push(result);
    }
  }

  if (changed) await saveCapsules(capsules);

  return res.status(200).json({ checked: capsules.length, results });
};

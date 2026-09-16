const { getCapsules } = require('../../../lib/db');
const { pickFunNote } = require('../../../lib/funNotes');

module.exports = async function handler(req, res) {
  const { id } = req.query;
  const capsules = await getCapsules();
  const capsule = capsules.find(c => c.id === id);

  if (!capsule) {
    return res.status(404).json({ error: "This capsule doesn't exist." });
  }

  if (!capsule.delivered) {
    return res.status(403).json({ error: "This capsule hasn't been unsealed yet." });
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      recipientName: capsule.recipientName,
      senderName: capsule.senderName,
      occasion: capsule.occasion,
      requiresPin: !!capsule.recipientPin
    });
  }

  if (req.method === 'POST') {
    const { pin } = req.body || {};

    if (capsule.recipientPin && String(pin || '') !== capsule.recipientPin) {
      return res.status(401).json({ error: 'Incorrect PIN. Try again.' });
    }

    return res.status(200).json({
      recipientName: capsule.recipientName,
      senderName: capsule.senderName,
      senderEmail: capsule.senderEmail || '',
      occasion: capsule.occasion,
      message: capsule.message,
      photo: capsule.photo || '',
      funNote: pickFunNote(capsule.occasion)
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method not allowed');
};

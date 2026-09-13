const { getCapsules, saveCapsules } = require('../../lib/db');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const capsules = await getCapsules();
    const publicList = capsules.map(c => ({
      id: c.id,
      recipientName: c.recipientName,
      senderName: c.senderName,
      occasion: c.occasion,
      deliveryDate: c.deliveryDate,
      delivered: c.delivered,
      hasPhone: !!c.recipientPhone,
      hasPin: !!c.recipientPin,
      createdAt: c.createdAt
    }));
    return res.status(200).json(publicList);
  }

  if (req.method === 'POST') {
    const { recipientName, recipientEmail, recipientPhone, recipientPin, deliveryDate, occasion, message, senderName } = req.body || {};

    if ((!recipientEmail && !recipientPhone) || !deliveryDate || !message) {
      return res.status(400).json({ error: 'Provide a recipient email or WhatsApp number, plus deliveryDate and message.' });
    }

    if (recipientPin && !/^\d{4}$/.test(recipientPin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits.' });
    }

    const deliveryTimestamp = new Date(deliveryDate);
    if (isNaN(deliveryTimestamp.getTime())) {
      return res.status(400).json({ error: 'deliveryDate is not a valid date.' });
    }

    const capsules = await getCapsules();

    const newCapsule = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      recipientName: recipientName || '',
      recipientEmail: recipientEmail || '',
      recipientPhone: recipientPhone || '',
      recipientPin: recipientPin || '',
      senderName: senderName || '',
      deliveryDate: deliveryTimestamp.toISOString(),
      occasion: occasion || '',
      message,
      delivered: false,
      createdAt: new Date().toISOString()
    };

    capsules.push(newCapsule);
    await saveCapsules(capsules);

    return res.status(201).json(newCapsule);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method not allowed');
};

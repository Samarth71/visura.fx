const { getCapsules, saveCapsules } = require('../../../lib/db');

module.exports = async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const capsules = await getCapsules();
    const capsule = capsules.find(c => c.id === id);
    if (!capsule) {
      return res.status(404).json({ error: 'Capsule not found.' });
    }
    return res.status(200).json(capsule);
  }

  if (req.method === 'PUT') {
    const { recipientName, recipientEmail, recipientPhone, deliveryDate, occasion, message, senderName } = req.body || {};

    if (!recipientEmail || !deliveryDate || !message) {
      return res.status(400).json({ error: 'recipientEmail, deliveryDate and message are required.' });
    }

    const deliveryTimestamp = new Date(deliveryDate);
    if (isNaN(deliveryTimestamp.getTime())) {
      return res.status(400).json({ error: 'deliveryDate is not a valid date.' });
    }

    const capsules = await getCapsules();
    const index = capsules.findIndex(c => c.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Capsule not found.' });
    }

    if (capsules[index].delivered) {
      return res.status(400).json({ error: 'This capsule has already been delivered and cannot be edited.' });
    }

    capsules[index] = {
      ...capsules[index],
      recipientName: recipientName || '',
      recipientEmail,
      recipientPhone: recipientPhone || '',
      senderName: senderName || '',
      deliveryDate: deliveryTimestamp.toISOString(),
      occasion: occasion || '',
      message
    };

    await saveCapsules(capsules);
    return res.status(200).json(capsules[index]);
  }

  if (req.method === 'DELETE') {
    const capsules = await getCapsules();
    const filtered = capsules.filter(c => c.id !== id);

    if (filtered.length === capsules.length) {
      return res.status(404).json({ error: 'Capsule not found.' });
    }

    await saveCapsules(filtered);
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end('Method not allowed');
};

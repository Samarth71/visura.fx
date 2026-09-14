module.exports = async function handler(req, res) {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  const pin = req.query.pin || '246810';

  if (!token || !phoneNumberId) {
    return res.status(400).json({ error: 'META_WHATSAPP_TOKEN or META_PHONE_NUMBER_ID missing.' });
  }

  const response = await fetch(
    'https://graph.facebook.com/v21.0/' + phoneNumberId + '/register',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messaging_product: 'whatsapp', pin: pin })
    }
  );

  const data = await response.json();
  return res.status(response.status).json(data);
};

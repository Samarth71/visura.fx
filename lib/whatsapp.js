async function sendCapsuleWhatsApp(capsule) {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new Error('Meta WhatsApp is not configured.');
  }

  if (!capsule.recipientPhone) {
    throw new Error('No recipient phone number on this capsule.');
  }

  const toNumber = capsule.recipientPhone.replace(/^whatsapp:/, '').replace(/^\+/, '');
  const link = getSiteUrl() + '/?capsule=' + capsule.id;

  const response = await fetch(
    'https://graph.facebook.com/v21.0/' + phoneNumberId + '/messages',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: toNumber,
        type: 'template',
        template: {
          name: 'hello_world',
          language: { code: 'en_US' }
        }
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data.error && data.error.message) || 'WhatsApp message failed to send.');
  }

  return data;
}

function getSiteUrl() {
  return process.env.SITE_URL || 'https://visura-fx.vercel.app';
}

module.exports = { sendCapsuleWhatsApp };

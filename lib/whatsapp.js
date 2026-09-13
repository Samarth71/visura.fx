async function sendCapsuleWhatsApp(capsule) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  const contentSid = process.env.TWILIO_CONTENT_SID;

  if (!accountSid || !authToken || !fromNumber || !contentSid) {
    throw new Error('Twilio is not configured.');
  }

  if (!capsule.recipientPhone) {
    throw new Error('No recipient phone number on this capsule.');
  }

  const toNumber = capsule.recipientPhone.startsWith('whatsapp:')
    ? capsule.recipientPhone
    : 'whatsapp:' + capsule.recipientPhone;

  const link = getSiteUrl() + '/?capsule=' + capsule.id;
  const variable1 = capsule.occasion ? capsule.occasion + ' — a sealed message' : 'a sealed message for you';

  const params = new URLSearchParams();
  params.append('From', fromNumber);
  params.append('To', toNumber);
  params.append('ContentSid', contentSid);
  params.append('ContentVariables', JSON.stringify({ '1': variable1, '2': link }));

  const auth = Buffer.from(accountSid + ':' + authToken).toString('base64');

  const response = await fetch(
    'https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json',
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'WhatsApp message failed to send.');
  }

  return data;
}

function getSiteUrl() {
  return process.env.SITE_URL || 'https://visura-fx.vercel.app';
}

module.exports = { sendCapsuleWhatsApp };

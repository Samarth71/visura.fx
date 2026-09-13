async function sendCapsuleWhatsApp(capsule) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio is not configured.');
  }

  if (!capsule.recipientPhone) {
    throw new Error('No recipient phone number on this capsule.');
  }

  const toNumber = capsule.recipientPhone.startsWith('whatsapp:')
    ? capsule.recipientPhone
    : 'whatsapp:' + capsule.recipientPhone;

  const body = buildMessageText(capsule);

  const params = new URLSearchParams();
  params.append('From', fromNumber);
  params.append('To', toNumber);
  params.append('Body', body);

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

function buildMessageText(capsule) {
  const occasionLine = capsule.occasion ? ' — ' + capsule.occasion : '';
  const fromLine = capsule.senderName ? '\n\n— ' + capsule.senderName : '';
  return (
    'A message that has been waiting for you' + occasionLine + ':\n\n' +
    capsule.message +
    fromLine
  ).trim();
}

module.exports = { sendCapsuleWhatsApp };

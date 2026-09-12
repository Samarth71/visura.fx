const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendCapsuleEmail(capsule) {
  return transporter.sendMail({
    from: `"Visuraa" <${process.env.EMAIL_USER}>`,
    to: capsule.recipientEmail,
    subject: `A message for you — ${capsule.occasion || 'a moment that matters'}`,
    text: capsule.message,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px; background: #09090b; color: #f2ede4;">
        <p style="font-size: 11px; letter-spacing: 2px; color: #8a7e63; text-transform: uppercase;">visuraa — sealed on ${new Date(capsule.createdAt).toLocaleDateString()}</p>
        <h2 style="font-weight: 300; font-size: 26px; margin: 16px 0 24px;">A message that's been waiting for you.</h2>
        <p style="font-size: 15px; line-height: 1.8; white-space: pre-wrap;">${escapeHtml(capsule.message)}</p>
        <p style="font-size: 12px; color: #66666d; margin-top: 40px;">— sent for ${escapeHtml(capsule.occasion || 'this occasion')}, sealed and held until today.</p>
      </div>
    `
  });
}

module.exports = { sendCapsuleEmail };

\const nodemailer = require('nodemailer');
const { pickFunNote } = require('./funNotes');

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

function getSiteUrl() {
  return process.env.SITE_URL || 'https://visura-fx.vercel.app';
}

async function sendCapsuleEmail(capsule) {
  const link = getSiteUrl() + '/?capsule=' + capsule.id;
  const senderLabel = capsule.senderName || 'someone who was thinking of you';
  const funNote = pickFunNote(capsule.occasion);

  return transporter.sendMail({
    from: `"Visuraa" <${process.env.EMAIL_USER}>`,
    to: capsule.recipientEmail,
    subject: `A message for you — ${capsule.occasion || 'a moment that matters'}`,
    text: `A message that's been waiting for you has arrived. Open it here: ${link}\n\nSent by ${senderLabel} · Verified & safe\n${funNote}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px; background: #09090b; color: #f2ede4;">
        <p style="font-size: 11px; letter-spacing: 2px; color: #8a7e63; text-transform: uppercase;">visuraa — sealed on ${new Date(capsule.createdAt).toLocaleDateString()}</p>
        <h2 style="font-weight: 300; font-size: 26px; margin: 16px 0 24px;">A message that's been waiting for you.</h2>
        <p style="font-size: 15px; line-height: 1.8;">Sent for ${escapeHtml(capsule.occasion || 'this occasion')} — sealed until today, and no one, including us, has read it.</p>
        <a href="${link}" style="display: inline-block; margin-top: 24px; padding: 14px 28px; border: 1px solid #b7b1a5; color: #f2ede4; text-decoration: none; letter-spacing: 0.04em; font-family: Arial, sans-serif; font-size: 13px;">Break the seal</a>
        <p style="font-size: 12px; color: #b7b1a5; margin-top: 22px;">Sent by ${escapeHtml(senderLabel)} &middot; <span style="color: #5c6a5e;">Verified &amp; safe</span></p>
        <p style="font-size: 13px; color: #8a7e63; font-style: italic; margin-top: 12px;">${escapeHtml(funNote)}</p>
        <p style="font-size: 11px; color: #66666d; margin-top: 32px;">If the button doesn't work, open this link: ${link}</p>
      </div>
    `
  });
}

module.exports = { sendCapsuleEmail };

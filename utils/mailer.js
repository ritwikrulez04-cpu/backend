// utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // e.g. "smtp.gmail.com"
  port: process.env.SMTP_PORT,       // e.g. 587
  secure: false,                     // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,     // your email account
    pass: process.env.SMTP_PASS      // your email password or app-specific password
  }
});

async function sendVerificationEmail(to, code) {
  await transporter.sendMail({
    from: `"ShoppyGlobe" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your ShoppyGlobe Verification Code',
    text: `Welcome to ShoppyGlobe! Your verification code is: ${code}\nIt expires in 15 minutes.`,
    html: `<p>Welcome to <strong>ShoppyGlobe</strong>!</p>
           <p>Your verification code is: <strong>${code}</strong></p>
           <p>This code will expire in 15 minutes.</p>`
  });
}

module.exports = { sendVerificationEmail };

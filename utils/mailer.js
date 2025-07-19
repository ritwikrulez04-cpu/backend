import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (to, code) => {
  await transporter.sendMail({
    from: `"ShoppyGlobe" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your Verification Code',
    html: `<h3>Your code is <strong>${code}</strong></h3><p>It expires in 15 minutes.</p>`,
  });
};

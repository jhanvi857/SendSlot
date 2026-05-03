import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendMail(to, subject, text, html) {
  if (!transporter) {
    console.log('SMTP not configured : email log:', { to, subject, text });
    return;
  }
  await transporter.sendMail({ from: process.env.SMTP_FROM || 'noreply@sendslot.io', to, subject, text, html });
}

export { sendMail };

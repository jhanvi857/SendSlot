import { sql } from '../lib/db.js';
import { sendMail } from '../lib/mailer.js';
import { Job } from 'bullmq';

export default async function jobProcessor(job: Job) {
  const { transferId } = job.data;
  const t = await sql`SELECT * FROM transfers WHERE id=${transferId}`;
  if (!t.length) return;
  const transfer = t[0];
  const url = `${process.env.BASE_URL || 'http://localhost:3001'}/d/${transfer.slug}`;
  const to = transfer.user_email;
  if (!to) return;
  const subject = 'Your file was downloaded';
  const text = `Your transfer ${url} was downloaded.`;
  try {
    await sendMail(to, subject, text, `<p>${text}</p>`);
  } catch (err) {
    console.error('email send failed', err);
  }
}

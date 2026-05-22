import { sql } from '../lib/db.js';
import { getObjectStream, deleteObjects } from '../lib/s3.js';
import { Job } from 'bullmq';

let clamscan: any = null;
(async () => {
  try {
    // @ts-ignore
    const mod = await import('clamscan');
    const NodeClam = mod.default || mod;
    clamscan = await new NodeClam().init({ remove_infected: false });
  } catch (err) {
    console.warn('ClamAV or clamscan module not available, will skip scanning');
    clamscan = null;
  }
})();

export default async function jobProcessor(job: Job) {
  const { transferId } = job.data;
  const files = await sql`SELECT * FROM files WHERE transfer_id=${transferId}`;
  if (!clamscan) {
    for (const f of files) {
      await sql`UPDATE files SET scan_status='skipped' WHERE id=${f.id}`;
    }
    await sql`UPDATE transfers SET status='ready' WHERE id=${transferId}`;
    return;
  }
  let anyInfected = false;
  for (const f of files) {
    try {
      const stream = await getObjectStream(f.storage_key);
      const { is_infected } = await clamscan.scan_stream(stream);
      if (is_infected) {
        anyInfected = true;
        await sql`UPDATE files SET scan_status='infected' WHERE id=${f.id}`;
        await deleteObjects([f.storage_key]);
      } else {
        await sql`UPDATE files SET scan_status='clean' WHERE id=${f.id}`;
      }
    } catch (err) {
      console.error('scan error', err);
      await sql`UPDATE files SET scan_status='skipped' WHERE id=${f.id}`;
    }
  }
  if (anyInfected) {
    await sql`UPDATE transfers SET status='quarantined' WHERE id=${transferId}`;
  } else {
    await sql`UPDATE transfers SET status='ready' WHERE id=${transferId}`;
  }
}

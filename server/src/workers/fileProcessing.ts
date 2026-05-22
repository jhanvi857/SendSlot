import { sql } from '../lib/db.js';
import { headObject } from '../lib/s3.js';
import { Queue, Job } from 'bullmq';
import redis from '../lib/redis.js';

const connection = redis;
const avQueue = new Queue('av-scan', { connection });

export default async function jobProcessor(job: Job) {
  const { transferId } = job.data;
  const files = await sql`SELECT * FROM files WHERE transfer_id=${transferId}`;
  // verify existence
  for (const f of files) {
    let ok = false;
    for (let i = 0; i < 2; i++) {
      try {
        await headObject(f.storage_key);
        ok = true; break;
      } catch (err) {
        if (i === 0) {
          await new Promise<void>(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    if (!ok) {
      await sql`UPDATE transfers SET status='failed' WHERE id=${transferId}`;
      return;
    }
  }
  await sql`UPDATE transfers SET status='scanning' WHERE id=${transferId}`;
  await avQueue.add('scan', { transferId });
}

import cron from 'node-cron';
import { sql } from '../lib/db.js';
import { listObjectsWithPrefix, deleteObjects } from '../lib/s3.js';

if (process.env.WORKER_PRIMARY !== 'true') {
  console.log('Cron disabled (not primary)');
} else {
  cron.schedule('0 2 * * *', async () => {
    console.log('Running expiry cleanup');
    const expired = await sql`SELECT id FROM transfers WHERE expires_at < now() AND status != 'expired'`;
    for (const t of expired) {
      const files = await sql`SELECT storage_key FROM files WHERE transfer_id=${t.id}`;
      const keys = files.map(f => f.storage_key);
      await deleteObjects(keys);
      await sql`UPDATE transfers SET status='expired' WHERE id=${t.id}`;
    }
  });

  cron.schedule('0 3 * * 0', async () => {
    console.log('Running orphan sweep');
    const allKeys = await listObjectsWithPrefix('uploads/');
    const rows = await sql`SELECT storage_key FROM files`;
    const dbKeys = new Set(rows.map(r => r.storage_key));
    const toDelete = allKeys.filter(k => !dbKeys.has(k));
    if (toDelete.length) await deleteObjects(toDelete);
  });

  cron.schedule('0 3 * * *', async () => {
    console.log('Running storage audit');
    const totals = await sql`SELECT COUNT(*) AS cnt, SUM(size_bytes) AS total FROM files`;
    const byStatus = await sql`SELECT scan_status, COUNT(*) FROM files GROUP BY scan_status`;
    console.log('Totals:', totals[0]);
    console.log('By status:', byStatus);
  });
}

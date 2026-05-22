import express, { Request, Response, NextFunction } from 'express';
import { sql } from '../lib/db.js';
import { Queue } from 'bullmq';
import redis from '../lib/redis.js';

const router = express.Router();
const connection = redis;

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' });
  const token = auth.slice(7);
  if (token !== (process.env.ADMIN_TOKEN || 'admin-secret')) return res.status(401).json({ error: 'unauthorized' });
  next();
}

router.use(requireAdmin);

router.get('/transfers', async (req: Request, res: Response) => {
  const rows = await sql`
    SELECT t.*, (SELECT COUNT(*) FROM files f WHERE f.transfer_id = t.id) AS file_count
    FROM transfers t ORDER BY created_at DESC
  `;
  res.json(rows);
});

router.get('/workers', async (req: Request, res: Response) => {
  const queues = ['file-processing', 'av-scan', 'email-notify'];
  const stats: Record<string, any> = {};
  for (const q of queues) {
    const queue = new Queue(q, { connection });
    const counts = await queue.getJobCounts();
    stats[q] = { waiting: counts.waiting || 0, active: counts.active || 0, completed: counts.completed || 0, failed: counts.failed || 0 };
  }
  const cron = {
    expiryCleanup: { schedule: '0 2 * * *' },
    orphanSweep: { schedule: '0 3 * * 0' },
    storageAudit: { schedule: '0 3 * * *' }
  };
  res.json({ queues: stats, cron });
});

export default router;

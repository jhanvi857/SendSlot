import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy(times: number) {
    // gradual backoff : delay increase with number of retry attempts.
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

connection.on('error', (err: any) => {
  if (err.code === 'ECONNREFUSED') {
    console.warn(`[Redis] Connection refused at ${err.address}:${err.port}. Is Redis running?`);
  } else {
    console.error('[Redis] Error:', err);
  }
});

connection.on('connect', () => {
  console.log('[Redis] Connected');
});

export default connection;

import express from 'express';
import 'express-async-errors';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import transfersRouter from './routes/transfers.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';
import errorHandler from './middleware/errorHandler.js';
import { ensureSchema } from './lib/db.js';
import { createTransferLimiter, downloadLimiter } from './middleware/rateLimit.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowed = ['http://localhost:5173'];
if (process.env.CLIENT_URL) allowed.push(process.env.CLIENT_URL);
app.use(cors({ origin: allowed }));
app.use(bodyParser.json({ limit: '20mb' }));

app.use('/api/transfers', createTransferLimiter, transfersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);

app.use(errorHandler);

async function start() {
  try {
    await ensureSchema();
    app.listen(PORT, () => console.log(`API listening on ${PORT}`));
  } catch (err: any) {
    console.error('Failed to start API:', err?.message || err);
    console.warn('Is the database running? Check your DATABASE_URL in .env');
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') start();

export default app;

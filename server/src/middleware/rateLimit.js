import rateLimit from 'express-rate-limit';

export const createTransferLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many create requests, slow down' }
});

export const downloadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many download requests, slow down' }
});

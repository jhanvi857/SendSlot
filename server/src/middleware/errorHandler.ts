import { Request, Response, NextFunction } from 'express';

export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
  console.error(err);
  res.status(status).json({ error: err.message || 'Internal Server Error' });
}

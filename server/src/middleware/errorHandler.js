export default function errorHandler(err, req, res, next) {
  const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
  console.error(err);
  res.status(status).json({ error: err.message || 'Internal Server Error' });
}

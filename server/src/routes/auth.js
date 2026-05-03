import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sql } from '../lib/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const hash = await bcrypt.hash(password, 10);
  try {
    const [user] = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email}, ${hash})
      RETURNING id, email
    `;
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    throw err;
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: { id: user.id, email: user.email }, token });
});

export default router;

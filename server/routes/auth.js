import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d',
  });
}

router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, phone });
  const token = signToken(user);

  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = signToken(user);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', requireAuth, async (req, res) => {
  const allowed = ['name', 'phone', 'preferences', 'favorites'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
  }
  await req.user.save();
  res.json({ user: req.user });
});

router.patch('/favorites/:roomId', requireAuth, async (req, res) => {
  const roomId = req.params.roomId;
  const exists = req.user.favorites.some((favorite) => String(favorite) === roomId);

  req.user.favorites = exists
    ? req.user.favorites.filter((favorite) => String(favorite) !== roomId)
    : [...req.user.favorites, roomId];

  await req.user.save();
  res.json({ favorites: req.user.favorites });
});

export default router;

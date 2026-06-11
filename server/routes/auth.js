import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d',
  });
}

function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  return null;
}

// ── Register ──────────────────────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone')
      .optional()
      .matches(/^\+?[\d\s\-().]{7,20}$/)
      .withMessage('Invalid phone number'),
  ],
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    try {
      const { name, email, password, phone } = req.body;

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed, phone });
      const token = signToken(user);

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (error) {
      console.error('[auth] register error:', error);
      res.status(500).json({ success: false, message: 'Registration failed', detail: error.message });
    }
  },
);

// ── Login ─────────────────────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = signToken(user);
      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (error) {
      console.error('[auth] login error:', error);
      res.status(500).json({ success: false, message: 'Login failed', detail: error.message });
    }
  },
);

// ── Me ────────────────────────────────────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ── Update Profile ────────────────────────────────────────────────────────────
router.put(
  '/profile',
  requireAuth,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone')
      .optional()
      .matches(/^\+?[\d\s\-().]{7,20}$/)
      .withMessage('Invalid phone number'),
  ],
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    try {
      const allowed = ['name', 'phone', 'preferences', 'favorites'];
      for (const key of allowed) {
        if (req.body[key] !== undefined) req.user[key] = req.body[key];
      }
      await req.user.save();
      res.json({ success: true, message: 'Profile updated', user: req.user });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Profile update failed', detail: error.message });
    }
  },
);

// ── Toggle Favorite ───────────────────────────────────────────────────────────
router.patch('/favorites/:roomId', requireAuth, async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const exists = req.user.favorites.some((favorite) => String(favorite) === roomId);

    req.user.favorites = exists
      ? req.user.favorites.filter((favorite) => String(favorite) !== roomId)
      : [...req.user.favorites, roomId];

    await req.user.save();
    res.json({ success: true, favorites: req.user.favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not update favorites', detail: error.message });
  }
});

export default router;

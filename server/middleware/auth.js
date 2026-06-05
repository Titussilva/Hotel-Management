import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      console.warn('Auth failed: missing bearer token', {
        method: req.method,
        path: req.originalUrl,
        authorization: header,
      });
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findById(payload.id).select('-password');

    if (!user) {
      console.warn('Auth failed: token validated but user not found', {
        userId: payload.id,
        method: req.method,
        path: req.originalUrl,
      });
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.warn('Auth failed: invalid or expired token', {
      message: error.message,
      method: req.method,
      path: req.originalUrl,
      authorization: req.headers.authorization || '',
    });
    res.status(401).json({ message: 'Invalid or expired session' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

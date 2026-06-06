import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    console.log(`[auth] ${req.method} ${req.path} – token ${token ? 'present (' + token.slice(0, 12) + '...)' : 'MISSING'}`);

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = jwt.verify(token, secret);
    console.log(`[auth] token decoded – userId=${payload.id} role=${payload.role}`);

    const user = await User.findById(payload.id).select('-password');

    if (!user) {
      console.warn(`[auth] user not found for id=${payload.id}`);
      return res.status(401).json({ message: 'User not found' });
    }

    console.log(`[auth] session valid – user=${user.email}`);
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.warn(`[auth] token expired at ${error.expiredAt}`);
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    console.warn(`[auth] token verification failed – ${error.name}: ${error.message}`);
    res.status(401).json({ message: 'Invalid or expired session' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}
import express from 'express';
import Notification from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
  res.json(notifications);
});

router.patch('/:id/read', requireAuth, async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true },
  );
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json(notification);
});

export default router;

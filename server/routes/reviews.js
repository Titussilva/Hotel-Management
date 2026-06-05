import express from 'express';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    console.debug('[reviews] POST received', { path: req.originalUrl, body: req.body, user: req.user?._id });
    const { roomId, bookingId, rating, title, comment } = req.body;
    const booking = bookingId
      ? await Booking.findOne({ _id: bookingId, user: req.user._id, room: roomId })
      : await Booking.findOne({ user: req.user._id, room: roomId, status: { $ne: 'cancelled' } });

    if (!booking) return res.status(403).json({ message: 'Only guests with a booking can review this room' });

    const review = await Review.create({
      user: req.user._id,
      room: roomId,
      booking: booking._id,
      rating,
      title,
      comment,
    });

    console.debug('[reviews] created', { reviewId: review._id });
    res.status(201).json(review);
  } catch (error) {
    console.error('[reviews] error', error);
    res.status(500).json({ message: 'Could not create review', detail: error.message });
  }
});

export default router;

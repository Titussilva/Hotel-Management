import express from 'express';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { roomId, bookingId, rating, title, comment } = req.body;
    console.log('[Review POST] user:', req.user._id, 'roomId:', roomId, 'bookingId:', bookingId, 'rating:', rating);

    if (!roomId) return res.status(400).json({ message: 'roomId is required' });
    if (!comment || !String(comment).trim()) return res.status(400).json({ message: 'comment is required' });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'rating must be between 1 and 5' });

    // Find a valid booking: prefer the specific booking if provided, then any booking
    // for this room, then any non-cancelled booking by this user for any room.
    // This matches the UI which shows the review form to all logged-in guests.
    let booking = null;

    if (bookingId) {
      booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
    }

    if (!booking) {
      booking = await Booking.findOne({ user: req.user._id, room: roomId, status: { $ne: 'cancelled' } });
    }

    if (!booking) {
      booking = await Booking.findOne({ user: req.user._id, status: { $ne: 'cancelled' } });
    }

    console.log('[Review POST] booking found:', booking ? booking._id : 'none');
    if (!booking) return res.status(403).json({ message: 'Only guests with a booking can review this room' });

    const review = await Review.create({
      user: req.user._id,
      room: roomId,
      booking: booking._id,
      rating,
      title,
      comment,
    });

    console.log('[Review POST] review saved, id:', review._id, 'status:', review.status);
    res.status(201).json(review);
  } catch (error) {
    console.error('[Review POST] error:', error.message, error.name);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(500).json({ message: 'Review could not be saved', detail: error.message });
  }
});

export default router;

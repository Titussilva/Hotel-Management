import express from 'express';
import Booking from '../models/Booking.js';
import Offer from '../models/Offer.js';
import Review from '../models/Review.js';
import Room from '../models/Room.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth, requireAdmin);

const handleAdminError = (res, error) => {
  console.error('Admin route error:', error);
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation failed', errors: error.errors });
  }
  return res.status(500).json({ message: 'Admin request failed', detail: error.message });
};

router.post('/rooms', async (req, res) => {
  try {
    console.debug('[admin] POST /rooms', { body: req.body, user: req.user?._id });
    const room = await Room.create(req.body);
    console.debug('[admin] room created', { id: room._id });
    res.status(201).json(room);
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.put('/rooms/:id', async (req, res) => {
  try {
    console.debug('[admin] PUT /rooms/:id', { id: req.params.id, body: req.body, user: req.user?._id });
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    console.debug('[admin] room updated', { id: room._id });
    res.json(room);
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.delete('/rooms/:id', async (req, res) => {
  try {
    console.debug('[admin] DELETE /rooms/:id', { id: req.params.id, user: req.user?._id });
    const room = await Room.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    console.debug('[admin] room deactivated', { id: room._id });
    res.json(room);
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.get('/bookings', async (_req, res) => {
  const bookings = await Booking.find().populate('room user', 'name email type').sort({ createdAt: -1 });
  res.json(bookings);
});

router.patch('/bookings/:id', async (req, res) => {
  try {
    console.debug('[admin] PATCH /bookings/:id', { id: req.params.id, body: req.body, user: req.user?._id });
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    console.debug('[admin] booking updated', { id: booking._id });
    res.json(booking);
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.get('/reviews', async (_req, res) => {
  const reviews = await Review.find().populate('room user', 'name email').sort({ createdAt: -1 });
  res.json(reviews);
});

router.patch('/reviews/:id', async (req, res) => {
  try {
    console.debug('[admin] PATCH /reviews/:id', { id: req.params.id, body: req.body, user: req.user?._id });
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    console.debug('[admin] review updated', { id: review._id });
    res.json(review);
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.post('/offers', async (req, res) => {
  try {
    console.debug('[admin] POST /offers', { body: req.body, user: req.user?._id });
    const offerData = { ...req.body };
    if (offerData.code) offerData.code = String(offerData.code).toUpperCase();
    const offer = await Offer.create(offerData);
    console.debug('[admin] offer created', { id: offer._id });
    res.status(201).json(offer);
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.put('/offers/:id', async (req, res) => {
  try {
    console.debug('[admin] PUT /offers/:id', { id: req.params.id, body: req.body, user: req.user?._id });
    const update = { ...req.body };
    if (update.code) update.code = String(update.code).toUpperCase();
    const offer = await Offer.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    console.debug('[admin] offer updated', { id: offer._id });
    res.json(offer);
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.delete('/offers/:id', async (req, res) => {
  try {
    console.debug('[admin] DELETE /offers/:id', { id: req.params.id, user: req.user?._id });
    const offer = await Offer.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    console.debug('[admin] offer deactivated', { id: offer._id });
    res.json(offer);
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.get('/analytics', async (_req, res) => {
  const [bookings, revenue, reviews, rooms] = await Promise.all([
    Booking.countDocuments(),
    Booking.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Review.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Room.find(),
  ]);

  const occupied = await Booking.countDocuments({ status: 'upcoming' });
  const totalUnits = rooms.reduce((sum, room) => sum + room.totalUnits, 0);

  res.json({
    bookings,
    revenue: revenue[0]?.total || 0,
    reviewStatus: reviews,
    occupancyRate: totalUnits ? Math.round((occupied / totalUnits) * 100) : 0,
  });
});

export default router;

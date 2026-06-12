import express from 'express';
import Booking from '../models/Booking.js';
import Offer from '../models/Offer.js';
import Review from '../models/Review.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { getBookingStatus } from '../utils/booking.js';

const router = express.Router();
router.use(requireAuth, requireAdmin);

const handleAdminError = (res, error) => {
  console.error('Admin route error:', error);
  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
  }
  return res.status(500).json({ success: false, message: 'Admin request failed', detail: error.message });
};

router.post('/rooms', async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, message: 'Room created', data: room });
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.put('/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, message: 'Room updated', data: room });
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.delete('/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, message: 'Room deactivated', data: room });
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (status === 'cancelled') {
        query.status = 'cancelled';
      } else if (status === 'completed') {
        query.status = { $ne: 'cancelled' };
        query.checkOut = { $lt: today };
      } else if (status === 'upcoming') {
        query.status = { $ne: 'cancelled' };
        query.checkIn = { $gt: today };
      } else if (status === 'active') {
        query.status = { $ne: 'cancelled' };
        query.checkIn = { $lte: today };
        query.checkOut = { $gte: today };
      }
    }

    let bookings = await Booking.find(query)
      .populate('room', 'name type price')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    if (search) {
      const term = search.toLowerCase();
      bookings = bookings.filter(
        (b) =>
          String(b._id).includes(term) ||
          b.room?.name?.toLowerCase().includes(term) ||
          b.user?.name?.toLowerCase().includes(term) ||
          b.user?.email?.toLowerCase().includes(term),
      );
    }
    
    const mappedBookings = bookings.map(b => {
      const obj = b.toObject();
      obj.status = getBookingStatus(obj.checkIn, obj.checkOut, obj.status);
      return obj;
    });

    const total = mappedBookings.length;
    const globalTotal = await Booking.countDocuments();
    const start = (Number(page) - 1) * Number(limit);
    const paginated = mappedBookings.slice(start, start + Number(limit));

    res.json({ success: true, data: paginated, total, globalTotal, page: Number(page), limit: Number(limit) });
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.patch('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, message: 'Booking updated', data: booking });
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.get('/reviews', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const reviews = await Review.find(query)
      .populate('room', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.patch('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review updated', data: review });
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.post('/offers', async (req, res) => {
  try {
    const offerData = { ...req.body };
    if (!offerData.validFrom) offerData.validFrom = new Date();
    if (!offerData.validTo) offerData.validTo = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    if (offerData.code) offerData.code = String(offerData.code).toUpperCase();
    const offer = await Offer.create(offerData);
    res.status(201).json({ success: true, message: 'Offer created', data: offer });
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.put('/offers/:id', async (req, res) => {
  try {
    const update = { ...req.body };
    if (!update.validFrom) update.validFrom = new Date();
    if (!update.validTo) update.validTo = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    if (update.code) update.code = String(update.code).toUpperCase();
    const offer = await Offer.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.json({ success: true, message: 'Offer updated', data: offer });
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.delete('/offers/:id', async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.json({ success: true, message: 'Offer deactivated', data: offer });
  } catch (error) {
    handleAdminError(res, error);
  }
});

router.get('/analytics', async (_req, res) => {
  try {
    const now = new Date();
    const [totalBookings, revenueAgg, reviewStatusAgg, rooms, activeBookings, avgRatingAgg] = await Promise.all([
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Review.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Room.find({ isActive: true }),
      Booking.countDocuments({ status: { $ne: 'cancelled' }, checkIn: { $lte: now }, checkOut: { $gt: now } }),
      Review.aggregate([
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]),
    ]);

    const totalUnits = rooms.reduce((sum, room) => sum + (room.totalUnits || 1), 0);
    const occupancyRate = totalUnits ? Math.round((activeBookings / totalUnits) * 100) : 0;

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyAgg = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          bookings: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = monthlyAgg.map((m) => ({
      month: monthNames[m._id.month - 1],
      bookings: m.bookings,
      revenue: Math.round(m.revenue / 1000), 
    }));

    const topRoomsAgg = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$room', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'rooms', localField: '_id', foreignField: '_id', as: 'room' } },
      { $unwind: '$room' },
      { $project: { name: '$room.name', count: 1, revenue: { $multiply: ['$count', '$room.price'] } } },
    ]);

    res.json({
      success: true,
      data: {
        totalBookings,
        revenue: revenueAgg[0]?.total || 0,
        activeBookings,
        roomsCount: rooms.length,
        occupancyRate,
        averageRating: avgRatingAgg[0]?.avg ? Math.round(avgRatingAgg[0].avg * 10) / 10 : 0,
        reviewStatus: reviewStatusAgg,
        monthlyData,
        topRooms: topRoomsAgg,
      },
    });
  } catch (error) {
    handleAdminError(res, error);
  }
});

export default router;

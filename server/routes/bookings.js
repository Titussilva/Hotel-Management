import express from 'express';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import { body, validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import Offer from '../models/Offer.js';
import Room from '../models/Room.js';
import Notification from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';
import { bookedUnitsForRoom, calculateDiscount, nightsBetween, getBookingStatus } from '../utils/booking.js';
import { sendBookingEmail } from '../utils/mailer.js';

const router = express.Router();

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

router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { user: req.user._id };
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
        query.checkOut = { $gte: today };
      }
    }

    let bookings = await Booking.find(query).populate('room').sort({ checkIn: -1 });

    if (search) {
      const term = search.toLowerCase();
      bookings = bookings.filter(
        (b) =>
          String(b._id).includes(term) ||
          b.room?.name?.toLowerCase().includes(term),
      );
    }
    
    const mappedBookings = bookings.map(b => {
      const obj = b.toObject();
      obj.status = getBookingStatus(obj.checkIn, obj.checkOut, obj.status);
      return obj;
    });

    res.json({ success: true, data: mappedBookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not load bookings', detail: error.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
      .populate('room')
      .populate('user', 'name email');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    const obj = booking.toObject();
    obj.status = getBookingStatus(obj.checkIn, obj.checkOut, obj.status);
    res.json({ success: true, data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not load booking', detail: error.message });
  }
});

router.post(
  '/',
  requireAuth,
  [
    body('roomId').notEmpty().withMessage('Room is required'),
    body('checkIn').isISO8601().withMessage('Check-in date is required'),
    body('checkOut').isISO8601().withMessage('Check-out date is required'),
    body('guests').isInt({ min: 1 }).withMessage('At least 1 guest is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  ],
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    try {
      const { roomId, checkIn, checkOut, guests, guestDetails, specialRequests, offerCode, paymentMethod, emailTo } =
        req.body;

      if (req.user.role === 'admin') {
        return res.status(403).json({ success: false, message: 'Admins cannot create reservations' });
      }

      if (!mongoose.isValidObjectId(roomId)) {
        return res.status(400).json({ success: false, message: 'Select a real room from the database before booking' });
      }

      if (new Date(checkIn) >= new Date(checkOut)) {
        return res.status(400).json({ success: false, message: 'Check-out must be after check-in' });
      }

      if (new Date(checkIn) < new Date(new Date().setHours(0,0,0,0))) {
        return res.status(400).json({ success: false, message: 'Check-in date cannot be in the past' });
      }

      const room = await Room.findById(roomId);
      if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
      if (guests > room.maxGuests) {
        return res.status(400).json({ success: false, message: `Room capacity is ${room.maxGuests} guests` });
      }

      const nights = nightsBetween(checkIn, checkOut);
      if (!nights) return res.status(400).json({ success: false, message: 'Check-out must be after check-in' });

      const booked = await bookedUnitsForRoom(room._id, checkIn, checkOut);
      if (booked >= room.totalUnits) {
        return res.status(409).json({ success: false, message: 'Room is not available for those dates' });
      }

      const existingBooking = await Booking.findOne({
        user: req.user._id,
        room: room._id,
        status: { $ne: 'cancelled' },
        $or: [
          { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
        ]
      });

      if (existingBooking) {
        return res.status(409).json({ success: false, message: 'You already have a booking for this room during these dates' });
      }

      const offer = offerCode ? await Offer.findOne({ code: String(offerCode).toUpperCase() }) : null;
      const subtotal = room.price * nights;
      const discount = calculateDiscount(offer, subtotal, nights);
      const total = subtotal - discount;

      const booking = await Booking.create({
        user: req.user._id,
        room: room._id,
        checkIn,
        checkOut,
        guests,
        guestDetails,
        specialRequests,
        offerCode: offer?.code,
        subtotal,
        discount,
        total,
        paymentMethod: paymentMethod || 'pay_by_email',
        paymentStatus: 'pending',
      });

      const recipient = emailTo || guestDetails?.email || req.user.email;
      const emailResult = await sendBookingEmail({ booking, room, user: req.user, recipient });

      await Notification.insertMany([
        {
          user: req.user._id,
          type: 'booking',
          title: 'Booking request saved',
          message: `${room.name} booking from ${new Date(checkIn).toLocaleDateString()} to ${new Date(checkOut).toLocaleDateString()}.`,
          channel: 'in_app',
        },
        {
          user: req.user._id,
          type: 'payment',
          title: emailResult.sent ? 'Booking email sent' : 'Booking email pending',
          message: emailResult.sent
            ? `Booking details sent to ${emailResult.to}.`
            : `Booking saved. Configure email to send automatically.`,
          channel: 'email',
        },
      ]);

      const populatedBooking = await booking.populate('room');
      const obj = populatedBooking.toObject();
      obj.status = getBookingStatus(obj.checkIn, obj.checkOut, obj.status);
      res.status(201).json({ success: true, message: 'Booking created', data: { ...obj, emailResult } });
    } catch (error) {
      console.error('Booking creation failed:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: 'Booking validation failed', detail: error.message });
      }
      res.status(500).json({ success: false, message: 'Booking could not be created', detail: error.message });
    }
  },
);

router.patch('/:id/cancel', requireAuth, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Administrators cannot cancel reservations' });
    }

    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    if (booking.paymentStatus === 'paid' && booking.razorpayPaymentId) {
      try {
        const key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
        const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
        if (key_id && key_secret) {
          const rzp = new Razorpay({ key_id, key_secret });
          const refund = await rzp.payments.refund(booking.razorpayPaymentId, {
            amount: Math.round((booking.total || 0) * 100)
          });
          booking.refundId = refund.id;
          booking.paymentStatus = 'refunded';
        } else {
          console.warn('[bookings] Razorpay keys missing, skipping actual refund API call');
          booking.paymentStatus = 'refunded';
        }
      } catch (refundError) {
        console.error('[bookings] Refund failed:', refundError);
        return res.status(500).json({ success: false, message: 'Refund failed', detail: refundError.message || 'Razorpay refund error' });
      }
    } else if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
    }

    booking.status = 'cancelled';
    await booking.save();

    await Notification.create({
      user: req.user._id,
      type: 'booking',
      title: 'Booking cancelled',
      message: `Your booking has been cancelled. ${booking.paymentStatus === 'refunded' ? 'Refund is being processed.' : ''}`,
      channel: 'in_app',
    });

    res.json({ success: true, message: 'Booking cancelled', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Cancellation failed', detail: error.message });
  }
});

export default router;

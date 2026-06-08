import crypto from 'crypto';
import express from 'express';
import Razorpay from 'razorpay';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import Offer from '../models/Offer.js';
import Room from '../models/Room.js';
import { requireAuth } from '../middleware/auth.js';
import {
  bookedUnitsForRoom,
  calculateDiscount,
  nightsBetween,
} from '../utils/booking.js';
import { sendBookingEmail } from '../utils/mailer.js';

const router = express.Router();

function getRazorpay() {
  const key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (!key_id || !key_secret) {
    console.warn('[payments] Razorpay keys missing');
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

function rzpErrorMessage(e) {
  if (!e) return 'Unknown Razorpay error';

  if (e instanceof Error) return e.message;

  if (e.error?.description) {
    return e.error.description;
  }

  return 'Razorpay request failed';
}

// CREATE ORDER
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    const {
      roomId,
      checkIn,
      checkOut,
      guests,
      offerCode,
    } = req.body;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        message: 'Room not found',
      });
    }

    if (guests > room.maxGuests) {
      return res.status(400).json({
        message: 'Guest count exceeds room capacity',
      });
    }

    const nights = nightsBetween(checkIn, checkOut);

    if (!nights) {
      return res.status(400).json({
        message: 'Invalid dates',
      });
    }

    const booked = await bookedUnitsForRoom(
      room._id,
      checkIn,
      checkOut
    );

    if (booked >= room.totalUnits) {
      return res.status(409).json({
        message: 'Room unavailable',
      });
    }

    const offer = offerCode
      ? await Offer.findOne({
          code: String(offerCode).toUpperCase(),
        })
      : null;

    const subtotal = room.price * nights;
    const discount = calculateDiscount(
      offer,
      subtotal,
      nights
    );

    const total = subtotal - discount;

    const rzp = getRazorpay();

    if (!rzp) {
      return res.status(503).json({
        message: 'Razorpay not configured',
      });
    }

    const order = await rzp.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      total,
      subtotal,
      discount,
      keyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error('[payments] create-order', err);

    return res.status(500).json({
      message: rzpErrorMessage(err),
    });
  }
});

// VERIFY PAYMENT
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      roomId,
      checkIn,
      checkOut,
      guests,
      guestDetails,
      specialRequests,
      offerCode,
      paymentMethod,
      emailTo,
      total,
      subtotal,
      discount,
    } = req.body;

    const secret =
      process.env.RAZORPAY_KEY_SECRET || '';

    const expected = crypto
      .createHmac('sha256', secret)
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({
        message: 'Payment verification failed',
      });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        message: 'Room not found',
      });
    }

    const booking = await Booking.create({
      user: req.user._id,
      room: room._id,
      checkIn,
      checkOut,
      guests,
      guestDetails,
      specialRequests,
      offerCode,
      subtotal,
      discount,
      total,
      paymentMethod:
        paymentMethod || 'card',
      paymentStatus: 'paid',
      razorpayOrderId:
        razorpay_order_id,
      razorpayPaymentId:
        razorpay_payment_id,
    });

    console.log(
      '[payments] booking saved:',
      booking._id
    );

    const recipient =
      emailTo ||
      guestDetails?.email ||
      req.user.email;

    console.log(
      '[payments] EMAIL START →',
      recipient
    );

    let emailResult;

    try {
      emailResult =
        await sendBookingEmail({
          booking,
          room,
          user: req.user,
          recipient,
        });

      console.log(
        '[payments] EMAIL RESULT',
        emailResult
      );

    } catch (mailErr) {
      console.error(
        '[payments] EMAIL ERROR',
        mailErr
      );

      emailResult = {
        sent: false,
        reason: mailErr.message,
      };
    }

    await Notification.insertMany([
      {
        user: req.user._id,
        type: 'booking',
        channel: 'in_app',
        title: 'Booking confirmed',
        message: `${room.name} confirmed`,
      },
      {
        user: req.user._id,
        type: 'payment',
        channel: 'email',
        title: 'Payment successful',
        message: `Payment ID: ${razorpay_payment_id}`,
      },
    ]);

    const populated =
      await booking.populate('room');

    return res.status(201).json({
      ...populated.toObject(),
      emailResult,
    });

  } catch (error) {
    console.error(
      '[payments] verify error',
      error
    );

    return res.status(500).json({
      message:
        'Booking could not be saved',
      detail: error.message,
    });
  }
});

export default router;
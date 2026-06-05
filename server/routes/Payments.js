import crypto from 'crypto';
import express from 'express';
import Razorpay from 'razorpay';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import Offer from '../models/Offer.js';
import Room from '../models/Room.js';
import { requireAuth } from '../middleware/auth.js';
import { bookedUnitsForRoom, calculateDiscount, nightsBetween } from '../utils/booking.js';
import { sendBookingEmail } from '../utils/mailer.js';

const router = express.Router();

function getRazorpay() {
  const key_id     = (process.env.RAZORPAY_KEY_ID     || '').trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  if (!key_id || !key_secret) {
    console.warn('[payments] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing from .env');
    return null;
  }
  console.log('[payments] using key:', key_id);
  return new Razorpay({ key_id, key_secret });
}

// Normalize Razorpay SDK errors (they throw plain objects, not Error instances)
function rzpErrorMessage(e) {
  if (!e) return 'Unknown Razorpay error';
  if (e instanceof Error) return e.message;
  const code = e.statusCode;
  if (code === 401 || code === 403) {
    return `Razorpay authentication failed (HTTP ${code}). Your API keys are invalid or deactivated. ` +
           `Go to https://dashboard.razorpay.com → Settings → API Keys → Generate Test Key and update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env, then restart the server.`;
  }
  if (e.error?.description) return e.error.description;
  if (e.error?.field)       return `Validation error on field: ${e.error.field}`;
  return `Razorpay error (HTTP ${code || 'unknown'})`;
}

// POST /api/payments/create-order
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests, guestDetails, specialRequests, offerCode } = req.body;

    console.log('[payments] create-order –', { roomId, checkIn, checkOut, guests });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (guests > room.maxGuests) return res.status(400).json({ message: 'Guest count exceeds room capacity' });

    const nights = nightsBetween(checkIn, checkOut);
    if (!nights) return res.status(400).json({ message: 'Check-out must be after check-in' });

    const booked = await bookedUnitsForRoom(room._id, checkIn, checkOut);
    if (booked >= room.totalUnits) return res.status(409).json({ message: 'Room is not available for those dates' });

    const offer    = offerCode ? await Offer.findOne({ code: String(offerCode).toUpperCase() }) : null;
    const subtotal = room.price * nights;
    const discount = calculateDiscount(offer, subtotal, nights);
    const total    = subtotal - discount;

    const rzp = getRazorpay();
    if (!rzp) {
      return res.status(503).json({
        message: 'Payment gateway not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env and restart.',
      });
    }

    // amount is in paise (INR × 100)
    const amountPaise = Math.round(total * 100);
    console.log('[payments] creating Razorpay order – amount (paise):', amountPaise);

    let order;
    try {
      order = await rzp.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: { userId: String(req.user._id), roomId: String(room._id) },
      });
    } catch (rzpErr) {
      const msg = rzpErrorMessage(rzpErr);
      console.error('[payments] Razorpay orders.create failed:', msg);
      // Return 503 for key issues so frontend shows a clear message
      const httpStatus = (rzpErr?.statusCode === 401 || rzpErr?.statusCode === 403) ? 503 : 502;
      return res.status(httpStatus).json({ message: msg });
    }

    console.log('[payments] order created:', order.id);

    res.json({
      orderId:   order.id,
      amount:    amountPaise,
      currency:  'INR',
      keyId:     (process.env.RAZORPAY_KEY_ID || '').trim(),
      total,
      subtotal,
      discount,
      offerCode: offer?.code,
    });
  } catch (error) {
    console.error('[payments] create-order unexpected error:', error);
    res.status(500).json({ message: 'Could not create payment order', detail: error.message });
  }
});

// POST /api/payments/verify
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      roomId, checkIn, checkOut, guests, guestDetails,
      specialRequests, offerCode, paymentMethod, emailTo,
      total, subtotal, discount,
    } = req.body;

    console.log('[payments] verify –', { razorpay_order_id, razorpay_payment_id });

    // Verify HMAC-SHA256 signature
    const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      console.warn('[payments] signature mismatch');
      return res.status(400).json({ message: 'Payment verification failed. Signature mismatch.' });
    }
    console.log('[payments] signature verified ✓');

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const booking = await Booking.create({
      user: req.user._id,
      room: room._id,
      checkIn, checkOut, guests, guestDetails, specialRequests,
      offerCode, subtotal,
      discount: discount || 0,
      total,
      paymentMethod:    paymentMethod || 'card',
      paymentStatus:    'paid',
      razorpayOrderId:  razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    console.log('[payments] booking saved:', booking._id, '– paymentStatus: paid');

    const recipient  = emailTo || guestDetails?.email || req.user.email;
    const emailResult = await sendBookingEmail({ booking, room, user: req.user, recipient });

    await Notification.insertMany([
      {
        user: req.user._id, type: 'booking', channel: 'in_app',
        title: 'Booking confirmed',
        message: `${room.name} confirmed from ${new Date(checkIn).toLocaleDateString()} to ${new Date(checkOut).toLocaleDateString()}.`,
      },
      {
        user: req.user._id, type: 'payment', channel: 'email',
        title: 'Payment successful',
        message: `₹${total.toLocaleString('en-IN')} paid via Razorpay. ID: ${razorpay_payment_id}`,
      },
    ]);

    const populated = await booking.populate('room');
    res.status(201).json({ ...populated.toObject(), emailResult });
  } catch (error) {
    console.error('[payments] verify error:', error.message);
    res.status(500).json({ message: 'Booking could not be saved after payment', detail: error.message });
  }
});

export default router;
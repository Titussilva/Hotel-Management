import express from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Offer from '../models/Offer.js';
import Room from '../models/Room.js';
import Notification from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';
import { bookedUnitsForRoom, calculateDiscount, nightsBetween } from '../utils/booking.js';
import { sendBookingEmail } from '../utils/mailer.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate('room').sort({ checkIn: -1 });
  res.json(bookings);
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests, guestDetails, specialRequests, offerCode, paymentMethod, emailTo } = req.body;
    if (!mongoose.isValidObjectId(roomId)) {
      return res.status(400).json({ message: 'Select a real room from the database before booking' });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (guests > room.maxGuests) return res.status(400).json({ message: 'Guest count exceeds room capacity' });

    const nights = nightsBetween(checkIn, checkOut);
    if (!nights) return res.status(400).json({ message: 'Check-out must be after check-in' });

    const booked = await bookedUnitsForRoom(room._id, checkIn, checkOut);
    if (booked >= room.totalUnits) return res.status(409).json({ message: 'Room is not available for those dates' });

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

    const confirmationMessage = `${room.name} booking request is saved from ${new Date(checkIn).toLocaleDateString()} to ${new Date(checkOut).toLocaleDateString()}.`;
    const recipient = emailTo || guestDetails?.email || req.user.email;
    const emailResult = await sendBookingEmail({
      booking,
      room,
      user: req.user,
      recipient,
    });

    await Notification.insertMany([
    {
      user: req.user._id,
      type: 'booking',
      title: 'Booking request saved',
      message: confirmationMessage,
      channel: 'in_app',
    },
    {
      user: req.user._id,
      type: 'payment',
      title: emailResult.sent ? 'Booking email sent' : 'Booking email pending',
      message: emailResult.sent
        ? `Booking details sent to ${emailResult.to}.`
        : `Booking saved. Configure Gmail SMTP to send emails automatically.`,
      channel: 'email',
    },
    {
      user: req.user._id,
      type: 'reminder',
      title: 'Upcoming reservation reminder',
      message: `Reminder scheduled for your ${room.name} stay on ${new Date(checkIn).toLocaleDateString()}.`,
      channel: 'sms',
    },
  ]);

    const populatedBooking = await booking.populate('room');
    res.status(201).json({ ...populatedBooking.toObject(), emailResult });
  } catch (error) {
    console.error('Booking creation failed:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Booking validation failed', detail: error.message });
    }
    res.status(500).json({ message: 'Booking could not be created', detail: error.message });
  }
});

router.patch('/:id/cancel', requireAuth, async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  booking.status = 'cancelled';
  if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded';
  await booking.save();

  res.json(booking);
});

export default router;

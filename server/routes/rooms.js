import express from 'express';
import mongoose from 'mongoose';
import Room from '../models/Room.js';
import Review from '../models/Review.js';
import { bookedUnitsForRoom } from '../utils/booking.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { type, minPrice, maxPrice, amenities, checkIn, checkOut, guests } = req.query;
const query = { isActive: { $ne: false } };
  if (type) query.type = type;
  if (guests) query.maxGuests = { $gte: Number(guests) };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (amenities) query.amenities = { $all: String(amenities).split(',') };

  const rooms = await Room.find(query).sort({ price: 1 });
  const withAvailability = await Promise.all(
    rooms.map(async (room) => {
      let availableUnits = room.totalUnits;
      if (checkIn && checkOut) {
        const booked = await bookedUnitsForRoom(room._id, checkIn, checkOut);
        availableUnits = Math.max(0, room.totalUnits - booked);
      }
      return { ...room.toObject(), availableUnits, availabilityStatus: availableUnits > 0 ? 'Available' : 'Sold out' };
    }),
  );

  res.json(withAvailability);
});

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ message: 'Room not found' });

  const reviews = await Review.find({ room: room._id, status: 'approved' })
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.json({ room, reviews });
});

router.get('/:id/availability', async (req, res) => {
  const { checkIn, checkOut } = req.query;
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (!checkIn || !checkOut) return res.status(400).json({ message: 'Check-in and check-out dates are required' });

  const booked = await bookedUnitsForRoom(room._id, checkIn, checkOut);
  const availableUnits = Math.max(0, room.totalUnits - booked);

  res.json({ roomId: room._id, availableUnits, available: availableUnits > 0 });
});

export default router;

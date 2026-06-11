import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import authRoutes from '../routes/auth.js';
import roomRoutes from '../routes/rooms.js';
import bookingRoutes from '../routes/bookings.js';
import reviewRoutes from '../routes/reviews.js';
import offerRoutes from '../routes/offers.js';
import adminRoutes from '../routes/admin.js';
import notificationRoutes from '../routes/notifications.js';
import paymentRoutes from '../routes/payments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvIfNeeded() {
  const candidates = [
    path.resolve(__dirname, '.env'),
    path.resolve(__dirname, '..', '.env'),
    path.resolve(__dirname, '..', '..', '.env'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      dotenv.config({ path: candidate });
      return { loaded: true, source: candidate };
    }
  }
  const res = dotenv.config();
  return { loaded: !!res.parsed, source: res.error ? 'default' : 'env' };
}

const envLoadResult = loadEnvIfNeeded();
console.log('[dotenv] load result:', envLoadResult);

const _gmailConfigured =
  !!(process.env.GMAIL_USER || '').trim() &&
  !!(process.env.GMAIL_APP_PASSWORD || '').trim() &&
  !(process.env.GMAIL_APP_PASSWORD || '').includes('replace_me');
console.log(`[dotenv] Gmail credentials ${_gmailConfigured ? 'DETECTED ✓' : 'NOT FOUND ✗'} (GMAIL_USER=${(process.env.GMAIL_USER || '(empty)').trim()})`);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: function(origin, callback) {
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'hotel-booking-system' });
});

app.get('/api/seed', async (_req, res) => {
  try {
    const Room = (await import('../models/Room.js')).default;
    const User = (await import('../models/User.js')).default;
    const Offer = (await import('../models/Offer.js')).default;
    const bcrypt = (await import('bcryptjs')).default;

    await Room.deleteMany({});
    await User.deleteMany({});
    await Offer.deleteMany({});

    const password = await bcrypt.hash('password123', 10);
    await User.create([
      { name: 'Ava Stone', email: 'guest@stayease.test', password, phone: '+1 555 0101' },
      { name: 'Morgan Admin', email: 'admin@stayease.test', password, role: 'admin' },
    ]);

    await Room.create([
  { name: 'Marine Drive King Suite', type: 'Suite', price: 18500, totalUnits: 4, maxGuests: 3, size: '540 sq ft', bedType: 'King bed', view: 'Sea and skyline', isActive: true, description: 'A spacious suite with Arabian Sea views, a deep soaking tub, lounge seating, and evening turndown service.', images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'], amenities: ['Wi-Fi', 'Breakfast', 'Bathtub', 'Workspace', 'Mini bar'] },
  { name: 'Garden Deluxe Room', type: 'Deluxe', price: 9200, totalUnits: 8, maxGuests: 2, size: '360 sq ft', bedType: 'Queen bed', view: 'Courtyard garden', isActive: true, description: 'Calm garden-facing room with warm timber finishes, blackout curtains, and a rain shower.', images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'], amenities: ['Wi-Fi', 'Breakfast', 'Rain shower', 'Smart TV'] },
  { name: 'Family Terrace Room', type: 'Family', price: 12800, totalUnits: 5, maxGuests: 4, size: '470 sq ft', bedType: 'Two queen beds', view: 'City terrace', isActive: true, description: 'Flexible family room with two beds, a private terrace, dining nook, and extra storage.', images: ['https://images.unsplash.com/photo-1598928636135-d146006ff4be?auto=format&fit=crop&w=1200&q=80'], amenities: ['Wi-Fi', 'Kitchenette', 'Terrace', 'Crib on request'] },
  { name: 'Business Club Room', type: 'Business', price: 11200, totalUnits: 6, maxGuests: 2, size: '390 sq ft', bedType: 'King bed', view: 'Business district', isActive: true, description: 'Quiet upper-floor room with ergonomic workspace, express laundry, and club lounge access.', images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'], amenities: ['Wi-Fi', 'Breakfast', 'Club lounge', 'Workspace'] },
  { name: 'Lake View Premium Room', type: 'Premium', price: 14500, totalUnits: 5, maxGuests: 2, size: '420 sq ft', bedType: 'King bed', view: 'Lake', isActive: true, description: 'Bright room overlooking the lake with plush bedding, reading chair, and smart climate control.', images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'], amenities: ['Wi-Fi', 'Breakfast', 'Lake view', 'Smart TV'] },
  { name: 'Heritage Courtyard Room', type: 'Heritage', price: 10800, totalUnits: 7, maxGuests: 2, size: '350 sq ft', bedType: 'Queen bed', view: 'Heritage courtyard', isActive: true, description: 'Character-rich room with carved wood details, courtyard seating, and modern bath fittings.', images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'], amenities: ['Wi-Fi', 'Breakfast', 'Courtyard access', 'Tea service'] },
  { name: 'Executive Twin Room', type: 'Executive', price: 9800, totalUnits: 8, maxGuests: 2, size: '365 sq ft', bedType: 'Twin beds', view: 'City', isActive: true, description: 'Smart twin room for colleagues or friends with a work desk, fast Wi-Fi, and city access.', images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'], amenities: ['Wi-Fi', 'Breakfast', 'Workspace', 'Laundry'] },
  { name: 'Presidential Suite', type: 'Suite', price: 42000, totalUnits: 2, maxGuests: 4, size: '980 sq ft', bedType: 'King bed', view: 'Panoramic skyline', isActive: true, description: 'Signature suite with living and dining areas, private butler support, pantry, and panoramic views.', images: ['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'], amenities: ['Wi-Fi', 'Breakfast', 'Butler', 'Dining room', 'Jacuzzi'] },
  { name: 'Poolside Cabana Room', type: 'Cabana', price: 15600, totalUnits: 5, maxGuests: 3, size: '430 sq ft', bedType: 'King bed', view: 'Pool', isActive: true, description: 'Ground-floor room with direct pool access, outdoor loungers, and breezy resort styling.', images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'], amenities: ['Wi-Fi', 'Breakfast', 'Pool access', 'Balcony'] },
  { name: 'Compact Solo Room', type: 'Standard', price: 6200, totalUnits: 10, maxGuests: 1, size: '240 sq ft', bedType: 'Single bed', view: 'Atrium', isActive: true, description: 'Efficient room for solo travellers with a comfortable single bed, desk, and all essentials.', images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'], amenities: ['Wi-Fi', 'Smart TV', 'Workspace'] },
  { name: 'Airport Transit Room', type: 'Standard', price: 7400, totalUnits: 12, maxGuests: 2, size: '285 sq ft', bedType: 'Queen bed', view: 'Runway side', isActive: true, description: 'Practical stay near the airport with blackout curtains, quick room service, and shuttle support.', images: ['https://images.unsplash.com/photo-1551776235-dde6d482980b?auto=format&fit=crop&w=1200&q=80'], amenities: ['Wi-Fi', 'Airport shuttle', 'Blackout curtains', 'Room service'] },
  { name: 'Spa Retreat Room', type: 'Wellness', price: 16800, totalUnits: 4, maxGuests: 2, size: '455 sq ft', bedType: 'King bed', view: 'Spa garden', isActive: true, description: 'Restful wellness room with aromatherapy, yoga mat, soaking bath, and spa credit.', images: ['https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1200&q=80'], amenities: ['Wi-Fi', 'Breakfast', 'Spa credit', 'Bathtub', 'Yoga mat'] },
  { name: 'Two Bedroom Residence', type: 'Family', price: 24500, totalUnits: 3, maxGuests: 5, size: '760 sq ft', bedType: 'King and twin beds', view: 'Neighbourhood', isActive: true, description: 'Apartment-style residence with two bedrooms, kitchenette, dining area, and washer dryer.', images: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'], amenities: ['Wi-Fi', 'Kitchenette', 'Washer dryer', 'Dining area'] },
]);

    await Offer.create([
      { code: 'WEEKEND20', title: 'Weekend escape', description: 'Save 20% on two-night stays.', discountType: 'percentage', discountValue: 20, minStayNights: 2, validFrom: new Date('2026-01-01'), validTo: new Date('2026-12-31'), active: true },
      { code: 'WELCOME2500', title: 'First stay credit', description: 'Rs. 2,500 off your first booking.', discountType: 'fixed', discountValue: 2500, minStayNights: 1, validFrom: new Date('2026-01-01'), validTo: new Date('2026-12-31'), active: true },
    ]);

    res.json({ ok: true, message: 'Seed complete' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_booking_system')
  .then(async () => {
    try {
      const Booking = (await import('../models/Booking.js')).default;
      const result = await Booking.updateMany({ guests: { $lt: 1 } }, { $set: { guests: 1 } });
      if (result.modifiedCount > 0) {
        console.log(`[migration] Fixed ${result.modifiedCount} bookings with negative/zero guests`);
      }
    } catch (err) {
      console.error('[migration] Failed to update guest counts:', err.message);
    }

    app.listen(port, () => {
      console.log(`Hotel booking API running on http://127.0.0.1:${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed (sandbox mode):', error.message);
    app.listen(port, () => {
      console.log(`Hotel booking API running (without DB) on http://127.0.0.1:${port}`);
    });
  });
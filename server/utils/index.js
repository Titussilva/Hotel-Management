import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';


// Ensure .env is loaded even if the process cwd differs.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function loadEnvIfNeeded() {
  // Do NOT short-circuit: always attempt to load .env so all variables
  // (not just the two Gmail ones) are merged in from the file.
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

// Log Gmail credential presence immediately after .env is loaded.
const _gmailConfigured =
  !!(process.env.GMAIL_USER || '').trim() &&
  !!(process.env.GMAIL_APP_PASSWORD || '').trim() &&
  !(process.env.GMAIL_APP_PASSWORD || '').includes('replace_me');
console.log(`[dotenv] Gmail credentials ${_gmailConfigured ? 'DETECTED ✓' : 'NOT FOUND ✗'} (GMAIL_USER=${(process.env.GMAIL_USER || '(empty)').trim()})`);
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
  .then(() => {
    app.listen(port, () => {
      console.log(`Hotel booking API running on http://127.0.0.1:${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
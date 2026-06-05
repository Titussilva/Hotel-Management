import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import Offer from './models/Offer.js';
import Review from './models/Review.js';
import Room from './models/Room.js';
import User from './models/User.js';
import Notification from './models/Notification.js';

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_booking_system');

await Promise.all([
  Booking.deleteMany({}),
  Notification.deleteMany({}),
  Review.deleteMany({}),
  Offer.deleteMany({}),
  Room.deleteMany({}),
  User.deleteMany({}),
]);

const password = await bcrypt.hash('password123', 10);
const [guest, admin] = await User.create([
  { name: 'Ava Stone', email: 'guest@stayease.test', password, phone: '+1 555 0101' },
  { name: 'Morgan Admin', email: 'admin@stayease.test', password, role: 'admin' },
]);

const rooms = await Room.create([
  {
    name: 'Marine Drive King Suite',
    type: 'Suite',
    description: 'A spacious suite with Arabian Sea views, a deep soaking tub, lounge seating, and evening turndown service.',
    images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'],
    price: 18500,
    size: '540 sq ft',
    bedType: 'King bed',
    view: 'Sea and skyline',
    maxGuests: 3,
    amenities: ['Wi-Fi', 'Breakfast', 'Bathtub', 'Workspace', 'Mini bar'],
    totalUnits: 4,
  },
  {
    name: 'Garden Deluxe Room',
    type: 'Deluxe',
    description: 'Calm garden-facing room with warm timber finishes, blackout curtains, and a rain shower.',
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'],
    price: 9200,
    size: '360 sq ft',
    bedType: 'Queen bed',
    view: 'Courtyard garden',
    maxGuests: 2,
    amenities: ['Wi-Fi', 'Breakfast', 'Rain shower', 'Smart TV'],
    totalUnits: 8,
  },
  {
    name: 'Family Terrace Room',
    type: 'Family',
    description: 'Flexible family room with two beds, a private terrace, dining nook, and extra storage.',
    images: ['https://images.unsplash.com/photo-1598928636135-d146006ff4be?auto=format&fit=crop&w=1200&q=80'],
    price: 12800,
    size: '470 sq ft',
    bedType: 'Two queen beds',
    view: 'City terrace',
    maxGuests: 4,
    amenities: ['Wi-Fi', 'Kitchenette', 'Terrace', 'Crib on request'],
    totalUnits: 5,
  },
  {
    name: 'Business Club Room',
    type: 'Business',
    description: 'Quiet upper-floor room with ergonomic workspace, express laundry, and club lounge access.',
    images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'],
    price: 11200,
    size: '390 sq ft',
    bedType: 'King bed',
    view: 'Business district',
    maxGuests: 2,
    amenities: ['Wi-Fi', 'Breakfast', 'Club lounge', 'Workspace'],
    totalUnits: 6,
  },
  {
    name: 'Lake View Premium Room',
    type: 'Premium',
    description: 'Bright room overlooking the lake with plush bedding, reading chair, and smart climate control.',
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'],
    price: 14500,
    size: '420 sq ft',
    bedType: 'King bed',
    view: 'Lake',
    maxGuests: 2,
    amenities: ['Wi-Fi', 'Breakfast', 'Lake view', 'Smart TV'],
    totalUnits: 5,
  },
  {
    name: 'Heritage Courtyard Room',
    type: 'Heritage',
    description: 'Character-rich room with carved wood details, courtyard seating, and modern bath fittings.',
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'],
    price: 10800,
    size: '350 sq ft',
    bedType: 'Queen bed',
    view: 'Heritage courtyard',
    maxGuests: 2,
    amenities: ['Wi-Fi', 'Breakfast', 'Courtyard access', 'Tea service'],
    totalUnits: 7,
  },
  {
    name: 'Executive Twin Room',
    type: 'Executive',
    description: 'Smart twin room for colleagues or friends with a work desk, fast Wi-Fi, and city access.',
    images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'],
    price: 9800,
    size: '365 sq ft',
    bedType: 'Twin beds',
    view: 'City',
    maxGuests: 2,
    amenities: ['Wi-Fi', 'Breakfast', 'Workspace', 'Laundry'],
    totalUnits: 8,
  },
  {
    name: 'Presidential Suite',
    type: 'Suite',
    description: 'Signature suite with living and dining areas, private butler support, pantry, and panoramic views.',
    images: ['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'],
    price: 42000,
    size: '980 sq ft',
    bedType: 'King bed',
    view: 'Panoramic skyline',
    maxGuests: 4,
    amenities: ['Wi-Fi', 'Breakfast', 'Butler', 'Dining room', 'Jacuzzi'],
    totalUnits: 2,
  },
  {
    name: 'Poolside Cabana Room',
    type: 'Cabana',
    description: 'Ground-floor room with direct pool access, outdoor loungers, and breezy resort styling.',
    images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'],
    price: 15600,
    size: '430 sq ft',
    bedType: 'King bed',
    view: 'Pool',
    maxGuests: 3,
    amenities: ['Wi-Fi', 'Breakfast', 'Pool access', 'Balcony'],
    totalUnits: 5,
  },
  {
    name: 'Compact Solo Room',
    type: 'Standard',
    description: 'Efficient room for solo travellers with a comfortable single bed, desk, and all essentials.',
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'],
    price: 6200,
    size: '240 sq ft',
    bedType: 'Single bed',
    view: 'Atrium',
    maxGuests: 1,
    amenities: ['Wi-Fi', 'Smart TV', 'Workspace'],
    totalUnits: 10,
  },
  {
    name: 'Airport Transit Room',
    type: 'Standard',
    description: 'Practical stay near the airport with blackout curtains, quick room service, and shuttle support.',
    images: ['https://images.unsplash.com/photo-1551776235-dde6d482980b?auto=format&fit=crop&w=1200&q=80'],
    price: 7400,
    size: '285 sq ft',
    bedType: 'Queen bed',
    view: 'Runway side',
    maxGuests: 2,
    amenities: ['Wi-Fi', 'Airport shuttle', 'Blackout curtains', 'Room service'],
    totalUnits: 12,
  },
  {
    name: 'Spa Retreat Room',
    type: 'Wellness',
    description: 'Restful wellness room with aromatherapy, yoga mat, soaking bath, and spa credit.',
    images: ['https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1200&q=80'],
    price: 16800,
    size: '455 sq ft',
    bedType: 'King bed',
    view: 'Spa garden',
    maxGuests: 2,
    amenities: ['Wi-Fi', 'Breakfast', 'Spa credit', 'Bathtub', 'Yoga mat'],
    totalUnits: 4,
  },
  {
    name: 'Two Bedroom Residence',
    type: 'Family',
    description: 'Apartment-style residence with two bedrooms, kitchenette, dining area, and washer dryer.',
    images: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'],
    price: 24500,
    size: '760 sq ft',
    bedType: 'King and twin beds',
    view: 'Neighbourhood',
    maxGuests: 5,
    amenities: ['Wi-Fi', 'Kitchenette', 'Washer dryer', 'Dining area'],
    totalUnits: 3,
  },
]);

await Offer.create([
  {
    code: 'WEEKEND20',
    title: 'Weekend escape',
    description: 'Save 20% on two-night weekend stays.',
    discountType: 'percentage',
    discountValue: 20,
    minStayNights: 2,
    validFrom: new Date('2026-01-01'),
    validTo: new Date('2026-12-31'),
  },
  {
    code: 'WELCOME2500',
    title: 'First stay credit',
    description: 'Take Rs. 2,500 off your first booking.',
    discountType: 'fixed',
    discountValue: 2500,
    minStayNights: 1,
    validFrom: new Date('2026-01-01'),
    validTo: new Date('2026-12-31'),
  },
]);

const booking = await Booking.create({
  user: guest._id,
  room: rooms[0]._id,
  checkIn: new Date('2026-07-10'),
  checkOut: new Date('2026-07-13'),
  guests: 2,
  guestDetails: { name: guest.name, email: guest.email, phone: guest.phone },
  subtotal: 55500,
  discount: 11100,
  total: 44400,
  paymentMethod: 'pay_by_email',
  paymentStatus: 'pending',
});

await Review.create({
  user: guest._id,
  room: rooms[0]._id,
  booking: booking._id,
  rating: 5,
  title: 'Beautiful stay',
  comment: 'The room was spotless, the sea view was memorable, and check-in was quick.',
  status: 'approved',
  adminResponse: 'Thank you for staying with us. We hope to welcome you again soon.',
});

await Notification.create({
  user: guest._id,
  type: 'offer',
  title: 'Welcome offer',
  message: 'Use WEEKEND20 on eligible two-night stays.',
  channel: 'in_app',
});

console.log('Seed complete');
console.log('Guest login: guest@stayease.test / password123');
console.log('Admin login: admin@stayease.test / password123');

await mongoose.disconnect();

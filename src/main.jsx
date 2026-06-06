import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BadgePercent,
  BedDouble,
  CalendarDays,
  ChartNoAxesCombined,
  Heart,
  Hotel,
  LayoutDashboard,
  MailCheck,
  MessageSquareText,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  User,
  LogOut,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import './styles.css';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

// Payment methods that go through Razorpay checkout
const ONLINE_PAYMENT_METHODS = new Set(['card', 'mobikwik']);

const fallbackRooms = [
  {
    _id: 'demo-marine-suite',
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
    availableUnits: 4,
    availabilityStatus: 'Available',
  },
  {
    _id: 'demo-deluxe',
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
    availableUnits: 8,
    availabilityStatus: 'Available',
  },
  {
    _id: 'demo-family',
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
    availableUnits: 5,
    availabilityStatus: 'Available',
  },
  {
    _id: 'demo-business',
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
    availableUnits: 6,
    availabilityStatus: 'Available',
  },
  {
    _id: 'demo-lake-premium',
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
    availableUnits: 5,
    availabilityStatus: 'Available',
  },
  {
    _id: 'demo-heritage',
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
    availableUnits: 7,
    availabilityStatus: 'Available',
  },
  {
    _id: 'demo-executive-twin',
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
    availableUnits: 8,
    availabilityStatus: 'Available',
  },
  {
    _id: 'demo-presidential',
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
    availableUnits: 2,
    availabilityStatus: 'Available',
  },
  {
    _id: 'demo-cabana',
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
    availableUnits: 5,
    availabilityStatus: 'Available',
  },
  {
    _id: 'demo-solo',
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
    availableUnits: 10,
    availabilityStatus: 'Available',
  },
  {
    _id: 'demo-airport',
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
    availableUnits: 12,
    availabilityStatus: 'Available',
  },
  {
    _id: 'demo-spa',
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
    availableUnits: 4,
    availabilityStatus: 'Available',
  },
  {
    _id: 'demo-residence',
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
    availableUnits: 3,
    availabilityStatus: 'Available',
  },
];

const fallbackOffers = [
  { code: 'WEEKEND20', title: 'Weekend escape', description: 'Save 20% on two-night weekend stays.' },
  { code: 'WELCOME2500', title: 'First stay credit', description: 'Take Rs. 2,500 off your first booking.' },
];

const chartData = [
  { month: 'Jan', bookings: 42, revenue: 18 },
  { month: 'Feb', bookings: 58, revenue: 24 },
  { month: 'Mar', bookings: 64, revenue: 29 },
  { month: 'Apr', bookings: 73, revenue: 34 },
  { month: 'May', bookings: 88, revenue: 41 },
  { month: 'Jun', bookings: 96, revenue: 46 },
];

function useApi(path, fallback, token) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`${apiBase}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((json) => {
        const nextData = Array.isArray(json) && json.length === 0 && Array.isArray(fallback) ? fallback : json;
        if (active) setData(nextData);
      })
      .catch(() => active && setData(fallback))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [path, token]);

  return { data, loading };
}

function money(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function paymentLabel(method) {
  const labels = {
    card: 'Credit/debit card',
    mobikwik: 'MobiKwik Wallet',
  };
  return labels[method] || 'Payment';
}

async function apiRequest(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

function nightsBetween(start, end) {
  const nights = Math.ceil((new Date(end) - new Date(start)) / 86400000);
  return Number.isFinite(nights) && nights > 0 ? nights : 1;
}


function App() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('stayease-session');
    return saved ? JSON.parse(saved) : null;
  });
  const [filters, setFilters] = useState({
    checkIn: '2026-07-10',
    checkOut: '2026-07-13',
    type: '',
    guests: 2,
    minPrice: '',
    maxPrice: 25000,
    amenities: '',
    sort: 'price_asc',
    minRating: '',
    availableOnly: false,
  });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [offerCode, setOfferCode] = useState('WEEKEND20');
  const [guestName, setGuestName] = useState(session?.user?.name || 'Ava Stone');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [specialRequests, setSpecialRequests] = useState('');
  const [status, setStatus] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [profileForm, setProfileForm] = useState({
    name: session?.user?.name || 'Ava Stone',
    phone: '+91 98765 43210',
    bedType: 'King bed',
    budget: 25000,
  });
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [adminData, setAdminData] = useState({ bookings: [], reviews: [], analytics: null });
  const [newRoom, setNewRoom] = useState({
    name: 'New Premium Room',
    type: 'Premium',
    price: 13500,
    totalUnits: 4,
    description: 'Premium room with city views, fast Wi-Fi, breakfast, and workspace.',
  });
  const [newOffer, setNewOffer] = useState({
    code: 'MONSOON15',
    title: 'Monsoon saver',
    discountType: 'percentage',
    discountValue: 15,
  });

  // Build API query string with sanitized values
  const queryObj = {};
  if (filters.type) queryObj.type = filters.type;
  if (filters.guests) queryObj.guests = filters.guests;
  if (filters.minPrice !== '' && filters.minPrice !== null) queryObj.minPrice = filters.minPrice;
  if (filters.maxPrice !== '' && filters.maxPrice !== null) queryObj.maxPrice = filters.maxPrice;
  if (filters.amenities) queryObj.amenities = filters.amenities.split(',').map((a) => a.trim()).filter(Boolean).join(',');
  if (filters.checkIn) queryObj.checkIn = filters.checkIn;
  if (filters.checkOut) queryObj.checkOut = filters.checkOut;
  if (filters.sort) queryObj.sort = filters.sort === 'price_asc' ? 'price_asc' : 'price_desc';
  if (filters.minRating) queryObj.minRating = filters.minRating;
  const query = new URLSearchParams(queryObj).toString();
  const { data: rooms, loading } = useApi(`/rooms?${query}`, fallbackRooms, session?.token);
  const { data: offers } = useApi('/offers', fallbackOffers, session?.token);
  const activeRoom = selectedRoom || (rooms[0] && !String(rooms[0]._id).startsWith('demo-') ? rooms[0] : null) || null;
  const nights = nightsBetween(filters.checkIn, filters.checkOut);
  const discount = offerCode.toUpperCase().includes('20') ? activeRoom.price * nights * 0.2 : offerCode ? 2500 : 0;
  const total = Math.max(0, activeRoom.price * nights - discount);

  const filteredRooms = useMemo(
    () => rooms.filter((room) => !filters.type || room.type === filters.type).filter((room) => room.price <= filters.maxPrice),
    [rooms, filters.type, filters.maxPrice],
  );

  useEffect(() => {
    if (!session) return;

    if (session.token === 'demo-token') {
      setBookings([
        {
          _id: 'demo-booking',
          room: fallbackRooms[0],
          checkIn: filters.checkIn,
          checkOut: filters.checkOut,
          paymentStatus: 'pending',
          status: 'upcoming',
          total,
        },
      ]);
      setReviews([
        { _id: 'demo-review', rating: 5, title: 'Beautiful stay', comment: 'The room was spotless and the view was memorable.', user: { name: 'Ava Stone' } },
      ]);
      setNotifications([
        { _id: 'demo-notification', title: 'Welcome offer', message: 'Use WEEKEND20 for eligible two-night stays.', read: false },
      ]);
      return;
    }

    refreshGuestData();
    if (session.user.role === 'admin') refreshAdminData();
  }, [session?.token, session?.user?.role]);

  if (!session) {
    return <AuthScreen onLogin={setSession} />;
  }

  async function refreshGuestData() {
    try {
      const [bookingList, notificationList, roomDetails, me] = await Promise.all([
        apiRequest('/bookings', { token: session.token }),
        apiRequest('/notifications', { token: session.token }),
        apiRequest(`/rooms/${activeRoom._id}`, { token: session.token }).catch(() => ({ reviews: [] })),
        apiRequest('/auth/me', { token: session.token }),
      ]);
      setBookings(bookingList);
      setNotifications(notificationList);
      setReviews(roomDetails.reviews || []);
      setFavoriteIds(new Set((me.user?.favorites || []).map(String)));
      setProfileForm((current) => ({
        ...current,
        name: me.user?.name || current.name,
        phone: me.user?.phone || current.phone,
        bedType: me.user?.preferences?.bedType || current.bedType,
        budget: me.user?.preferences?.budget || current.budget,
      }));
    } catch (_error) {
      // Demo/fallback data remains visible when the API is unavailable.
    }
  }

  async function refreshAdminData() {
    try {
      const [adminBookings, adminReviews, analytics] = await Promise.all([
        apiRequest('/admin/bookings', { token: session.token }),
        apiRequest('/admin/reviews', { token: session.token }),
        apiRequest('/admin/analytics', { token: session.token }),
      ]);
      setAdminData({ bookings: adminBookings, reviews: adminReviews, analytics });
    } catch (_error) {
      setAdminData((current) => current);
    }
  }

  async function bookRoom(event) {
    event.preventDefault();

    if (!activeRoom) {
      setStatus('Select a room before sending the booking request.');
      return;
    }

    try {
      setIsPaying(true);
      await createBooking(paymentMethod);
    } catch (error) {
      setStatus(error.message || `Booking server could not be reached. Start the backend and confirm VITE_API_URL points to it. Current API: ${apiBase}`);
    } finally {
      setIsPaying(false);
    }
  }

  // openRazorpayCheckout: opens the Razorpay modal and returns a Promise
  // that resolves with the payment response or rejects on failure/dismiss.
  function openRazorpayCheckout(orderData, selectedMethod) {
    return new Promise((resolve, reject) => {
      const options = {
        key: orderData.keyId || RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'StayEase Hotel Booking',
        description: `${activeRoom.name} – ${activeRoom.type}`,
        order_id: orderData.orderId,
        prefill: {
          name: guestName || session.user.name,
          email: session.user.email,
          contact: '+919876543210',
        },
        // Restrict to domestic methods only — international cards are disabled
        // by default on new Razorpay accounts and cause "international not supported"
        method: {
          upi:        false,
          netbanking: false,
          paylater:   false,
          wallet:     selectedMethod === 'mobikwik',
          card:       selectedMethod === 'card',
        },
        // When wallet is selected, restrict to MobiKwik only
        ...(selectedMethod === 'mobikwik' && {
          config: {
            display: {
              blocks: {
                wallets: { name: 'MobiKwik', instruments: [{ method: 'wallet', wallets: ['mobikwik'] }] },
              },
              sequence: ['block.wallets'],
              preferences: { show_default_blocks: false },
            },
          },
        }),
        notes: { roomName: activeRoom.name },
        theme: { color: '#2d6a4f' },
        handler(response) {
          console.log('[razorpay] payment success – paymentId:', response.razorpay_payment_id);
          resolve(response);
        },
        modal: {
          ondismiss() {
            console.log('[razorpay] modal dismissed by user');
            reject(new Error('Payment cancelled. You can try again or choose a different payment method.'));
          },
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        console.error('[razorpay] payment failed:', response.error);
        // Surface the actual Razorpay error description to the user
        const desc = response.error?.description || response.error?.reason || 'Payment failed';
        reject(new Error(desc));
      });
      rzp.open();
    });
  }

  async function createBooking(method = paymentMethod) {
    if (String(activeRoom._id).startsWith('demo-')) {
      setStatus('Unable to complete booking: rooms could not be loaded from the server. Please check your connection and refresh the page.');
      return null;
    }

    const bookingPayload = {
      roomId: activeRoom._id,
      checkIn: filters.checkIn,
      checkOut: filters.checkOut,
      guests: filters.guests,
      guestDetails: {
        name: guestName,
        email: session.user.email,
        phone: '+91 98765 43210',
      },
      specialRequests,
      offerCode,
      paymentMethod: method,
      emailTo: session.user.email,
    };

    console.log('[booking] request –', { method, roomId: activeRoom._id, checkIn: filters.checkIn, checkOut: filters.checkOut });

    // ── Online payment via Razorpay ──────────────────────────────────────
    if (ONLINE_PAYMENT_METHODS.has(method)) {
      // Step 1: Create Razorpay order on the backend
      const orderRes = await fetch(`${apiBase}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
        body: JSON.stringify(bookingPayload),
      });

      console.log('[booking] create-order response status:', orderRes.status);

      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}));
        console.error('[booking] create-order error body:', err);
        if (orderRes.status === 401) {
          localStorage.removeItem('stayease-session');
          throw new Error('Session expired. Please refresh and log in again.');
        }
        // 503 = gateway not configured or Razorpay key invalid
        // err.message already contains the actionable text from the backend
        throw new Error(err.message || 'Could not initiate payment');
      }

      const orderData = await orderRes.json();
      console.log('[booking] Razorpay order –', orderData.orderId, '₹' + (orderData.amount / 100).toLocaleString('en-IN'));

      // Step 2: Open Razorpay checkout modal
      setStatus('Razorpay payment window is opening… Complete the payment to confirm your booking.');
      const paymentResponse = await openRazorpayCheckout(orderData, method);

      // Step 3: Verify on backend and create booking
      const verifyRes = await fetch(`${apiBase}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({
          ...paymentResponse,                   // razorpay_order_id, razorpay_payment_id, razorpay_signature
          ...bookingPayload,
          total: orderData.total,
          subtotal: orderData.subtotal,
          discount: orderData.discount,
          offerCode: orderData.offerCode,
        }),
      });

      console.log('[booking] verify response status:', verifyRes.status);

      if (!verifyRes.ok) {
        const err = await verifyRes.json().catch(() => ({}));
        throw new Error(err.message || 'Booking could not be saved after payment');
      }

      const booking = await verifyRes.json();
      const emailStatus = booking.emailResult?.sent
        ? `Confirmation sent to ${booking.emailResult.to}.`
        : `Email not sent yet: ${booking.emailResult?.reason || 'Gmail is not configured'}.`;
      setStatus(`✓ Payment successful! ${booking.room?.name || activeRoom.name} is confirmed. ${emailStatus} Payment ID: ${paymentResponse.razorpay_payment_id}.`);
      refreshGuestData();
      return booking;
    }

    // ── Fallback booking path (should not be reached with current payment options) ──
    const response = await fetch(`${apiBase}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify(bookingPayload),
    });

    console.log('[booking] direct booking response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 401) {
        console.warn('[booking] 401 received – clearing stale session');
        localStorage.removeItem('stayease-session');
        throw new Error('Session expired. Please refresh the page and log in again.');
      }
      throw new Error(error.message || 'Booking could not be created');
    }

    const booking = await response.json();
    const emailStatus = booking.emailResult?.sent
      ? `Details sent to ${booking.emailResult.to}${booking.emailResult.cc ? `, with copy to ${booking.emailResult.cc}` : ''}.`
      : `Email not sent yet: ${booking.emailResult?.reason || 'Gmail is not configured'}.`;
    setStatus(`${booking.room?.name || activeRoom.name} booking saved. ${paymentLabel(method)} selected. ${emailStatus} Payment status: ${booking.paymentStatus}.`);
    refreshGuestData();
    return booking;
  }

  function chooseRoom(room) {
    setSelectedRoom(room);
    setStatus(`${room.name} selected. Complete the details below to reserve it.`);
    window.setTimeout(() => {
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  function logout() {
    localStorage.removeItem('stayease-session');
    setSession(null);
  }

  async function validateOfferCode() {
    if (!offerCode) return setStatus('Enter an offer code first.');
    if (session.token === 'demo-token') return setStatus(`${offerCode.toUpperCase()} applied in demo mode.`);

    try {
      const offer = await apiRequest('/offers/validate', {
        method: 'POST',
        body: { code: offerCode },
      });
      setStatus(`${offer.code} applied: ${offer.description || offer.title}`);
    } catch (error) {
      setStatus(error.message || 'Offer code is not valid.');
    }
  }

  async function toggleFavorite(room) {
    const next = new Set(favoriteIds);
    next.has(String(room._id)) ? next.delete(String(room._id)) : next.add(String(room._id));
    setFavoriteIds(next);

    if (session.token === 'demo-token' || String(room._id).startsWith('demo-')) {
      setStatus(next.has(String(room._id)) ? `${room.name} saved to favorites.` : `${room.name} removed from favorites.`);
      return;
    }

    try {
      await apiRequest(`/auth/favorites/${room._id}`, { method: 'PATCH', token: session.token });
    } catch (error) {
      setStatus(error.message || 'Favorite could not be updated.');
    }
  }

  async function removeFavorite(roomId) {
    if (session.token === 'demo-token' || String(roomId).startsWith('demo-')) {
      setFavoriteIds((current) => {
        const next = new Set(current);
        next.delete(String(roomId));
        return next;
      });
      setStatus('Favorite removed in demo mode.');
      return;
    }

    try {
      await apiRequest(`/auth/favorites/${roomId}`, { method: 'PATCH', token: session.token });
      setFavoriteIds((current) => {
        const next = new Set(current);
        next.delete(String(roomId));
        return next;
      });
    } catch (error) {
      setStatus(error.message || 'Favorite could not be removed.');
    }
  }

  async function updateProfile(event) {
    event.preventDefault();
    if (session.token === 'demo-token') {
      const nextSession = { ...session, user: { ...session.user, name: profileForm.name } };
      localStorage.setItem('stayease-session', JSON.stringify(nextSession));
      setSession(nextSession);
      setStatus('Profile updated in demo mode.');
      return;
    }

    try {
      const response = await apiRequest('/auth/profile', {
        method: 'PUT',
        token: session.token,
        body: {
          name: profileForm.name,
          phone: profileForm.phone,
          preferences: {
            bedType: profileForm.bedType,
            budget: Number(profileForm.budget),
          },
        },
      });
      const nextSession = { ...session, user: { ...session.user, name: response.user.name } };
      localStorage.setItem('stayease-session', JSON.stringify(nextSession));
      setSession(nextSession);
      setStatus('Profile and preferences updated.');
    } catch (error) {
      setStatus(error.message || 'Profile could not be updated.');
    }
  }

  async function cancelBooking(bookingId) {
    if (String(bookingId).startsWith('demo-')) {
      setBookings((current) => current.map((booking) => (booking._id === bookingId ? { ...booking, status: 'cancelled' } : booking)));
      return;
    }

    try {
      await apiRequest(`/bookings/${bookingId}/cancel`, { method: 'PATCH', token: session.token });
      refreshGuestData();
    } catch (error) {
      setStatus(error.message || 'Booking could not be cancelled.');
    }
  }

  async function submitReview(event) {
    event.preventDefault();
    if (!reviewForm.comment.trim()) return setStatus('Write a review comment first.');

    const latestBooking = bookings.find((booking) => String(booking.room?._id || booking.room) === String(activeRoom._id));

    if (session.token === 'demo-token' || String(activeRoom._id).startsWith('demo-')) {
      setReviews((current) => [
        {
          _id: `demo-review-${Date.now()}`,
          rating: Number(reviewForm.rating),
          title: reviewForm.title || 'Guest review',
          comment: reviewForm.comment,
          user: { name: session.user.name },
        },
        ...current,
      ]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      setStatus('Review submitted in demo mode.');
      return;
    }

    try {
      await apiRequest('/reviews', {
        method: 'POST',
        token: session.token,
        body: {
          roomId: activeRoom._id,
          bookingId: latestBooking?._id,
          rating: Number(reviewForm.rating),
          title: reviewForm.title,
          comment: reviewForm.comment,
        },
      });
      setReviewForm({ rating: 5, title: '', comment: '' });
      setStatus('Review submitted for admin moderation.');
      refreshGuestData();
    } catch (error) {
      setStatus(error.message || 'Review could not be submitted.');
    }
  }

  async function createAdminRoom(event) {
    event.preventDefault();
    try {
      await apiRequest('/admin/rooms', {
        method: 'POST',
        token: session.token,
        body: {
          ...newRoom,
          price: Number(newRoom.price),
          totalUnits: Number(newRoom.totalUnits),
          maxGuests: 2,
          size: '380 sq ft',
          bedType: 'King bed',
          view: 'City',
          amenities: ['Wi-Fi', 'Breakfast', 'Workspace'],
          images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'],
        },
      });
      setStatus('Admin room created.');
      refreshAdminData();
    } catch (error) {
      setStatus(error.message || 'Room could not be created.');
    }
  }

  async function updateAdminRoom(room) {
    try {
      await apiRequest(`/admin/rooms/${room._id}`, {
        method: 'PUT',
        token: session.token,
        body: {
          price: Number(room.price) + 500,
          totalUnits: Number(room.totalUnits || 1),
          description: `${room.description || 'Updated room listing'} Updated by admin.`,
        },
      });
      setStatus(`${room.name} updated by admin.`);
      refreshAdminData();
    } catch (error) {
      setStatus(error.message || 'Room could not be updated.');
    }
  }

  async function removeAdminRoom(room) {
    try {
      await apiRequest(`/admin/rooms/${room._id}`, { method: 'DELETE', token: session.token });
      setStatus(`${room.name} removed from active listings.`);
      refreshAdminData();
    } catch (error) {
      setStatus(error.message || 'Room could not be removed.');
    }
  }

  async function createAdminOffer(event) {
    event.preventDefault();
    try {
      await apiRequest('/admin/offers', {
        method: 'POST',
        token: session.token,
        body: {
          ...newOffer,
          discountValue: Number(newOffer.discountValue),
          validFrom: '2026-01-01',
          validTo: '2026-12-31',
          minStayNights: 1,
          active: true,
        },
      });
      setStatus('Admin offer created.');
      refreshAdminData();
    } catch (error) {
      setStatus(error.message || 'Offer could not be created.');
    }
  }

  async function updateAdminOffer(offer) {
    try {
      await apiRequest(`/admin/offers/${offer._id}`, {
        method: 'PUT',
        token: session.token,
        body: {
          title: `${offer.title} Updated`,
          discountValue: Number(offer.discountValue || 0) + 1,
        },
      });
      setStatus(`${offer.code} updated by admin.`);
      refreshAdminData();
    } catch (error) {
      setStatus(error.message || 'Offer could not be updated.');
    }
  }

  async function removeAdminOffer(offer) {
    try {
      await apiRequest(`/admin/offers/${offer._id}`, { method: 'DELETE', token: session.token });
      setStatus(`${offer.code} disabled.`);
      refreshAdminData();
    } catch (error) {
      setStatus(error.message || 'Offer could not be removed.');
    }
  }

  async function updateAdminBooking(bookingId, statusValue) {
    await apiRequest(`/admin/bookings/${bookingId}`, { method: 'PATCH', token: session.token, body: { status: statusValue } });
    refreshAdminData();
  }

  async function moderateReview(reviewId, statusValue) {
    await apiRequest(`/admin/reviews/${reviewId}`, { method: 'PATCH', token: session.token, body: { status: statusValue } });
    refreshAdminData();
  }

  async function respondToReview(reviewId) {
    await apiRequest(`/admin/reviews/${reviewId}`, {
      method: 'PATCH',
      token: session.token,
      body: { status: 'approved', adminResponse: 'Thank you for the feedback. Our team has reviewed your stay experience.' },
    });
    refreshAdminData();
  }

  return (
    <main className="min-h-screen bg-[#f6f8f5] text-ink">
      <section className="relative min-h-[92vh] overflow-hidden bg-ink">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-70"
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=80"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col px-5 py-5 sm:px-8">
          <nav className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3 text-lg font-semibold">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-white text-pine">
                <Hotel size={22} />
              </span>
              StayEase
            </div>
            <div className="hidden gap-7 text-sm text-white/80 md:flex">
              <a href="#rooms">Rooms</a>
              <a href="#booking">Book</a>
              <a href="#profile">Profile</a>
              {session.user.role === 'admin' && <a href="#admin">Admin</a>}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden text-white/80 sm:inline">{session.user.name}</span>
              <button className="grid h-10 w-10 place-items-center rounded-md bg-white/12 text-white hover:bg-white/20" onClick={logout} title="Log out">
                <LogOut size={18} />
              </button>
            </div>
          </nav>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_460px]">
            <div className="max-w-2xl text-white">
              <p className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/14 px-3 py-2 text-sm backdrop-blur">
                <ShieldCheck size={16} /> Payment method selected now, final collection handled after email confirmation
              </p>
              <h1 className="text-5xl font-semibold leading-tight sm:text-6xl">StayEase Hotel Booking</h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/82">
                Search rooms, check live availability, apply offers, reserve securely, and keep every stay organized from one polished dashboard.
              </p>
            </div>

            <form className="rounded-lg bg-white p-4 shadow-soft" onSubmit={(event) => event.preventDefault()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Find a room</h2>
                <Search size={20} className="text-pine" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Check in" type="date" value={filters.checkIn} onChange={(checkIn) => setFilters({ ...filters, checkIn })} />
                <Field label="Check out" type="date" value={filters.checkOut} onChange={(checkOut) => setFilters({ ...filters, checkOut })} />
                <Select
                  label="Room type"
                  value={filters.type}
                  onChange={(type) => setFilters({ ...filters, type })}
                  options={['', 'Suite', 'Deluxe', 'Family', 'Business', 'Premium', 'Heritage', 'Executive', 'Cabana', 'Standard', 'Wellness']}
                />
                <Field label="Guests" type="number" value={filters.guests} onChange={(guests) => setFilters({ ...filters, guests })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 mt-3">
                <Field label="Amenities (comma separated)" value={filters.amenities} onChange={(amenities) => setFilters({ ...filters, amenities })} />
                <Field label="Min price" type="number" value={filters.minPrice} onChange={(minPrice) => setFilters({ ...filters, minPrice })} />
                <Select
                  label="Sort"
                  value={filters.sort}
                  onChange={(sort) => setFilters({ ...filters, sort })}
                  options={[
                    { value: 'price_asc', label: 'Price: low → high' },
                    { value: 'price_desc', label: 'Price: high → low' },
                  ]}
                />
                <Select
                  label="Min rating"
                  value={filters.minRating}
                  onChange={(minRating) => setFilters({ ...filters, minRating })}
                  options={[ '', 5, 4, 3, 2, 1 ]}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-pine" checked={filters.availableOnly} onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })} />
                  <span>Only show available</span>
                </label>
              </div>
              <label className="mt-4 block text-sm font-medium">
                Price range
                <input
                  className="mt-3 w-full accent-pine"
                  type="range"
                  min="5000"
                  max="50000"
                  step="500"
                  value={filters.maxPrice}
                  onChange={(event) => setFilters({ ...filters, maxPrice: Number(event.target.value) })}
                />
                <span className="mt-1 block text-sm text-slate-500">Up to {money(filters.maxPrice)} per night</span>
              </label>
            </form>
          </div>
        </div>
      </section>

      <section id="rooms" className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Available stays</p>
            <h2 className="mt-2 text-3xl font-semibold">Rooms and details</h2>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm shadow-sm">
            <SlidersHorizontal size={18} /> {loading ? 'Checking availability' : `${filteredRooms.length} rooms match`}
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <article key={room._id} className="overflow-hidden rounded-lg bg-white shadow-sm">
              <img className="h-56 w-full object-cover" src={room.images?.[0]} alt={room.name} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold">{room.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{room.type} - {room.size}</p>
                  </div>
                  <button className="rounded-md p-2 text-coral hover:bg-coral/10" title="Save favorite" onClick={() => toggleFavorite(room)}>
                    <Heart size={20} fill={favoriteIds.has(String(room._id)) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">{room.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <Info icon={<BedDouble size={17} />} text={room.bedType} />
                  <Info icon={<User size={17} />} text={`${room.maxGuests} guests`} />
                  <Info icon={<Hotel size={17} />} text={room.view} />
                  <Info icon={<CalendarDays size={17} />} text={`${room.availableUnits ?? 0} available`} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {room.amenities?.slice(0, 4).map((item) => (
                    <span className="rounded-md bg-mist px-2.5 py-1 text-xs font-medium text-pine" key={item}>{item}</span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <strong className="text-2xl">{money(room.price)}<span className="text-sm font-normal text-slate-500"> / night</span></strong>
                  <button
                    className="rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    disabled={(room.availableUnits ?? 0) <= 0}
                    onClick={() => chooseRoom(room)}
                  >
                    {selectedRoom?._id === room._id ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="booking" className="bg-white py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_420px]">
          <form className="rounded-lg border border-slate-200 p-5" onSubmit={bookRoom}>
            <div className="mb-5 flex items-center gap-3">
              <MailCheck className="text-pine" />
              <h2 className="text-2xl font-semibold">Booking request</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" value={guestName} onChange={setGuestName} />
              <Field label="Email" value={session.user.email} onChange={() => {}} />
              <Field label="Phone" value="+91 98765 43210" onChange={() => {}} />
              <Select
                label="Payment"
                value={paymentMethod}
                onChange={setPaymentMethod}
                options={[
                  { value: 'card', label: 'Credit/debit card' },
                  { value: 'mobikwik', label: 'MobiKwik Wallet' },
                ]}
              />
            </div>
            <label className="mt-4 block text-sm font-medium">
              Special requests
              <textarea className="mt-2 h-28 w-full rounded-md border border-slate-200 p-3 outline-none focus:border-pine" placeholder="Late check-in, accessible room, airport pickup..." value={specialRequests} onChange={(event) => setSpecialRequests(event.target.value)} />
            </label>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Field label="Discount code" value={offerCode} onChange={setOfferCode} />
              <div className="grid gap-2 sm:grid-cols-2">
                <button className="self-end rounded-md border border-coral px-5 py-3 font-semibold text-coral" type="button" onClick={validateOfferCode}>
                  Apply
                </button>
                <button className="self-end rounded-md bg-coral px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300" disabled={isPaying}>
                  {isPaying
                    ? 'Opening payment...'
                    : 'Pay with Razorpay'}
                </button>
              </div>
            </div>
            {status && <p className="mt-4 rounded-md bg-mist px-4 py-3 text-sm font-medium text-pine">{status}</p>}
          </form>

          <aside className="rounded-lg bg-ink p-5 text-white">
            <p className="text-sm text-white/70">Selected room</p>
            <h3 className="mt-2 text-2xl font-semibold">{activeRoom.name}</h3>
            <p className="mt-2 text-sm text-white/65">{activeRoom.type} - {activeRoom.bedType} - {activeRoom.view}</p>
            <div className="mt-5 space-y-3 text-sm">
              <Line label={`${nights} nights`} value={money(activeRoom.price * nights)} />
              <Line label="Offer discount" value={`-${money(discount)}`} />
              <Line label="Taxes and fees" value="Included" />
            </div>
            <div className="mt-6 border-t border-white/15 pt-5">
              <Line label="Total due" value={money(total)} large />
            </div>
            <div className="mt-6 rounded-md bg-white/10 p-4 text-sm text-white/78">
              {paymentMethod === 'mobikwik'
                ? 'Select MobiKwik in the test screen, then click Success to complete payment.'
                : 'Test card: 5267 3181 8797 5449 · Expiry: 08/26 · CVV: 123 · OTP: 1234'}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-12 sm:px-8 lg:grid-cols-3">
        <Panel icon={<BadgePercent />} title="Special offers">
          {offers.map((offer) => (
            <div className="border-b border-slate-100 py-3 last:border-b-0" key={offer.code}>
              <div className="font-semibold">{offer.title}</div>
              <div className="text-sm text-slate-500">{offer.code} - {offer.description}</div>
            </div>
          ))}
        </Panel>
        <Panel icon={<MessageSquareText />} title="Guest reviews">
          <form onSubmit={submitReview}>
            <Select label="Rating" value={reviewForm.rating} onChange={(rating) => setReviewForm({ ...reviewForm, rating })} options={[5, 4, 3, 2, 1]} />
            <div className="mt-3">
              <Field label="Title" value={reviewForm.title} onChange={(title) => setReviewForm({ ...reviewForm, title })} />
            </div>
            <textarea
              className="mt-4 h-20 w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-pine"
              placeholder="Write a review after your stay"
              value={reviewForm.comment}
              onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })}
            />
            <button className="mt-3 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white">Submit review</button>
          </form>
          <div className="mt-4 space-y-3">
            {reviews.slice(0, 3).map((review) => (
              <div className="rounded-md bg-slate-50 p-3" key={review._id}>
                <div className="flex items-center gap-1 text-gold">
                  {Array.from({ length: Number(review.rating) || 5 }).map((_, index) => <Star key={index} fill="currentColor" size={15} />)}
                </div>
                <div className="mt-2 text-sm font-semibold">{review.title || 'Guest review'}</div>
                <p className="text-sm text-slate-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel id="profile" icon={<User />} title="Booking history">
          <div className="max-h-64 space-y-3 overflow-auto pr-1">
            {bookings.map((booking) => (
              <div className="rounded-md bg-mist p-3" key={booking._id}>
                <div className="font-semibold">{booking.room?.name || activeRoom.name}</div>
                <div className="text-sm text-slate-600">
                  {booking.room?.type || activeRoom.type} - {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()} - {booking.paymentStatus} - {booking.status}
                </div>
                {booking.status !== 'cancelled' && (
                  <button className="mt-2 text-sm font-semibold text-coral" onClick={() => cancelBooking(booking._id)}>Cancel booking</button>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-12 sm:px-8 lg:grid-cols-3">
        <Panel icon={<User />} title="Profile">
          <form onSubmit={updateProfile} className="space-y-3">
            <Field label="Name" value={profileForm.name} onChange={(name) => setProfileForm({ ...profileForm, name })} />
            <Field label="Phone" value={profileForm.phone} onChange={(phone) => setProfileForm({ ...profileForm, phone })} />
            <Field label="Preferred bed" value={profileForm.bedType} onChange={(bedType) => setProfileForm({ ...profileForm, bedType })} />
            <Field label="Budget" type="number" value={profileForm.budget} onChange={(budget) => setProfileForm({ ...profileForm, budget })} />
            <button className="rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white">Save profile</button>
          </form>
        </Panel>
        <Panel icon={<Heart />} title="Favorites">
          <div className="space-y-3">
            {rooms.filter((room) => favoriteIds.has(String(room._id))).slice(0, 5).map((room) => (
              <button className="block w-full rounded-md bg-mist p-3 text-left" key={room._id} onClick={() => chooseRoom(room)}>
                <div className="font-semibold">{room.name}</div>
                <div className="text-sm text-slate-600">{money(room.price)} / night</div>
              </button>
            ))}
            {favoriteIds.size === 0 && <p className="text-sm text-slate-500">Save rooms with the heart button for quick access.</p>}
          </div>
        </Panel>
        <Panel icon={<CalendarDays />} title="Notifications">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div className="rounded-md border border-slate-200 p-3" key={notification._id}>
                <div className="font-semibold">{notification.title}</div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-coral">{notification.channel || 'in_app'}</div>
                <p className="text-sm text-slate-600">{notification.message}</p>
                {!notification.read && (
                  <button className="mt-2 text-sm font-semibold text-pine" onClick={async () => {
                    try {
                      await apiRequest(`/notifications/${notification._id}/read`, { method: 'PATCH', token: session.token });
                      setNotifications((current) => current.map((n) => (n._id === notification._id ? { ...n, read: true } : n)));
                    } catch (error) {
                      setStatus(error.message || 'Could not mark notification read.');
                    }
                  }}>Mark read</button>
                )}
              </div>
            ))}
            {notifications.length === 0 && <p className="text-sm text-slate-500">Booking confirmations, receipts, reminders, and offers appear here.</p>}
          </div>
        </Panel>
      </section>

      {session.user.role === 'admin' && (
        <section id="admin" className="bg-ink py-12 text-white">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-6 flex items-center gap-3">
              <LayoutDashboard className="text-coral" />
              <h2 className="text-3xl font-semibold">Admin operations</h2>
            </div>
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr_320px]">
            <div className="rounded-lg bg-white/8 p-5">
              <h3 className="font-semibold">Booking trends</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.15)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,.7)" />
                    <YAxis stroke="rgba(255,255,255,.7)" />
                    <Tooltip />
                    <Area type="monotone" dataKey="bookings" stroke="#d96f57" fill="#d96f57" fillOpacity={0.35} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-lg bg-white/8 p-5">
              <h3 className="font-semibold">Revenue</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.15)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,.7)" />
                    <YAxis stroke="rgba(255,255,255,.7)" />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#c8942f" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid gap-4">
              <Metric icon={<BedDouble />} label="Rooms active" value={String(rooms.length)} />
              <Metric icon={<ChartNoAxesCombined />} label="Occupancy" value={`${adminData.analytics?.occupancyRate ?? 81}%`} />
              <Metric icon={<MessageSquareText />} label="Reviews pending" value={String(adminData.reviews.filter((review) => review.status === 'pending').length || 0)} />
            </div>
          </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <form className="rounded-lg bg-white/8 p-5" onSubmit={createAdminRoom}>
                <h3 className="font-semibold">Room management</h3>
                <div className="mt-4 grid gap-3 text-ink sm:grid-cols-2">
                  <Field label="Room name" value={newRoom.name} onChange={(name) => setNewRoom({ ...newRoom, name })} />
                  <Field label="Type" value={newRoom.type} onChange={(type) => setNewRoom({ ...newRoom, type })} />
                  <Field label="Price" type="number" value={newRoom.price} onChange={(price) => setNewRoom({ ...newRoom, price })} />
                  <Field label="Units" type="number" value={newRoom.totalUnits} onChange={(totalUnits) => setNewRoom({ ...newRoom, totalUnits })} />
                </div>
                <textarea
                  className="mt-3 h-20 w-full rounded-md border border-white/20 p-3 text-ink outline-none"
                  value={newRoom.description}
                  onChange={(event) => setNewRoom({ ...newRoom, description: event.target.value })}
                />
                <button className="mt-3 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white">Add room</button>
                <div className="mt-4 max-h-44 space-y-2 overflow-auto">
                  {rooms.slice(0, 6).map((room) => (
                    <div className="rounded-md bg-white/10 p-3" key={room._id}>
                      <div className="font-semibold text-white">{room.name}</div>
                      <div className="text-sm text-white/70">{room.type} - {money(room.price)} - {room.totalUnits || room.availableUnits || 0} units</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-pine" type="button" onClick={() => updateAdminRoom(room)}>Update</button>
                        <button className="rounded-md bg-coral px-3 py-1 text-sm font-semibold text-white" type="button" onClick={() => removeAdminRoom(room)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </form>
              <form className="rounded-lg bg-white/8 p-5" onSubmit={createAdminOffer}>
                <h3 className="font-semibold">Special offers management</h3>
                <div className="mt-4 grid gap-3 text-ink sm:grid-cols-2">
                  <Field label="Code" value={newOffer.code} onChange={(code) => setNewOffer({ ...newOffer, code })} />
                  <Field label="Title" value={newOffer.title} onChange={(title) => setNewOffer({ ...newOffer, title })} />
                  <Select label="Discount type" value={newOffer.discountType} onChange={(discountType) => setNewOffer({ ...newOffer, discountType })} options={['percentage', 'fixed']} />
                  <Field label="Discount value" type="number" value={newOffer.discountValue} onChange={(discountValue) => setNewOffer({ ...newOffer, discountValue })} />
                </div>
                <button className="mt-3 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white">Create offer</button>
                <div className="mt-4 max-h-44 space-y-2 overflow-auto">
                  {offers.slice(0, 6).map((offer) => (
                    <div className="rounded-md bg-white/10 p-3" key={offer._id || offer.code}>
                      <div className="font-semibold text-white">{offer.code} - {offer.title}</div>
                      <div className="text-sm text-white/70">{offer.discountType || 'fixed'} {offer.discountValue || ''}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-pine disabled:opacity-50" type="button" disabled={!offer._id} onClick={() => updateAdminOffer(offer)}>Update</button>
                        <button className="rounded-md bg-coral px-3 py-1 text-sm font-semibold text-white disabled:opacity-50" type="button" disabled={!offer._id} onClick={() => removeAdminOffer(offer)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </form>
              <div className="rounded-lg bg-white/8 p-5">
                <h3 className="font-semibold">Booking management</h3>
                <div className="mt-4 max-h-80 space-y-3 overflow-auto">
                  {adminData.bookings.slice(0, 8).map((booking) => (
                    <div className="rounded-md bg-white/10 p-3" key={booking._id}>
                      <div className="font-semibold">{booking.room?.name || 'Room'} - {booking.user?.name || 'Guest'}</div>
                      <div className="text-sm text-white/70">{booking.status} - {booking.paymentStatus}</div>
                      <div className="mt-2 flex gap-2">
                        <button className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-pine" type="button" onClick={() => updateAdminBooking(booking._id, 'completed')}>Complete</button>
                        <button className="rounded-md bg-coral px-3 py-1 text-sm font-semibold text-white" type="button" onClick={() => updateAdminBooking(booking._id, 'cancelled')}>Cancel</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-white/8 p-5">
                <h3 className="font-semibold">Review moderation</h3>
                <div className="mt-4 max-h-80 space-y-3 overflow-auto">
                  {adminData.reviews.slice(0, 8).map((review) => (
                    <div className="rounded-md bg-white/10 p-3" key={review._id}>
                      <div className="font-semibold">{review.title || 'Review'} - {review.status}</div>
                      <p className="text-sm text-white/70">{review.comment}</p>
                      {review.adminResponse && <p className="mt-2 text-sm text-white/80">Response: {review.adminResponse}</p>}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-pine" type="button" onClick={() => moderateReview(review._id, 'approved')}>Approve</button>
                        <button className="rounded-md bg-white/20 px-3 py-1 text-sm font-semibold text-white" type="button" onClick={() => respondToReview(review._id)}>Respond</button>
                        <button className="rounded-md bg-coral px-3 py-1 text-sm font-semibold text-white" type="button" onClick={() => moderateReview(review._id, 'removed')}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: 'Ava Stone',
    email: 'guest@stayease.test',
    password: 'password123',
    phone: '+91 98765 43210',
  });
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`${apiBase}/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || (mode === 'login' ? 'Login failed' : 'Account could not be created'));
      }

      const session = await response.json();
      localStorage.setItem('stayease-session', JSON.stringify(session));
      onLogin(session);
    } catch (error) {
      if (mode === 'login' && form.email === 'guest@stayease.test' && form.password === 'password123') {
        const demoSession = {
          token: 'demo-token',
          user: { id: 'demo-user', name: form.name || 'Ava Stone', email: form.email, role: 'guest' },
        };
        localStorage.setItem('stayease-session', JSON.stringify(demoSession));
        onLogin(demoSession);
        return;
      }

      setMessage(error.message || (mode === 'login' ? 'Could not sign in. Start the API and MongoDB, or check your email and password.' : 'Could not create account. Start the API and MongoDB, or try another email.'));
    }
  }

  return (
    <main className="grid min-h-screen bg-ink text-white lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-80"
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=80"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/45 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <div className="mb-4 flex items-center gap-3 text-2xl font-semibold">
            <span className="grid h-12 w-12 place-items-center rounded-md bg-white text-pine">
              <Hotel size={26} />
            </span>
            StayEase
          </div>
          <h1 className="max-w-xl text-5xl font-semibold leading-tight">Login to search, book, and manage hotel rooms.</h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-white/78">
            Only signed-in guests can access room availability, booking history, offers, reviews, and payment options.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <form className="w-full max-w-md rounded-lg bg-white p-6 text-ink shadow-soft" onSubmit={submit}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Members only</p>
              <h2 className="mt-2 text-3xl font-semibold">{mode === 'login' ? 'Log in' : 'Create account'}</h2>
            </div>
            <User className="text-pine" />
          </div>

          {mode === 'register' && <Field label="Full name" value={form.name} onChange={(name) => setForm({ ...form, name })} />}
          <div className="mt-4">
            <Field label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
          </div>
          <div className="mt-4">
            <Field label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
          </div>
          {mode === 'register' && (
            <div className="mt-4">
              <Field label="Phone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
            </div>
          )}

          {message && <p className="mt-4 rounded-md bg-coral/10 px-3 py-2 text-sm font-medium text-coral">{message}</p>}

          <button className="mt-5 w-full rounded-md bg-pine px-5 py-3 font-semibold text-white">
            {mode === 'login' ? 'Log in and view rooms' : 'Create account and view rooms'}
          </button>

          <button
            className="mt-3 w-full rounded-md border border-slate-200 px-5 py-3 text-sm font-semibold text-pine"
            type="button"
            onClick={() => {
              const nextMode = mode === 'login' ? 'register' : 'login';
              setMode(nextMode);
              setMessage('');
              if (nextMode === 'register' && form.email === 'guest@stayease.test') {
                setForm({ ...form, name: '', email: '', password: '', phone: '' });
              }
            }}
          >
            {mode === 'login' ? 'Create a new account' : 'Use existing account'}
          </button>

          <p className="mt-4 rounded-md bg-mist px-3 py-2 text-sm text-slate-600">
            Demo login: guest@stayease.test / password123
          </p>
        </form>
      </section>
    </main>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-pine"
        type={type}
        value={value}
        onChange={(event) => onChange(type === 'number' ? Number(event.target.value) : event.target.value)}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <select
        className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-pine"
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => {
          const isPrimitive = ['string', 'number', 'boolean'].includes(typeof option);
          const optionValue = isPrimitive ? option : option.value;
          const optionLabel = isPrimitive ? (String(option) || 'Any') : option.label || String(option.value);
          return (
            <option key={String(optionValue)} value={String(optionValue)}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function Info({ icon, text }) {
  return <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-slate-600">{icon}<span>{text}</span></div>;
}

function Line({ label, value, large = false }) {
  return <div className={`flex items-center justify-between ${large ? 'text-xl font-semibold' : ''}`}><span>{label}</span><span>{value}</span></div>;
}

function Panel({ icon, title, children, id }) {
  return (
    <section id={id} className="rounded-lg bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3 text-pine">
        {icon}
        <h2 className="text-xl font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-lg bg-white/8 p-5">
      <div className="flex items-center justify-between text-white/70">{icon}<span className="text-sm">{label}</span></div>
      <div className="mt-4 text-4xl font-semibold">{value}</div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
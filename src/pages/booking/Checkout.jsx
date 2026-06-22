import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { paymentsAPI, offersAPI, roomsAPI } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { money } from '../../utils/money';
import { formatDate, nightsBetween } from '../../utils/dates';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
const ONLINE_METHODS = new Set(['card', 'mobikwik']);

const checkoutSchema = z.object({
  guestName:     z.string().min(2, 'Name is required'),
  phone:         z.string().regex(/^\+?[\d\s\-().]{7,20}$/, 'Valid phone number required'),
  paymentMethod: z.enum(['card', 'mobikwik'], { required_error: 'Select a payment method' }),
  offerCode:     z.string().optional(),
  specialRequests: z.string().optional(),
  checkIn:       z.string().min(1, 'Check-in date is required'),
  checkOut:      z.string().min(1, 'Check-out date is required'),
  guests:        z.coerce.number().min(1, 'At least 1 guest required'),
}).refine((d) => new Date(d.checkIn) < new Date(d.checkOut), {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
});

export default function Checkout() {
  const { session, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { roomId } = useParams();
  const [room, setRoom] = useState(state?.room || null);
  const [loadingRoom, setLoadingRoom] = useState(!state?.room);
  const [paying, setPaying] = useState(false);
  const [offerDiscount, setOfferDiscount] = useState(0);
  const [offerData, setOfferData] = useState(null);
  const [offerError, setOfferError] = useState('');
  const [validatingOffer, setValidatingOffer] = useState(false);

  React.useEffect(() => {
    if (isAdmin) {
      navigate('/hotels', { replace: true });
      return;
    }
    if (!room && roomId) {
      roomsAPI.get(roomId).then(data => {
        setRoom(data.room);
      }).catch(() => {
        navigate('/hotels', { replace: true });
      }).finally(() => {
        setLoadingRoom(false);
      });
    }
  }, [roomId, room, isAdmin, navigate]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      guestName: session?.user?.name || '',
      phone: '',
      paymentMethod: 'card',
      offerCode: '',
      specialRequests: '',
      checkIn:  state?.checkIn  || '',
      checkOut: state?.checkOut || '',
      guests: 2,
    },
  });

  const watchedCheckIn  = watch('checkIn');
  const watchedCheckOut = watch('checkOut');
  const nights = nightsBetween(watchedCheckIn, watchedCheckOut);
  const subtotal = (room?.price || 0) * nights;
  const total = Math.max(0, subtotal - offerDiscount);

  React.useEffect(() => {
    if (offerData) {
      if (nights < (offerData.minStayNights || 1)) {
        setOfferError(`Requires minimum stay of ${offerData.minStayNights} nights`);
        setOfferDiscount(0);
      } else {
        setOfferError('');
        if (offerData.discountType === 'fixed') {
          setOfferDiscount(Math.min(subtotal, offerData.discountValue));
        } else {
          setOfferDiscount(Math.round(subtotal * (offerData.discountValue / 100)));
        }
      }
    }
  }, [nights, subtotal, offerData]);

  async function handleApplyOffer() {
    const code = watch('offerCode');
    if (!code) return;
    setValidatingOffer(true);
    setOfferError('');
    try {
      const offer = await offersAPI.validate(code);
      if (nights < (offer.minStayNights || 1)) {
        setOfferError(`Requires minimum stay of ${offer.minStayNights} nights`);
        setOfferData(null);
        setOfferDiscount(0);
        return;
      }
      setOfferData(offer);
      let disc = 0;
      if (offer.discountType === 'fixed') {
        disc = Math.min(subtotal, offer.discountValue);
      } else {
        disc = Math.round(subtotal * (offer.discountValue / 100));
      }
      setOfferDiscount(disc);
    } catch (e) {
      setOfferError(e.message || 'Invalid or expired offer code');
      setOfferData(null);
      setOfferDiscount(0);
    } finally {
      setValidatingOffer(false);
    }
  }

  function openRazorpay(orderData, method, bookingPayload) {
    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: orderData.keyId || RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'StayEase',
        description: `${room.name} – ${room.type}`,
        order_id: orderData.orderId,
        prefill: { name: bookingPayload.guestName, email: session.user.email },
        method: { upi: false, netbanking: false, paylater: false, wallet: method === 'mobikwik', card: method === 'card' },
        theme: { color: '#24594f' },
        handler: resolve,
        modal: { ondismiss: () => reject(new Error('Payment cancelled.')) },
      });
      rzp.on('payment.failed', (r) => reject(new Error(r.error?.description || 'Payment failed')));
      rzp.open();
    });
  }

  async function onSubmit(values) {
    setPaying(true);
    try {
      const payload = {
        roomId: room?._id,
        checkIn: values.checkIn,
        checkOut: values.checkOut,
        guests: values.guests,
        guestDetails: { name: values.guestName, email: session.user.email, phone: values.phone },
        specialRequests: values.specialRequests,
        offerCode: values.offerCode,
        paymentMethod: values.paymentMethod,
        emailTo: session.user.email,
      };

      if (ONLINE_METHODS.has(values.paymentMethod)) {
        toast('Opening payment window…', { icon: '💳' });
        const orderData = await paymentsAPI.createOrder(payload);
        const paymentResponse = await openRazorpay(orderData, values.paymentMethod, values);
        const booking = await paymentsAPI.verify({
          ...paymentResponse,
          ...payload,
          total: orderData.total,
          subtotal: orderData.subtotal,
          discount: orderData.discount,
        });
        navigate('/booking/success', { state: { booking: booking.data || booking, room }, replace: true });
      }
    } catch (e) {
      toast.error(e.message || 'Booking failed');
    } finally {
      setPaying(false);
    }
  }

  if (loadingRoom) return <div className="p-8 text-center text-slate-500">Loading checkout...</div>;
  if (!room) return null;

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumbs items={[{ href: '/hotels', label: 'Hotels' }, { label: 'Checkout' }]} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-ink mb-5">Guest details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full name *</label>
                <input className={`input-field ${errors.guestName ? 'input-error' : ''}`} {...register('guestName')} />
                {errors.guestName && <p className="mt-1 text-xs text-red-500">{errors.guestName.message}</p>}
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input-field bg-slate-50" value={session?.user?.email || ''} disabled />
              </div>
              <div>
                <label className="label">Phone *</label>
                <input className={`input-field ${errors.phone ? 'input-error' : ''}`} placeholder="+91 98765 43210" {...register('phone')} />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="label">Payment method *</label>
                <select className={`input-field ${errors.paymentMethod ? 'input-error' : ''}`} {...register('paymentMethod')}>
                  <option value="card">Credit / Debit card</option>
                  <option value="mobikwik">MobiKwik Wallet</option>
                </select>
                {errors.paymentMethod && <p className="mt-1 text-xs text-red-500">{errors.paymentMethod.message}</p>}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold text-ink mb-5">Stay details</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Check-in *</label>
                <input type="date" className={`input-field ${errors.checkIn ? 'input-error' : ''}`} {...register('checkIn')} />
                {errors.checkIn && <p className="mt-1 text-xs text-red-500">{errors.checkIn.message}</p>}
              </div>
              <div>
                <label className="label">Check-out *</label>
                <input type="date" className={`input-field ${errors.checkOut ? 'input-error' : ''}`} {...register('checkOut')} />
                {errors.checkOut && <p className="mt-1 text-xs text-red-500">{errors.checkOut.message}</p>}
              </div>
              <div>
                <label className="label">Guests *</label>
                <input type="number" className={`input-field ${errors.guests ? 'input-error' : ''}`} min="1" max={room?.maxGuests || 1} {...register('guests')} />
                {errors.guests && <p className="mt-1 text-xs text-red-500">{errors.guests.message}</p>}
              </div>
            </div>
            <div className="mt-4">
              <label className="label">Special requests</label>
              <textarea className="input-field h-24 resize-none" placeholder="Late check-in, accessible room, airport pickup…" {...register('specialRequests')} />
            </div>
            <div className="mt-4">
              <label className="label">Offer / discount code</label>
              <div className="flex gap-2">
                <input className="input-field" placeholder="E.g. WEEKEND20" {...register('offerCode')} />
                <Button type="button" onClick={handleApplyOffer} loading={validatingOffer} variant="secondary">Apply</Button>
              </div>
              {offerError && <p className="mt-1 text-xs text-red-500">{offerError}</p>}
              {offerData && !offerError && (
                <div className="mt-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                  <p className="font-semibold">✓ Coupon Applied</p>
                  <p>Code: {offerData.code}</p>
                  <p>Discount: {offerData.discountType === 'fixed' ? money(offerData.discountValue) : `${offerData.discountValue}%`}</p>
                  <p>Saved Amount: {money(offerDiscount)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-mist p-4 text-sm text-slate-600 flex items-start gap-2">
            <ShieldCheck size={16} className="text-pine shrink-0 mt-0.5" />
            <span>Test card: <strong>5267 3181 8797 5449</strong> · Expiry: <strong>08/26</strong> · CVV: <strong>123</strong> · OTP: <strong>1234</strong></span>
          </div>

          <Button type="submit" loading={paying} className="w-full justify-center py-3.5 text-base">
            {paying ? 'Opening payment…' : `Pay ${money(total)} with Razorpay`}
          </Button>
        </form>

                <div className="card p-6 h-fit lg:sticky lg:top-24">
          <img src={room.images?.[0]} alt={room.name} className="h-44 w-full rounded-xl object-cover" />
          <h3 className="mt-4 text-lg font-bold text-ink">{room.name}</h3>
          <p className="text-sm text-slate-500">{room.type} · {room.bedType}</p>

          <div className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">{money(room.price)} × {nights} nights</span>
              <span className="font-medium">{money(subtotal)}</span>
            </div>
            {offerDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-{money(offerDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-100 pt-2.5 font-bold text-ink">
              <span>Total</span>
              <span className="text-lg">{money(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

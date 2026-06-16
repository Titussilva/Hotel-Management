import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { StatusBadge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/Modal';
import { money } from '../../utils/money';
import { formatDate } from '../../utils/dates';
import { Printer, BedDouble, Calendar, Users, CreditCard, Hash, Building2, Tag, XCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingDetails() {
  const { id } = useParams();
  const { session, isAdmin } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    bookingsAPI.get(id)
      .then((res) => setBooking(res.data || res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Cancel logic (reuses existing API) ── */
  const canCancel =
    booking &&
    booking.status !== 'cancelled' &&
    booking.status !== 'completed' &&
    new Date(booking.checkIn) > new Date() &&
    !isAdmin;

  async function handleCancel() {
    setCancelling(true);
    try {
      await bookingsAPI.cancel(id);
      const res = await bookingsAPI.get(id);
      setBooking(res.data || res);
      toast.success('Booking cancelled successfully');
    } catch (e) {
      toast.error(e.message || 'Cancellation failed');
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size="xl" /></div>;
  if (!booking) return (
    <div className="p-8 text-center">
      <h2 className="font-semibold text-ink">Booking not found</h2>
      <Link to="/dashboard/bookings" className="btn-primary mt-4 inline-flex">Back to bookings</Link>
    </div>
  );

  function printInvoice() {
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Invoice #${String(booking._id).slice(-8).toUpperCase()}</title>
      <style>body{font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto} table{width:100%;border-collapse:collapse} td,th{padding:10px;border:1px solid #ddd;text-align:left} th{background:#f5f5f5}</style></head>
      <body>
        <h1 style="color:#24594f">StayEase Invoice</h1>
        <p><strong>Booking ID:</strong> #${String(booking._id).slice(-8).toUpperCase()}</p>
        <p><strong>Room:</strong> ${booking.room?.name}</p>
        <p><strong>Guest:</strong> ${booking.guestDetails?.name || 'Guest'}</p>
        <p><strong>Check-in:</strong> ${formatDate(booking.checkIn)}</p>
        <p><strong>Check-out:</strong> ${formatDate(booking.checkOut)}</p>
        <p><strong>Guests:</strong> ${booking.guests}</p>
        <table>
          <tr><th>Description</th><th>Amount</th></tr>
          <tr><td>Room rate (subtotal)</td><td>${money(booking.subtotal)}</td></tr>
          <tr><td>Discount</td><td>-${money(booking.discount || 0)}</td></tr>
          <tr><td><strong>Total paid</strong></td><td><strong>${money(booking.total)}</strong></td></tr>
        </table>
        <p style="margin-top:20px;color:#888">Payment ID: ${booking.razorpayPaymentId || '—'}</p>
        <p style="color:#888">Thank you for choosing StayEase!</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  }

  const bookingId = String(booking._id).slice(-8).toUpperCase();

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumbs items={[{ href: '/dashboard', label: 'Dashboard' }, { href: '/dashboard/bookings', label: 'My Bookings' }, { label: `#${bookingId}` }]} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Left column: booking info ── */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-ink">{booking.room?.name || 'Room'}</h1>
              <p className="text-slate-500">{booking.room?.type}</p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: <Hash size={18} />,       label: 'Booking ID',      value: `#${bookingId}` },
              { icon: <BedDouble size={18} />,   label: 'Room',            value: booking.room?.name || '—' },
              { icon: <Building2 size={18} />,   label: 'Hotel',           value: booking.room?.hotel || booking.hotel || 'StayEase' },
              { icon: <Calendar size={18} />,    label: 'Check-in',        value: formatDate(booking.checkIn) },
              { icon: <Calendar size={18} />,    label: 'Check-out',       value: formatDate(booking.checkOut) },
              { icon: <Users size={18} />,       label: 'Guests',          value: booking.guests },
              { icon: <CreditCard size={18} />,  label: 'Payment Status',  value: booking.paymentStatus || booking.paymentMethod || '—' },
              { icon: <CheckCircle size={18} />, label: 'Booking Status',  value: booking.status },
            ].map((d) => (
              <div key={d.label} className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-pine mb-1">{d.icon}<span className="text-xs text-slate-400">{d.label}</span></div>
                <div className="font-semibold text-ink capitalize">{d.value}</div>
              </div>
            ))}
          </div>

          {/* Coupon / discount code */}
          {(booking.coupon || booking.couponCode || booking.offerCode) && (
            <div className="mt-4 rounded-xl bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-700 mb-1">
                <Tag size={18} />
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-500">Coupon applied</span>
              </div>
              <p className="font-mono font-semibold text-emerald-700">{booking.coupon || booking.couponCode || booking.offerCode}</p>
            </div>
          )}

          {booking.specialRequests && (
            <div className="mt-4 rounded-xl bg-mist p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Special requests</p>
              <p className="text-sm text-slate-600">{booking.specialRequests}</p>
            </div>
          )}

          {booking.razorpayPaymentId && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Payment ID</p>
              <p className="font-mono text-sm text-slate-600">{booking.razorpayPaymentId}</p>
            </div>
          )}
        </div>

        {/* ── Right column: payment summary + actions ── */}
        <div className="card p-6">
          <h3 className="font-semibold text-ink mb-4">Payment summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium">{money(booking.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Discount</span>
              <span className="font-medium text-emerald-600">-{money(booking.discount || 0)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-3">
              <span className="font-semibold text-ink">Total paid</span>
              <span className="text-lg font-bold text-ink">{money(booking.total)}</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-slate-400 mb-1">Payment status</p>
            <StatusBadge status={booking.paymentStatus} />
          </div>

          <Button variant="secondary" className="mt-5 w-full justify-center gap-2" onClick={printInvoice}>
            <Printer size={16} /> Download invoice
          </Button>

          <Link to="/dashboard/bookings" className="mt-3 block text-center text-sm font-medium text-slate-500 hover:text-pine">
            ← Back to bookings
          </Link>

          {/* ── Cancel reservation action ── */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            {booking.status === 'cancelled' ? (
              <Button
                variant="danger"
                className="w-full justify-center gap-2 bg-coral/10 text-coral cursor-not-allowed"
                disabled
              >
                <XCircle size={16} /> Reservation Cancelled
              </Button>
            ) : canCancel ? (
              <Button
                variant="danger"
                className="w-full justify-center gap-2 bg-coral/10 text-coral hover:bg-coral hover:text-white"
                onClick={() => setShowCancelModal(true)}
              >
                <XCircle size={16} /> Cancel Reservation
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Cancel confirmation modal ── */}
      <ConfirmModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Cancel this reservation?"
        message={`Are you sure you want to cancel your booking for ${booking.room?.name || 'this room'}? This action cannot be undone.`}
        confirmLabel="Confirm Cancellation"
        cancelLabel="Keep Booking"
        danger
      />
    </div>
  );
}

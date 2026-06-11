import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Users, CreditCard, Printer, Home, BedDouble } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { money } from '../../utils/money';
import { formatDate } from '../../utils/dates';

export default function BookingSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const booking = state?.booking;
  const room = state?.room || booking?.room;

  if (!booking) {
    navigate('/hotels', { replace: true });
    return null;
  }

  function printInvoice() {
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Invoice - StayEase</title>
      <style>
        body{font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;color:#17211f}
        h1{color:#24594f;border-bottom:2px solid #edf5f2;padding-bottom:10px}
        table{width:100%;border-collapse:collapse;margin:20px 0}
        td,th{padding:10px;border:1px solid #e2e8f0;text-align:left}
        th{background:#f8fafc;font-size:12px;text-transform:uppercase;letter-spacing:0.05em}
        .total{font-weight:bold;font-size:16px}
        .footer{margin-top:30px;padding-top:20px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px}
      </style></head>
      <body>
        <h1>🏨 StayEase — Booking Confirmed</h1>
        <p><strong>Booking ID:</strong> #${String(booking._id).slice(-8).toUpperCase()}</p>
        <p><strong>Payment ID:</strong> ${booking.razorpayPaymentId || '—'}</p>
        <p><strong>Status:</strong> ${booking.paymentStatus?.toUpperCase()}</p>
        <table>
          <tr><th>Room</th><td>${room?.name || '—'}</td></tr>
          <tr><th>Type</th><td>${room?.type || '—'}</td></tr>
          <tr><th>Check-in</th><td>${formatDate(booking.checkIn)}</td></tr>
          <tr><th>Check-out</th><td>${formatDate(booking.checkOut)}</td></tr>
          <tr><th>Guests</th><td>${booking.guests}</td></tr>
          <tr><th>Guest name</th><td>${booking.guestDetails?.name || '—'}</td></tr>
          <tr><th>Subtotal</th><td>₹${booking.subtotal?.toLocaleString('en-IN') || 0}</td></tr>
          <tr><th>Discount</th><td>-₹${(booking.discount || 0).toLocaleString('en-IN')}</td></tr>
          <tr class="total"><th>Total paid</th><td>₹${booking.total?.toLocaleString('en-IN') || 0}</td></tr>
        </table>
        <div class="footer">
          <p>Thank you for choosing StayEase! We look forward to welcoming you.</p>
          <p>For support, contact: support@stayease.in</p>
        </div>
      </body></html>
    `);
    w.document.close();
    w.print();
  }

  return (
    <div className="min-h-screen bg-[#f6f8f5] flex items-center justify-center p-5">
      <div className="w-full max-w-lg">
        {/* Success animation */}
        <div className="text-center mb-8">
          <div className="inline-grid h-24 w-24 place-items-center rounded-full bg-emerald-100 shadow-lg">
            <CheckCircle size={52} className="text-emerald-500" />
          </div>
          <h1 className="mt-5 text-3xl font-bold text-ink">Booking confirmed! 🎉</h1>
          <p className="mt-2 text-slate-500">Your room has been reserved. Check your email for details.</p>
        </div>

        {/* Booking card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Booking ID</p>
              <p className="font-mono font-bold text-ink">#{String(booking._id).slice(-8).toUpperCase()}</p>
            </div>
            <StatusBadge status={booking.paymentStatus} />
          </div>

          {room && (
            <div className="flex items-center gap-3 rounded-xl bg-mist p-4 mb-5">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-pine text-white shrink-0">
                <BedDouble size={22} />
              </div>
              <div>
                <div className="font-semibold text-ink">{room.name}</div>
                <div className="text-sm text-slate-500">{room.type}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Calendar size={15} />, label: 'Check-in',  value: formatDate(booking.checkIn)  },
              { icon: <Calendar size={15} />, label: 'Check-out', value: formatDate(booking.checkOut) },
              { icon: <Users size={15} />,    label: 'Guests',    value: `${booking.guests} guest${booking.guests !== 1 ? 's' : ''}` },
              { icon: <CreditCard size={15} />,label: 'Paid',     value: money(booking.total)         },
            ].map((d) => (
              <div key={d.label} className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="flex items-center gap-1.5 text-pine mb-0.5">{d.icon}<span className="text-xs text-slate-400">{d.label}</span></div>
                <div className="font-semibold text-ink">{d.value}</div>
              </div>
            ))}
          </div>

          {booking.razorpayPaymentId && (
            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-400 mb-0.5">Payment ID</p>
              <p className="font-mono text-sm text-slate-600">{booking.razorpayPaymentId}</p>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" className="flex-1 justify-center gap-2" onClick={printInvoice}>
              <Printer size={16} /> Download invoice
            </Button>
            <Link to="/dashboard/bookings" className="flex-1">
              <Button variant="primary" className="w-full justify-center gap-2">
                <Calendar size={16} /> My bookings
              </Button>
            </Link>
          </div>

          <Link to="/" className="mt-3 flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-pine">
            <Home size={14} /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

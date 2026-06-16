import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, XCircle, FileText } from 'lucide-react';
import { StatusBadge } from './ui/Badge';
import { Button } from './ui/Button';
import { money } from '../utils/money';
import { formatDate } from '../utils/dates';

export function BookingTable({ bookings, onCancel, showUser = false }) {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-mist">
          <FileText size={28} className="text-pine/60" />
        </div>
        <h3 className="mt-4 font-semibold text-ink">No bookings found</h3>
        <p className="mt-1 text-sm text-slate-500">Your bookings will appear here once made.</p>
        <Link to="/hotels" className="mt-4 btn-primary">Browse Rooms</Link>
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-xl bg-white shadow-soft">
      <table className="w-full min-w-[800px]">
        <thead className="border-b border-slate-100 bg-slate-50/70">
          <tr>
            <th className="table-th">Booking ID</th>
            <th className="table-th">Room</th>
            {showUser && <th className="table-th">Guest</th>}
            <th className="table-th">Check-in</th>
            <th className="table-th">Check-out</th>
            <th className="table-th">Guests</th>
            <th className="table-th">Amount</th>
            <th className="table-th">Payment</th>
            <th className="table-th">Status</th>
            <th className="table-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking._id} className="table-row">
              <td className="table-td">
                <span className="font-mono text-xs text-slate-400">
                  #{String(booking._id).slice(-8).toUpperCase()}
                </span>
              </td>
              <td className="table-td">
                <div className="font-medium text-ink">{booking.room?.name || '—'}</div>
                <div className="text-xs text-slate-400">{booking.room?.type}</div>
              </td>
              {showUser && (
                <td className="table-td">
                  <div className="font-medium">{booking.user?.name || booking.guestDetails?.name || '—'}</div>
                  <div className="text-xs text-slate-400">{booking.user?.email}</div>
                </td>
              )}
              <td className="table-td">{formatDate(booking.checkIn)}</td>
              <td className="table-td">{formatDate(booking.checkOut)}</td>
              <td className="table-td">{booking.guests}</td>
              <td className="table-td font-semibold">{money(booking.total)}</td>
              <td className="table-td"><StatusBadge status={booking.paymentStatus} /></td>
              <td className="table-td"><StatusBadge status={booking.status} /></td>
              <td className="table-td">
                <div className="flex items-center gap-1.5">
                  <Link to={`/bookings/${booking._id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye size={14} />
                    </Button>
                  </Link>
                  {booking.status !== 'cancelled' && booking.status !== 'completed' && new Date(booking.checkIn) > new Date() && onCancel && (
                    <Button variant="ghost" size="sm" onClick={() => onCancel(booking)} className="text-coral hover:bg-coral/10">
                      <XCircle size={14} />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

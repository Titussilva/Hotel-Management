import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Heart, Bell, BedDouble, TrendingUp } from 'lucide-react';
import { bookingsAPI, notificationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { StatusBadge } from '../../components/ui/Badge';
import { StatSkeleton } from '../../components/ui/Skeleton';
import { money } from '../../utils/money';
import { formatDate } from '../../utils/dates';

function StatCard({ icon, label, value, sub, color = 'pine', loading }) {
  if (loading) return <StatSkeleton />;
  const colors = { pine: 'bg-pine/10 text-pine', coral: 'bg-coral/10 text-coral', gold: 'bg-gold/10 text-gold', blue: 'bg-blue-50 text-blue-600' };
  return (
    <div className="card p-5">
      <div className={`inline-grid h-11 w-11 place-items-center rounded-xl ${colors[color]}`}>{icon}</div>
      <div className="mt-3 text-2xl font-bold text-ink">{value}</div>
      <div className="text-sm font-medium text-slate-600">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { session } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bookingsAPI.list().catch(() => ({ data: [] })),
      notificationsAPI.list().catch(() => []),
    ]).then(([bRes, nRes]) => {
      const bArr = Array.isArray(bRes) ? bRes : (bRes.data || []);
      const nArr = Array.isArray(nRes) ? nRes : (nRes.data || []);
      setBookings(bArr);
      setNotifs(nArr);
    }).finally(() => setLoading(false));
  }, []);

  const upcoming  = bookings.filter((b) => b.status === 'upcoming' || b.status === 'active');
  const completed = bookings.filter((b) => b.status === 'completed');
  const totalSpent = bookings.filter((b) => b.paymentStatus === 'paid').reduce((s, b) => s + (b.total || 0), 0);
  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="page-title">Good {new Date().getHours() < 12 ? 'morning' : 'evening'}, {session?.user?.name?.split(' ')[0]}! 👋</h1>
        <p className="page-subtitle mt-1">Here's an overview of your bookings and account.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<CalendarDays size={22} />} label="Upcoming stays" value={upcoming.length} color="pine" loading={loading} />
        <StatCard icon={<BedDouble size={22} />} label="Total bookings" value={bookings.length} sub={`${completed.length} completed`} color="blue" loading={loading} />
        <StatCard icon={<TrendingUp size={22} />} label="Total spent" value={money(totalSpent)} color="gold" loading={loading} />
        <StatCard icon={<Bell size={22} />} label="Notifications" value={unread} sub="unread" color="coral" loading={loading} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link to="/hotels" className="flex items-center gap-4 rounded-xl bg-pine text-white p-5 transition-transform hover:scale-[1.01]">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/20"><BedDouble size={24} /></div>
          <div>
            <div className="font-semibold">Browse rooms</div>
            <div className="text-sm text-white/70">Find and book hotels</div>
          </div>
        </Link>
        <Link to="/dashboard/bookings" className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-soft transition-transform hover:scale-[1.01]">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-mist text-pine"><CalendarDays size={24} /></div>
          <div>
            <div className="font-semibold text-ink">My bookings</div>
            <div className="text-sm text-slate-500">View & manage stays</div>
          </div>
        </Link>
        <Link to="/favorites" className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-soft transition-transform hover:scale-[1.01]">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-coral/10 text-coral"><Heart size={24} /></div>
          <div>
            <div className="font-semibold text-ink">Favorites</div>
            <div className="text-sm text-slate-500">Saved rooms</div>
          </div>
        </Link>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Recent bookings</h2>
          <Link to="/dashboard/bookings" className="text-sm font-semibold text-pine hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="card p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-14" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="card flex flex-col items-center py-12 text-center">
            <CalendarDays size={40} className="text-slate-300" />
            <h3 className="mt-3 font-semibold text-ink">No bookings yet</h3>
            <p className="mt-1 text-sm text-slate-500">Your stays will appear here after booking.</p>
            <Link to="/hotels" className="btn-primary mt-4">Browse rooms</Link>
          </div>
        ) : (
          <div className="card overflow-auto">
            <table className="w-full min-w-[600px]">
              <thead className="border-b border-slate-100 bg-slate-50/70">
                <tr>
                  <th className="table-th">Room</th>
                  <th className="table-th">Check-in</th>
                  <th className="table-th">Check-out</th>
                  <th className="table-th">Amount</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b._id} className="table-row">
                    <td className="table-td font-medium text-ink">{b.room?.name || '—'}</td>
                    <td className="table-td">{formatDate(b.checkIn)}</td>
                    <td className="table-td">{formatDate(b.checkOut)}</td>
                    <td className="table-td font-semibold">{money(b.total)}</td>
                    <td className="table-td"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

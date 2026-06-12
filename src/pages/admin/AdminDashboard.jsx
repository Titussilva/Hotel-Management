import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { money, shortMoney } from '../../utils/money';
import { StatSkeleton } from '../../components/ui/Skeleton';
import { StatusBadge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/dates';
import {
  AreaChart, Area, BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { BedDouble, TrendingUp, CalendarDays, Star, Users, ChartNoAxesCombined } from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminAPI.analytics().catch(() => null),
      adminAPI.listBookings({ limit: 5 }).catch(() => ({ data: [] })),
    ]).then(([a, b]) => {
      setAnalytics(a?.data || a);
      const bArr = Array.isArray(b) ? b : (b.data || []);
      setBookings(bArr.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const stats = analytics ? [
    { icon: <TrendingUp size={22} />,        label: 'Total revenue',    value: shortMoney(analytics.revenue || 0),    color: 'gold' },
    { icon: <CalendarDays size={22} />,      label: 'Total bookings',   value: analytics.totalBookings || 0,           color: 'blue' },
    { icon: <BedDouble size={22} />,         label: 'Rooms active',     value: analytics.roomsCount || 0,              color: 'pine' },
    { icon: <ChartNoAxesCombined size={22} />,label: 'Occupancy',        value: `${analytics.occupancyRate || 0}%`,    color: 'coral' },
    { icon: <Star size={22} />,              label: 'Avg rating',        value: `${analytics.averageRating || 0} ★`,   color: 'gold' },
    { icon: <Users size={22} />,             label: 'Active bookings',   value: analytics.activeBookings || 0,         color: 'blue' },
  ] : [];

  const COLOR_MAP = { gold: 'bg-gold/10 text-gold', blue: 'bg-blue-50 text-blue-600', pine: 'bg-pine/10 text-pine', coral: 'bg-coral/10 text-coral' };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Overview of hotel operations and performance.</p>
      </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />)
          : stats.map((s) => (
              <div key={s.label} className="card p-5">
                <div className={`inline-grid h-11 w-11 place-items-center rounded-xl ${COLOR_MAP[s.color]}`}>{s.icon}</div>
                <div className="mt-3 text-2xl font-bold text-ink">{s.value}</div>
                <div className="text-sm font-medium text-slate-500">{s.label}</div>
              </div>
            ))}
      </div>

            {analytics?.monthlyData?.length > 0 && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <h3 className="font-semibold text-ink mb-4">Monthly bookings</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="bookings" stroke="#24594f" fill="#24594f" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-ink mb-4">Revenue (₹K)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#c8942f" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

            {analytics?.topRooms?.length > 0 && (
        <div className="mt-6 card p-5">
          <h3 className="font-semibold text-ink mb-4">Top booked rooms</h3>
          <div className="space-y-3">
            {analytics.topRooms.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-300 w-5 text-center">{i + 1}</span>
                  <span className="font-medium text-ink">{r.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-500">{r.count} bookings</span>
                  <span className="font-semibold text-pine">{money(r.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

            <div className="mt-6 card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink">Recent bookings</h3>
          <Link to="/admin/bookings" className="text-sm font-semibold text-pine hover:underline">View all</Link>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[600px]">
            <thead className="border-b border-slate-100">
              <tr>
                <th className="table-th">Room</th>
                <th className="table-th">Guest</th>
                <th className="table-th">Check-in</th>
                <th className="table-th">Amount</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="table-row">
                  <td className="table-td font-medium">{b.room?.name || '—'}</td>
                  <td className="table-td">{b.user?.name || '—'}</td>
                  <td className="table-td">{formatDate(b.checkIn)}</td>
                  <td className="table-td font-semibold">{money(b.total)}</td>
                  <td className="table-td"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

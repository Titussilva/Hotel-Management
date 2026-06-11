import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { StatSkeleton } from '../../components/ui/Skeleton';
import { money, shortMoney } from '../../utils/money';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from 'recharts';
import { TrendingUp, BedDouble, CalendarDays, Star, Users, Percent } from 'lucide-react';

const COLORS = ['#24594f', '#c8942f', '#df5b42', '#3b82f6', '#8b5cf6'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.analytics()
      .then((res) => setData(res.data || res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = data ? [
    { icon: <TrendingUp size={22} />,  label: 'Revenue (paid)',   value: shortMoney(data.revenue || 0),         color: 'bg-gold/10 text-gold'     },
    { icon: <CalendarDays size={22} />, label: 'Total bookings',  value: data.totalBookings || 0,                color: 'bg-blue-50 text-blue-600'  },
    { icon: <BedDouble size={22} />,   label: 'Active rooms',     value: data.roomsCount || 0,                   color: 'bg-pine/10 text-pine'      },
    { icon: <Percent size={22} />,     label: 'Occupancy rate',   value: `${data.occupancyRate || 0}%`,          color: 'bg-coral/10 text-coral'    },
    { icon: <Star size={22} />,        label: 'Avg guest rating', value: `${data.averageRating || 0} / 5`,       color: 'bg-gold/10 text-gold'      },
    { icon: <Users size={22} />,       label: 'Active bookings',  value: data.activeBookings || 0,               color: 'bg-purple-50 text-purple-600' },
  ] : [];

  const reviewPieData = (data?.reviewStatus || []).map((r) => ({
    name: r._id || 'unknown',
    value: r.count,
  }));

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Revenue, occupancy, and performance insights.</p>
      </div>

      {/* KPI stats */}
      {!loading && (!data || data.totalBookings === 0) ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-soft text-center">
          <TrendingUp size={40} className="text-slate-300" />
          <h3 className="mt-3 font-semibold text-ink">No analytics available</h3>
          <p className="mt-1 text-sm text-slate-500">Analytics will populate once bookings are made.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />)
          : stats.map((s) => (
              <div key={s.label} className="card p-5">
                <div className={`inline-grid h-11 w-11 place-items-center rounded-xl ${s.color}`}>{s.icon}</div>
                <div className="mt-3 text-2xl font-bold text-ink">{s.value}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
      </div>

      {/* Charts */}
      {data?.monthlyData?.length > 0 && (
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="card p-5">
            <h3 className="font-semibold text-ink mb-5">Monthly bookings trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="bookings" stroke="#24594f" fill="#24594f" fillOpacity={0.1} strokeWidth={2.5} name="Bookings" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-ink mb-5">Monthly revenue (₹K)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`₹${v}K`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#c8942f" radius={[6, 6, 0, 0]} name="Revenue ₹K" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pie + top rooms */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {reviewPieData.length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold text-ink mb-5">Review status breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={reviewPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {reviewPieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {data?.topRooms?.length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold text-ink mb-5">Top booked rooms</h3>
            <div className="space-y-3">
              {data.topRooms.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 grid place-items-center rounded-full bg-pine/10 text-pine text-xs font-bold">{i + 1}</span>
                    <span className="font-medium text-ink text-sm">{r.name}</span>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold text-ink">{r.count} bookings</div>
                    <div className="text-slate-400">{money(r.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}

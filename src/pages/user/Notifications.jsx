import React, { useEffect, useState } from 'react';
import { notificationsAPI } from '../../services/api';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Bell, CheckCheck, BedDouble, CreditCard, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dates';

const ICON_MAP = {
  booking: <BedDouble size={16} className="text-pine" />,
  payment: <CreditCard size={16} className="text-gold" />,
  reminder: <CalendarCheck size={16} className="text-blue-500" />,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    notificationsAPI.list()
      .then((res) => setNotifications(Array.isArray(res) ? res : (res.data || [])))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function markRead(id) {
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    } catch (e) {
      toast.error('Could not mark as read');
    }
  }

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.read);
    await Promise.allSettled(unread.map((n) => notificationsAPI.markRead(n._id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumbs items={[{ href: '/dashboard', label: 'Dashboard' }, { label: 'Notifications' }]} />

      <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="page-title">Notifications</h1>
          {unreadCount > 0 && (
            <span className="grid h-6 w-6 place-items-center rounded-full bg-coral text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck size={14} /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="card p-5"><TableSkeleton rows={5} /></div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 shadow-soft text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-mist">
            <Bell size={36} className="text-pine/60" />
          </div>
          <h3 className="mt-5 font-semibold text-ink">No notifications yet</h3>
          <p className="mt-2 text-sm text-slate-500">Booking confirmations, payment receipts, and reminders appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n._id} className={`flex items-start gap-4 rounded-xl p-4 transition-all ${n.read ? 'bg-white' : 'bg-pine/5 border-l-4 border-pine'} shadow-sm`}>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100">
                {ICON_MAP[n.type] || <Bell size={16} className="text-slate-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-ink">{n.title}</div>
                  {!n.read && <Badge variant="pine">New</Badge>}
                </div>
                <p className="mt-0.5 text-sm text-slate-600">{n.message}</p>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="text-xs text-slate-400">{formatDate(n.createdAt)}</span>
                  <Badge variant="slate">{n.channel || 'in_app'}</Badge>
                </div>
              </div>
              {!n.read && (
                <Button variant="ghost" size="sm" onClick={() => markRead(n._id)} className="shrink-0">
                  Mark read
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

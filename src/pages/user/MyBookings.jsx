import React, { useEffect, useState } from 'react';
import { bookingsAPI } from '../../services/api';
import { BookingTable } from '../../components/BookingTable';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmModal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { value: 'all',       label: 'All' },
  { value: 'upcoming',  label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];
const PER_PAGE = 10;

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  function load() {
    setLoading(true);
    bookingsAPI.list({ status: tab === 'all' ? undefined : tab, search })
      .then((res) => {
        const arr = Array.isArray(res) ? res : (res.data || []);
        setBookings(arr);
        setPage(1);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [tab, search]);

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await bookingsAPI.cancel(cancelTarget._id);
      toast.success('Booking cancelled successfully');
      load();
    } catch (e) {
      toast.error(e.message || 'Cancellation failed');
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  }

  const paginated = bookings.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumbs items={[{ href: '/dashboard', label: 'Dashboard' }, { label: 'My Bookings' }]} />

      <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.value}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === t.value ? 'bg-pine text-white shadow-sm' : 'bg-white text-slate-600 shadow-sm hover:bg-slate-50'
            }`}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-5 relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input-field pl-9" placeholder="Search by booking ID or room name…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="card p-5"><TableSkeleton rows={8} /></div>
      ) : (
        <>
          <BookingTable bookings={paginated} onCancel={setCancelTarget} />
          {bookings.length > PER_PAGE && (
            <div className="mt-6">
              <Pagination page={page} totalPages={Math.ceil(bookings.length / PER_PAGE)} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
        loading={cancelling}
        title="Cancel booking"
        message={`Are you sure you want to cancel your booking for ${cancelTarget?.room?.name}? This action cannot be undone.`}
        confirmLabel="Yes, cancel"
        danger
      />
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { BookingTable } from '../../components/BookingTable';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmModal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];
const PER_PAGE = 15;

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [globalTotal, setGlobalTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionTarget, setActionTarget] = useState(null);
  const [acting, setActing] = useState(false);

  function load() {
    setLoading(true);
    adminAPI.listBookings({ status: tab === 'all' ? undefined : tab, search, page, limit: PER_PAGE })
      .then((res) => {
        const arr = Array.isArray(res) ? res : (res.data || []);
        setBookings(arr);
        setTotal(res.total || arr.length);
        setGlobalTotal(res.globalTotal || res.total || arr.length);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [tab, search, page]);

  async function handleCancel() {
    if (!actionTarget) return;
    setActing(true);
    try {
      await adminAPI.updateBooking(actionTarget._id, { status: 'cancelled' });
      toast.success('Booking cancelled');
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActing(false);
      setActionTarget(null);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="page-title">Booking Management</h1>
        <p className="page-subtitle">{globalTotal} total bookings</p>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.value}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === t.value ? 'bg-ink text-white' : 'bg-white text-slate-600 shadow-sm hover:bg-slate-50'}`}
            onClick={() => { setTab(t.value); setPage(1); }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-5 relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input-field pl-9" placeholder="Search booking, room or guest…"
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {loading ? (
        <div className="card p-5"><TableSkeleton rows={10} /></div>
      ) : (
        <>
          <BookingTable bookings={bookings} onCancel={setActionTarget} showUser />
          {total > PER_PAGE && (
            <div className="mt-6">
              <Pagination page={page} totalPages={Math.ceil(total / PER_PAGE)} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <ConfirmModal open={!!actionTarget} onClose={() => setActionTarget(null)} onConfirm={handleCancel}
        loading={acting} title="Cancel booking" danger confirmLabel="Cancel booking"
        message={`Cancel booking for ${actionTarget?.room?.name || 'this room'}?`} />
    </div>
  );
}

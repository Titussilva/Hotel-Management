import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Star, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { formatDate } from '../../utils/dates';
import toast from 'react-hot-toast';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'removed', label: 'Removed' },
];

export default function ReviewsModeration() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [acting, setActing] = useState(null);

  function load() {
    setLoading(true);
    adminAPI.listReviews({ status: tab === 'all' ? undefined : tab })
      .then((res) => setReviews(Array.isArray(res) ? res : (res.data || [])))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [tab]);

  async function moderate(reviewId, status, adminResponse) {
    setActing(reviewId);
    try {
      await adminAPI.updateReview(reviewId, { status, ...(adminResponse ? { adminResponse } : {}) });
      toast.success(`Review ${status}`);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="page-title">Reviews Moderation</h1>
        <p className="page-subtitle">{reviews.length} reviews in current view</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.value}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === t.value ? 'bg-ink text-white' : 'bg-white text-slate-600 shadow-sm hover:bg-slate-50'}`}
            onClick={() => setTab(t.value)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-5"><TableSkeleton rows={6} /></div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-soft text-center">
          <MessageSquare size={40} className="text-slate-300" />
          <h3 className="mt-3 font-semibold text-ink">No reviews in this category</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} className={i < r.rating ? 'text-gold fill-gold' : 'text-slate-300'} fill={i < r.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <StatusBadge status={r.status} />
                    {r.room?.name && <Badge variant="pine">{r.room.name}</Badge>}
                  </div>
                  <p className="font-semibold text-ink">{r.title || 'Guest review'}</p>
                  <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
                  {r.adminResponse && (
                    <div className="mt-2 rounded-lg bg-pine/5 p-3 text-sm text-pine">
                      <strong>Admin response:</strong> {r.adminResponse}
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span>{r.user?.name || 'Guest'}</span>
                    <span>·</span>
                    <span>{formatDate(r.createdAt)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {r.status !== 'approved' && (
                    <Button variant="primary" size="sm" loading={acting === r._id} onClick={() => moderate(r._id, 'approved')}>
                      <CheckCircle size={14} /> Approve
                    </Button>
                  )}
                  {r.status !== 'removed' && (
                    <Button variant="danger" size="sm" loading={acting === r._id} onClick={() => moderate(r._id, 'removed')}>
                      <XCircle size={14} /> Remove
                    </Button>
                  )}
                  {r.status !== 'removed' && (
                    <Button variant="secondary" size="sm" loading={acting === r._id}
                      onClick={() => moderate(r._id, 'approved', 'Thank you for your feedback. We appreciate your stay with us at StayEase.')}>
                      <MessageSquare size={14} /> Respond
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

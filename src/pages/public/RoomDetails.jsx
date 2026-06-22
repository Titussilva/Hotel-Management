import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BedDouble, Users, Hotel, Star, CalendarDays, ArrowLeft } from 'lucide-react';
import { roomsAPI, reviewsAPI } from '../../services/api';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { money } from '../../utils/money';
import { formatDate, today, addDays } from '../../utils/dates';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const reviewSchema = z.object({
  rating:  z.number().min(1).max(5),
  title:   z.string().optional(),
  comment: z.string().min(20, 'Review must be at least 20 characters'),
});

export default function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, isAuthenticated, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [checkIn, setCheckIn] = useState(today());
  const [checkOut, setCheckOut] = useState(addDays(today(), 3));

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, title: '', comment: '' },
  });

  useEffect(() => {
    roomsAPI.get(id)
      .then(setData)
      .catch(() => navigate('/hotels', { replace: true }))
      .finally(() => setLoading(false));
  }, [id]);

  async function onReviewSubmit(values) {
    if (!isAuthenticated) { toast.error('Log in to submit a review'); return; }
    setSubmittingReview(true);
    try {
      await reviewsAPI.create({ roomId: id, ...values });
      toast.success('Review submitted for moderation');
      reset();
      roomsAPI.get(id).then(setData).catch(() => {});
    } catch (e) {
      toast.error(e.message || 'Review submission failed');
    } finally {
      setSubmittingReview(false);
    }
  }

  function handleBook() {
    if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: `/rooms/${id}` } } }); return; }
    navigate(`/checkout/${data.room._id}`, { state: { room: data.room, checkIn, checkOut } });
  }

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size="xl" />
    </div>
  );

  const room = data?.room;
  const reviews = data?.reviews || [];
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-6">
          <Breadcrumbs items={[{ href: '/hotels', label: 'Hotels' }, { label: room.name }]} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
                    <div>
                        <div className="relative overflow-hidden rounded-2xl">
              <img
                className="h-80 w-full object-cover sm:h-96"
                src={room.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                alt={room.name}
              />
              {room.images?.length > 1 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {room.images.slice(1, 4).map((img, i) => (
                    <img key={i} src={img} alt="" className="h-24 w-full rounded-xl object-cover" />
                  ))}
                </div>
              )}
            </div>

                        <div className="mt-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-ink">{room.name}</h1>
                  <p className="mt-1 text-slate-500">{room.type} · {room.size} · {room.view}</p>
                </div>
                {avgRating && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-gold/10 px-3 py-1.5">
                    <Star size={16} className="text-gold" fill="currentColor" />
                    <span className="font-bold text-gold">{avgRating}</span>
                    <span className="text-sm text-slate-500">({reviews.length} reviews)</span>
                  </div>
                )}
              </div>

              <p className="mt-4 text-slate-600 leading-7">{room.description}</p>

                            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: <BedDouble size={18} />, label: 'Bed type', value: room.bedType },
                  { icon: <Users size={18} />, label: 'Max guests', value: `${room.maxGuests} guests` },
                  { icon: <Hotel size={18} />, label: 'View', value: room.view },
                  { icon: <CalendarDays size={18} />, label: 'Available', value: `${room.availableUnits ?? room.totalUnits} units` },
                ].map((d) => (
                  <div key={d.label} className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-1.5 text-pine">{d.icon}</div>
                    <div className="mt-1.5 text-xs text-slate-500">{d.label}</div>
                    <div className="font-semibold text-ink text-sm">{d.value}</div>
                  </div>
                ))}
              </div>

                            <div className="mt-6">
                <h3 className="font-semibold text-ink mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {room.amenities?.map((a) => (
                    <span key={a} className="rounded-lg bg-mist px-3 py-1.5 text-sm font-medium text-pine">{a}</span>
                  ))}
                </div>
              </div>

                            <div className="mt-8">
                <h3 className="font-semibold text-ink mb-4">Guest reviews ({reviews.length})</h3>
                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-500">No reviews yet. Be the first to leave one after your stay.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.slice(0, 6).map((r) => (
                      <div key={r._id} className="rounded-xl bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-ink">{r.user?.name || 'Guest'}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} size={14} className="text-gold" fill="currentColor" />
                            ))}
                          </div>
                        </div>
                        {r.title && <div className="mt-1 text-sm font-medium text-slate-700">{r.title}</div>}
                        <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
                        <div className="mt-2 text-xs text-slate-400">{formatDate(r.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                )}

                                {isAuthenticated && (
                  <form onSubmit={handleSubmit(onReviewSubmit)} className="mt-6 rounded-xl border border-slate-200 p-5">
                    <h4 className="font-semibold text-ink mb-4">Write a review</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="label">Rating</label>
                        <select className="input-field" {...register('rating', { valueAsNumber: true })}>
                          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n !== 1 ? 's' : ''}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label">Title (optional)</label>
                        <input className="input-field" placeholder="Summarise your stay" {...register('title')} />
                      </div>
                      <div>
                        <label className="label">Your review</label>
                        <textarea className={`input-field h-24 resize-none ${errors.comment ? 'input-error' : ''}`}
                          placeholder="Tell other guests about your experience (min 20 characters)" {...register('comment')} />
                        {errors.comment && <p className="mt-1 text-xs text-red-500">{errors.comment.message}</p>}
                      </div>
                      <Button type="submit" loading={submittingReview}>Submit review</Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

                    <div className="lg:sticky lg:top-24 h-fit">
            {!isAdmin ? (
              <div className="card p-6">
                <div className="text-3xl font-bold text-ink">
                  {money(room.price)}
                  <span className="text-base font-normal text-slate-400"> / night</span>
                </div>
                <div className="mt-5 space-y-3">
                  <div>
                    <label className="label">Select dates</label>
                    <input type="date" className="input-field" value={checkIn} min={today()}
                      onChange={(e) => setCheckIn(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Check availability</label>
                    <input type="date" className="input-field" value={checkOut} min={checkIn}
                      onChange={(e) => setCheckOut(e.target.value)} />
                  </div>
                </div>
                <div className="mt-5 rounded-xl bg-mist p-4 text-sm">
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Room rate</span>
                    <span>{money(room.price)} / night</span>
                  </div>
                  <div className="flex justify-between font-semibold text-ink border-t border-slate-200 pt-2 mt-2">
                    <span>Total (estimated)</span>
                    <span>{money(room.price * Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)))}</span>
                  </div>
                </div>
                <Button className="mt-4 w-full justify-center py-3 text-base" onClick={handleBook}
                  disabled={(room.availableUnits ?? room.totalUnits) <= 0}>
                  {(room.availableUnits ?? room.totalUnits) <= 0 ? 'Sold out' : 'Book Now'}
                </Button>
                <p className="mt-3 text-center text-xs text-slate-400">No charge until confirmed</p>
              </div>
            ) : (
              <div className="card p-6 text-center">
                <p className="text-sm font-semibold text-slate-500">Admins cannot create reservations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

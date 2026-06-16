import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Search } from 'lucide-react';
import { roomsAPI } from '../../services/api';
import { RoomCard, EmptyRooms } from '../../components/RoomCard';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { Pagination } from '../../components/ui/Pagination';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { today, addDays } from '../../utils/dates';
import { money } from '../../utils/money';
import toast from 'react-hot-toast';

const ROOM_TYPES = ['', 'Suite', 'Deluxe', 'Family', 'Business', 'Premium', 'Heritage', 'Executive', 'Cabana', 'Standard', 'Wellness'];
const PER_PAGE = 9;

export default function Hotels() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { session, isAuthenticated } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [filters, setFilters] = useState({
    checkIn:  params.get('checkIn')  || today(),
    checkOut: params.get('checkOut') || addDays(today(), 3),
    type:     params.get('type')     || '',
    guests:   params.get('guests')   || 2,
    minPrice: '',
    maxPrice: 50000,
    sort:     'price_asc',
  });

  useEffect(() => {
    setLoading(true);
    const q = { sort: filters.sort };
    if (filters.type) q.type = filters.type;
    if (filters.guests) q.guests = filters.guests;
    if (filters.checkIn) q.checkIn = filters.checkIn;
    if (filters.checkOut) q.checkOut = filters.checkOut;
    if (filters.maxPrice) q.maxPrice = filters.maxPrice;
    if (filters.minPrice) q.minPrice = filters.minPrice;

    roomsAPI.list(q)
      .then((data) => {
        const arr = Array.isArray(data) ? data : (data.data || []);
        setRooms(arr);
        setPage(1);
      })
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    if (!isAuthenticated) return;
    authAPI.me().then((r) => {
      setFavoriteIds(new Set((r.user?.favorites || []).map(String)));
    }).catch(() => {});
  }, [isAuthenticated]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return rooms.slice(start, start + PER_PAGE);
  }, [rooms, page]);

  async function toggleFavorite(room) {
    if (!isAuthenticated) { toast.error('Log in to save favorites'); return; }
    const next = new Set(favoriteIds);
    next.has(String(room._id)) ? next.delete(String(room._id)) : next.add(String(room._id));
    setFavoriteIds(next);
    try {
      await authAPI.toggleFavorite(room._id);
    } catch {  }
  }

  const f = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-coral">All stays</p>
          <h1 className="mt-1 text-3xl font-bold text-ink">Browse rooms</h1>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
                    <aside className="w-full shrink-0 lg:w-72">
            <div className="card p-5 space-y-5 sticky top-24">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <SlidersHorizontal size={18} className="text-pine" /> Filters
              </div>

              <div>
                <label className="label">Check in</label>
                <input type="date" className="input-field" value={filters.checkIn} min={today()} onChange={(e) => f('checkIn', e.target.value)} />
              </div>
              <div>
                <label className="label">Check out</label>
                <input type="date" className="input-field" value={filters.checkOut} min={filters.checkIn} onChange={(e) => f('checkOut', e.target.value)} />
              </div>
              <div>
                <label className="label">Guests</label>
                <input type="number" className="input-field" value={filters.guests} min={1} max={10} onChange={(e) => f('guests', e.target.value)} />
              </div>
              <div>
                <label className="label">Room type</label>
                <select className="input-field" value={filters.type} onChange={(e) => f('type', e.target.value)}>
                  {ROOM_TYPES.map((t) => <option key={t} value={t}>{t || 'Any type'}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Sort by</label>
                <select className="input-field" value={filters.sort} onChange={(e) => f('sort', e.target.value)}>
                  <option value="price_asc">Price: low → high</option>
                  <option value="price_desc">Price: high → low</option>
                </select>
              </div>
              <div>
                <label className="label">Max price: {money(filters.maxPrice)}</label>
                <input type="range" className="mt-2 w-full accent-pine" min={5000} max={50000} step={500}
                  value={filters.maxPrice} onChange={(e) => f('maxPrice', Number(e.target.value))} />
              </div>
            </div>
          </aside>

                    <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {loading ? 'Searching…' : `${rooms.length} room${rooms.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {loading
                ? Array.from({ length: PER_PAGE }).map((_, i) => <CardSkeleton key={i} />)
                : paginated.length > 0
                ? paginated.map((room) => (
                    <RoomCard
                      key={room._id}
                      room={room}
                      isFavorite={favoriteIds.has(String(room._id))}
                      onFavorite={toggleFavorite}
                      onSelect={(r) => {
                        if (!isAuthenticated) {
                          navigate('/login', { state: { from: { pathname: '/hotels' } } });
                          return;
                        }
                        navigate('/checkout', {
                          state: { room: r, checkIn: filters.checkIn, checkOut: filters.checkOut },
                        });
                      }}
                    />
                  ))
                : <div className="col-span-full"><EmptyRooms /></div>}
            </div>
            {!loading && rooms.length > PER_PAGE && (
              <div className="mt-10">
                <Pagination page={page} totalPages={Math.ceil(rooms.length / PER_PAGE)} onPageChange={setPage} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

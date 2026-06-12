import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { authAPI, roomsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { RoomCard } from '../../components/RoomCard';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import toast from 'react-hot-toast';

export default function Favorites() {
  const { session } = useAuth();
  const [favoriteRooms, setFavoriteRooms] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.me().then((res) => {
      const ids = (res.user?.favorites || []).map(String);
      setFavoriteIds(new Set(ids));
      if (ids.length === 0) { setLoading(false); return; }
      roomsAPI.list()
        .then((data) => {
          const all = Array.isArray(data) ? data : (data.data || []);
          setFavoriteRooms(all.filter((r) => ids.includes(String(r._id))));
        })
        .finally(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, []);

  async function toggleFavorite(room) {
    const next = new Set(favoriteIds);
    next.has(String(room._id)) ? next.delete(String(room._id)) : next.add(String(room._id));
    setFavoriteIds(next);
    setFavoriteRooms((prev) => prev.filter((r) => next.has(String(r._id))));
    try {
      await authAPI.toggleFavorite(room._id);
      toast.success(`${room.name} removed from favorites`);
    } catch {  }
  }

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumbs items={[{ href: '/dashboard', label: 'Dashboard' }, { label: 'Favorites' }]} />
      <div className="mt-4 mb-8">
        <h1 className="page-title">Favorites</h1>
        <p className="page-subtitle">{favoriteRooms.length} saved room{favoriteRooms.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : favoriteRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 shadow-soft text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-coral/10">
            <Heart size={36} className="text-coral/60" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-ink">No saved rooms yet</h3>
          <p className="mt-2 text-sm text-slate-500">Click the heart icon on any room card to save it here.</p>
          <Link to="/hotels" className="btn-primary mt-6">Browse rooms</Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {favoriteRooms.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              isFavorite={favoriteIds.has(String(room._id))}
              onFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BedDouble, CalendarDays, Heart, Star, Users } from 'lucide-react';
import { money } from '../utils/money';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';

export function RoomCard({ room, onFavorite, isFavorite, onSelect, selected }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <article className="group overflow-hidden rounded-xl bg-white shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <div className="relative h-52 overflow-hidden">
        <img
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={room.images?.[0] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'}
          alt={room.name}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent" />
                <div className="absolute bottom-3 left-3">
          <span className={`rounded-md px-2.5 py-1 text-xs font-semibold text-white ${
            (room.availableUnits ?? 0) > 0 ? 'bg-emerald-600/90' : 'bg-red-600/90'
          }`}>
            {(room.availableUnits ?? 0) > 0 ? `${room.availableUnits} available` : 'Sold out'}
          </span>
        </div>
                {onFavorite && (
          <button
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-coral shadow-sm transition-all hover:bg-white hover:scale-110 active:scale-100"
            onClick={() => onFavorite(room)}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}
                <div className="absolute right-3 bottom-3">
          <span className="rounded-md bg-white/90 px-2.5 py-1 text-xs font-semibold text-pine backdrop-blur-sm">
            {room.type}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-ink line-clamp-1">{room.name}</h3>
        <p className="mt-1 text-sm text-slate-500">{room.size} · {room.view}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-2">{room.description}</p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
            <BedDouble size={14} className="text-pine" />{room.bedType}
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
            <Users size={14} className="text-pine" />Up to {room.maxGuests} guests
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {room.amenities?.slice(0, 4).map((item) => (
            <span key={item} className="rounded-md bg-mist px-2 py-0.5 text-xs font-medium text-pine">{item}</span>
          ))}
          {(room.amenities?.length || 0) > 4 && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              +{room.amenities.length - 4} more
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <span className="text-2xl font-bold text-ink">{money(room.price)}</span>
            <span className="text-sm text-slate-400"> / night</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/rooms/${room._id}`)}
            >
              View Details
            </Button>
            {onSelect && user?.role !== 'admin' && (
              <Button
                variant={selected ? 'dark' : 'primary'}
                size="sm"
                disabled={(room.availableUnits ?? 0) <= 0}
                onClick={() => onSelect(room)}
              >
                {selected ? 'Selected' : 'Book Now'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function EmptyRooms() {
  return (
    <div className="col-span-3 flex flex-col items-center justify-center rounded-xl bg-white py-20 shadow-soft">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-mist">
        <BedDouble size={36} className="text-pine/60" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-ink">No rooms match your search</h3>
      <p className="mt-2 text-sm text-slate-500">Try adjusting filters or expanding the price range.</p>
    </div>
  );
}

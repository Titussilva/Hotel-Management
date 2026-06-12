import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Star, BedDouble, ChevronRight, BadgePercent, Search } from 'lucide-react';
import { roomsAPI, offersAPI } from '../../services/api';
import { RoomCard, EmptyRooms } from '../../components/RoomCard';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { money } from '../../utils/money';
import { today, addDays } from '../../utils/dates';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=80';

const FEATURES = [
  { icon: <ShieldCheck size={24} />, title: 'Verified stays', desc: 'Every room is quality-checked and reviewed by real guests.' },
  { icon: <Star size={24} />,        title: 'Top-rated',      desc: 'Curated selection of 4- and 5-star hotels across India.' },
  { icon: <BedDouble size={24} />,   title: 'Best price',     desc: 'Price-match guarantee — book with confidence every time.' },
];

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ checkIn: today(), checkOut: addDays(today(), 3), guests: 2 });

  useEffect(() => {
    Promise.all([
      roomsAPI.list({ sort: 'price_asc' }).catch(() => ({ data: [] })),
      offersAPI.list().catch(() => []),
    ]).then(([rData, oData]) => {
      const rArr = Array.isArray(rData) ? rData : (rData.data || []);
      setRooms(rArr.slice(0, 6));
      setOffers(Array.isArray(oData) ? oData : (oData.data || []));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
            <section className="relative min-h-[92vh] overflow-hidden bg-ink">
        <img className="absolute inset-0 h-full w-full object-cover opacity-65" src={HERO_IMAGE} alt="Luxury hotel" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col px-5 py-5 sm:px-8">
          <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1fr_460px]">
            <div className="text-white">
              <p className="mb-4 inline-flex items-center gap-2 rounded-lg bg-white/14 px-3 py-2 text-sm backdrop-blur">
                <ShieldCheck size={16} /> Verified hotel bookings with instant confirmation
              </p>
              <h1 className="text-5xl font-bold leading-tight sm:text-6xl text-balance">
                Find your perfect <span className="text-coral">stay</span> in India
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
                Search real-time availability, apply exclusive offers, and manage your bookings from one elegant dashboard.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/hotels" className="btn-primary text-base px-6 py-3">Browse all rooms</Link>
                <Link to="/register" className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition-all">
                  Create account
                </Link>
              </div>
            </div>

                        <div className="rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink">Quick search</h2>
                <Search size={20} className="text-pine" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label">Check in</label>
                  <input type="date" className="input-field" value={search.checkIn} min={today()}
                    onChange={(e) => setSearch({ ...search, checkIn: e.target.value })} />
                </div>
                <div>
                  <label className="label">Check out</label>
                  <input type="date" className="input-field" value={search.checkOut} min={search.checkIn}
                    onChange={(e) => setSearch({ ...search, checkOut: e.target.value })} />
                </div>
                <div>
                  <label className="label">Guests</label>
                  <input type="number" className="input-field" value={search.guests} min={1} max={10}
                    onChange={(e) => setSearch({ ...search, guests: e.target.value })} />
                </div>
                <Link
                  to={`/hotels?checkIn=${search.checkIn}&checkOut=${search.checkOut}&guests=${search.guests}`}
                  className="btn-primary w-full justify-center text-base py-3"
                >
                  Search rooms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

            <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mist text-pine">{f.icon}</div>
                <div>
                  <h3 className="font-semibold text-ink">{f.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

            <section className="py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-coral">Hand-picked</p>
              <h2 className="mt-2 text-3xl font-bold text-ink">Featured rooms</h2>
            </div>
            <Link to="/hotels" className="flex items-center gap-1 text-sm font-semibold text-pine hover:underline">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
              : rooms.length > 0
              ? rooms.map((room) => <RoomCard key={room._id} room={room} />)
              : <EmptyRooms />}
          </div>
        </div>
      </section>

            {offers.length > 0 && (
        <section className="bg-ink py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-coral">Save more</p>
                <h2 className="mt-2 text-3xl font-bold text-white">Exclusive offers</h2>
              </div>
              <Link to="/offers" className="flex items-center gap-1 text-sm font-semibold text-white/70 hover:text-white">
                All offers <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {offers.slice(0, 3).map((offer) => (
                <div key={offer.code} className="rounded-xl bg-white/8 p-5">
                  <div className="flex items-start justify-between">
                    <BadgePercent className="text-coral" size={28} />
                    <span className="rounded-lg bg-coral/20 px-2.5 py-1 text-sm font-bold text-coral">{offer.code}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-white">{offer.title}</h3>
                  <p className="mt-1 text-sm text-white/65">{offer.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

            <section className="py-20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-4xl font-bold text-ink">Ready to book your dream stay?</h2>
          <p className="mt-4 text-lg text-slate-500">Join thousands of guests who trust StayEase for seamless hotel bookings.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3">Start booking</Link>
            <Link to="/hotels" className="btn-secondary text-base px-8 py-3">Browse hotels</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

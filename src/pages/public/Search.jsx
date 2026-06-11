import React from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-mist">
        <Search size={36} className="text-pine/60" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-ink">Advanced Search</h1>
      <p className="mt-2 text-slate-500 max-w-md">
        Use the filters on the Hotels page to search by type, price, guests, amenities, and dates.
      </p>
      <Link to="/hotels" className="btn-primary mt-6 inline-flex items-center gap-2">
        <SlidersHorizontal size={16} /> Go to filtered search
      </Link>
    </div>
  );
}

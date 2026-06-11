import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BadgePercent, Copy, CheckCheck, Tag } from 'lucide-react';
import { offersAPI } from '../../services/api';
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    offersAPI.list()
      .then((data) => setOffers(Array.isArray(data) ? data : (data.data || [])))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }, []);

  function copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      toast.success(`Code ${code} copied!`);
      setTimeout(() => setCopied(''), 3000);
    });
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-coral">Limited time</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Special offers & deals</h1>
        <p className="mt-2 text-slate-500">Apply these codes at checkout for instant savings.</p>

        {loading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="mt-12 flex flex-col items-center text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-mist">
              <BadgePercent size={36} className="text-pine/60" />
            </div>
            <h3 className="mt-4 font-semibold text-ink">No active offers right now</h3>
            <p className="mt-1 text-sm text-slate-500">Check back soon for great deals.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {offers.map((offer) => (
              <div key={offer._id || offer.code}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-pine/5" />
                <div className="flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-mist text-pine">
                    <BadgePercent size={24} />
                  </div>
                  <button
                    onClick={() => copyCode(offer.code)}
                    className="flex items-center gap-1.5 rounded-lg bg-pine/10 px-3 py-1.5 text-sm font-bold text-pine transition-all hover:bg-pine/20"
                  >
                    <span className="font-mono">{offer.code}</span>
                    {copied === offer.code ? <CheckCheck size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
                <h3 className="mt-4 text-xl font-bold text-ink">{offer.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{offer.description}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    {offer.discountType === 'percentage' ? `${offer.discountValue}% off` : `₹${offer.discountValue} off`}
                  </span>
                  {offer.minStayNights > 1 && <span>Min {offer.minStayNights} nights</span>}
                </div>
                <Link to="/hotels" className="mt-4 inline-flex items-center text-sm font-semibold text-pine hover:underline">
                  Browse rooms →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

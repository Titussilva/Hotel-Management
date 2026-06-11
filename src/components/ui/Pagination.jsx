import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  }).filter((p) => p >= 1 && p <= totalPages);

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-medium transition-colors ${
            p === page
              ? 'bg-pine text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

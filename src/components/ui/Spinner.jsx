import React from 'react';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8', xl: 'h-12 w-12' };
  return (
    <svg
      className={`animate-spin text-pine ${sizes[size]} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8f5]">
      <div className="text-center">
        <Spinner size="xl" />
        <p className="mt-3 text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  );
}

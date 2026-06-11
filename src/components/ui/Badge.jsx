import React from 'react';

export function Badge({ children, variant = 'slate' }) {
  const variants = {
    green:  'bg-emerald-50 text-emerald-700',
    red:    'bg-red-50 text-red-600',
    amber:  'bg-amber-50 text-amber-700',
    blue:   'bg-blue-50 text-blue-700',
    slate:  'bg-slate-100 text-slate-600',
    pine:   'bg-pine/10 text-pine',
    coral:  'bg-coral/10 text-coral',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${variants[variant] || variants.slate}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    upcoming:  { label: 'Upcoming',  variant: 'blue'  },
    completed: { label: 'Completed', variant: 'green' },
    cancelled: { label: 'Cancelled', variant: 'red'   },
    paid:      { label: 'Paid',      variant: 'green' },
    pending:   { label: 'Pending',   variant: 'amber' },
    failed:    { label: 'Failed',    variant: 'red'   },
    refunded:  { label: 'Refunded',  variant: 'slate' },
    approved:  { label: 'Approved',  variant: 'green' },
    removed:   { label: 'Removed',   variant: 'red'   },
    active:    { label: 'Active',    variant: 'green' },
    inactive:  { label: 'Inactive',  variant: 'slate' },
  };
  const { label, variant } = map[status] || { label: status, variant: 'slate' };
  return <Badge variant={variant}>{label}</Badge>;
}

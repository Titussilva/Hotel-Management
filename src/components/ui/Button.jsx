import React from 'react';

export function Button({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary:   'bg-pine text-white hover:bg-pine/90 focus:ring-pine/40',
    secondary: 'border border-pine text-pine hover:bg-pine/8 focus:ring-pine/30',
    danger:    'bg-coral text-white hover:bg-coral/90 focus:ring-coral/40',
    ghost:     'text-slate-600 hover:bg-slate-100 focus:ring-slate-200',
    dark:      'bg-ink text-white hover:bg-ink/90 focus:ring-ink/30',
    white:     'bg-white text-pine hover:bg-slate-50 shadow-sm focus:ring-pine/20',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

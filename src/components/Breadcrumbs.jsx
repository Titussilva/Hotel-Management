import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs({ items }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-500">
      <Link to="/" className="flex items-center gap-1 transition-colors hover:text-pine">
        <Home size={14} />
        <span>Home</span>
      </Link>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <ChevronRight size={14} className="shrink-0 text-slate-300" />
          {item.href && i < items.length - 1 ? (
            <Link to={item.href} className="transition-colors hover:text-pine">{item.label}</Link>
          ) : (
            <span className="font-medium text-ink">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

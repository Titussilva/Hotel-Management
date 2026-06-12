import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Hotel, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/hotels', label: 'Hotels' },
  { to: '/search', label: 'Search' },
  { to: '/offers', label: 'Offers' },
];

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { session, loading, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-pine text-white">
              <Hotel size={20} />
            </span>
            <span className="text-lg font-bold text-ink">StayEase</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-pine' : 'text-slate-600 hover:text-ink'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100 hidden md:block"></div>
            ) : isAuthenticated ? (
              <div className="hidden md:flex items-center gap-4">
                {!isAdmin && (
                  <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-pine transition-colors">
                    My Bookings
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-pine transition-colors">
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-2 rounded-full border border-slate-200 p-1 pr-3 hover:bg-slate-50 transition-colors">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-pine text-white font-bold text-sm">
                    {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {session?.user?.name || 'Profile'}
                  </span>
                </div>
                <button onClick={() => { logout(); navigate('/'); }} className="text-sm font-medium text-slate-500 hover:text-coral transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden text-sm font-semibold text-slate-700 hover:text-pine md:block">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary hidden text-sm md:inline-flex">
                  Get started
                </Link>
              </>
            )}
            <button className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 md:hidden">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="block py-2.5 text-sm font-medium text-slate-700" onClick={() => setMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
              {isAuthenticated ? (
                <>
                  <Link to={isAdmin ? "/admin" : "/dashboard"} className="btn-primary text-center" onClick={() => setMenuOpen(false)}>
                    {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                  </Link>
                  <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }} className="btn-secondary text-center">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary text-center" onClick={() => setMenuOpen(false)}>Log in</Link>
                  <Link to="/register" className="btn-primary text-center" onClick={() => setMenuOpen(false)}>Get started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-pine text-white">
                <Hotel size={16} />
              </span>
              <span className="font-bold text-ink">StayEase</span>
            </Link>
            <p className="text-sm text-slate-500">© 2026 StayEase. Premium hotel reservations.</p>
            <div className="flex gap-4 text-sm text-slate-500">
              <Link to="/hotels" className="hover:text-pine">Hotels</Link>
              <Link to="/offers" className="hover:text-pine">Offers</Link>
              <Link to="/login" className="hover:text-pine">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

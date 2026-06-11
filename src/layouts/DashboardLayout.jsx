import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Hotel, LayoutDashboard, CalendarDays, Heart, User,
  Bell, Settings, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/dashboard/bookings', icon: CalendarDays, label: 'My Bookings' },
  { to: '/favorites',       icon: Heart,           label: 'Favorites'  },
  { to: '/notifications',   icon: Bell,            label: 'Notifications' },
  { to: '/profile',         icon: User,            label: 'Profile'    },
  { to: '/settings',        icon: Settings,        label: 'Settings'   },
];

export function DashboardLayout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-pine">
            <Hotel size={20} />
          </span>
          <span className="text-lg font-bold text-white">StayEase</span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-5">
        <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-white font-bold text-sm">
            {session?.user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">{session?.user?.name}</div>
            <div className="truncate text-xs text-white/60">{session?.user?.email}</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-3">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white/18 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8f5]">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col bg-pine lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-pine shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
          <button
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/hotels" className="text-sm font-medium text-slate-600 hover:text-pine">Browse Hotels</Link>
            <Link to="/notifications" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
              <Bell size={18} />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

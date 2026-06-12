import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Hotel, LayoutDashboard, BedDouble, CalendarDays,
  MessageSquareText, BadgePercent, ChartNoAxesCombined,
  LogOut, Menu, Bell,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const adminLinks = [
  { to: '/admin',               icon: LayoutDashboard,       label: 'Dashboard'      },
  { to: '/admin/rooms',         icon: BedDouble,             label: 'Rooms'          },
  { to: '/admin/bookings',      icon: CalendarDays,          label: 'Bookings'       },
  { to: '/admin/reviews',       icon: MessageSquareText,     label: 'Reviews'        },
  { to: '/admin/offers',        icon: BadgePercent,          label: 'Offers'         },
  { to: '/admin/analytics',     icon: ChartNoAxesCombined,   label: 'Analytics'      },
];

export function AdminLayout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() { logout(); navigate('/login'); }

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-ink">
            <Hotel size={20} />
          </span>
          <span className="text-base font-bold text-white">StayEase Admin</span>
        </Link>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-coral text-white font-bold text-sm">
            {session?.user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">{session?.user?.name}</div>
            <div className="text-xs text-white/60">Administrator</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {adminLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/18 text-white'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/65 transition-all hover:bg-white/10 hover:text-white"
        >
          <LogOut size={17} />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8f5]">
            <aside className="hidden w-60 flex-shrink-0 flex-col bg-ink lg:flex">
        <SidebarContent />
      </aside>

            {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-ink shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
          <div className="flex items-center gap-3">
            <button
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="hidden text-sm font-semibold text-slate-400 md:block">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-pine">
              Switch to Guest View
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

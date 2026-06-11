import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, User, Bell, Shield, ChevronRight } from 'lucide-react';

const SETTINGS_LINKS = [
  { icon: <User size={20} />,    label: 'Edit Profile',        sub: 'Update name, phone, preferences', href: '/profile' },
  { icon: <Bell size={20} />,    label: 'Notifications',       sub: 'View your notifications',          href: '/notifications' },
  { icon: <Shield size={20} />,  label: 'Account Security',    sub: 'Password and account settings',    href: '/profile' },
];

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center gap-3">
        <Settings size={24} className="text-pine" />
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="max-w-2xl space-y-3">
        {SETTINGS_LINKS.map((item) => (
          <Link key={item.href + item.label} to={item.href}
            className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-soft transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-mist text-pine shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink">{item.label}</div>
              <div className="text-sm text-slate-500">{item.sub}</div>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}

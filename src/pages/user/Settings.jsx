import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, User, Bell, Shield, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '../../services/api';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const SETTINGS_LINKS = [
  { icon: <User size={20} />,    label: 'Edit Profile',        sub: 'Update name, phone, preferences', href: '/profile' },
  { icon: <Bell size={20} />,    label: 'Notifications',       sub: 'View your notifications',          href: '/notifications' },
];

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string()
    .min(8, 'Must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword']
});

export default function SettingsPage() {
  const { logout } = useAuth();
  const [updating, setUpdating] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const onSubmit = async (data) => {
    setUpdating(true);
    try {
      await authAPI.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password updated successfully');
      reset();
      // Optional: logout()
    } catch (e) {
      toast.error(e.message || 'Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center gap-3">
        <Settings size={24} className="text-pine" />
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="max-w-2xl space-y-3 mb-8">
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

      <div className="max-w-2xl">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-mist text-pine shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Account Security</h2>
              <p className="text-sm text-slate-500">Update your password</p>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" className={`input-field ${errors.currentPassword ? 'input-error' : ''}`} {...register('currentPassword')} />
              {errors.currentPassword && <p className="mt-1 text-xs text-red-500">{errors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className={`input-field ${errors.newPassword ? 'input-error' : ''}`} {...register('newPassword')} />
              {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`} {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" loading={updating} className="mt-2">Update Password</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

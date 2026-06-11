import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters'),
  phone:   z.string().regex(/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number').optional().or(z.literal('')),
  bedType: z.string().optional(),
  budget:  z.coerce.number().min(0).optional(),
});

export default function Profile() {
  const { session, updateSession } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    authAPI.me().then((res) => {
      const u = res.user;
      reset({
        name:    u.name || '',
        phone:   u.phone || '',
        bedType: u.preferences?.bedType || '',
        budget:  u.preferences?.budget || '',
      });
    }).catch(() => {}).finally(() => setPageLoading(false));
  }, []);

  async function onSubmit({ name, phone, bedType, budget }) {
    try {
      const res = await authAPI.updateProfile({
        name,
        phone: phone || undefined,
        preferences: { bedType: bedType || undefined, budget: budget ? Number(budget) : undefined },
      });
      updateSession({ user: { ...session.user, name: res.user?.name || name } });
      toast.success('Profile updated successfully');
    } catch (e) {
      toast.error(e.message || 'Update failed');
    }
  }

  if (pageLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size="xl" /></div>;

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumbs items={[{ href: '/dashboard', label: 'Dashboard' }, { label: 'Profile' }]} />
      <div className="mt-4 mb-8">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal details and preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="label">Full name *</label>
              <input className={`input-field ${errors.name ? 'input-error' : ''}`} {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email</label>
              <input className="input-field bg-slate-50 cursor-not-allowed" value={session?.user?.email || ''} disabled />
              <p className="mt-1 text-xs text-slate-400">Email cannot be changed.</p>
            </div>

            <div>
              <label className="label">Phone</label>
              <input className={`input-field ${errors.phone ? 'input-error' : ''}`} placeholder="+91 98765 43210" {...register('phone')} />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h3 className="font-semibold text-ink mb-4">Preferences</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Preferred bed type</label>
                  <select className="input-field" {...register('bedType')}>
                    <option value="">Any</option>
                    {['King bed', 'Queen bed', 'Twin beds', 'Single bed'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Budget per night (₹)</label>
                  <input type="number" className="input-field" min={0} {...register('budget')} />
                </div>
              </div>
            </div>

            <Button type="submit" loading={isSubmitting} className="mt-2">Save changes</Button>
          </form>
        </div>

        <div className="card p-6 h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-pine text-white text-3xl font-bold">
              {session?.user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <h3 className="mt-3 font-semibold text-ink">{session?.user?.name}</h3>
            <p className="text-sm text-slate-500">{session?.user?.email}</p>
            <span className="mt-2 rounded-lg bg-mist px-2.5 py-1 text-xs font-semibold capitalize text-pine">
              {session?.user?.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Hotel, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters'),
  email:           z.string().email('Enter a valid email address'),
  password:        z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone:           z.string().regex(/^\+?[\d\s\-().]{7,20}$/, 'Enter a valid phone number').optional().or(z.literal('')),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function Register() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', phone: '' },
  });

  async function onSubmit({ name, email, password, phone }) {
    try {
      const sess = await authRegister({ name, email, password, phone: phone || undefined });
      toast.success(`Welcome to StayEase, ${sess.user.name}!`);
      const redirectPath = state?.from?.pathname || '/hotels';
      navigate(redirectPath, { replace: true });
    } catch (e) {
      toast.error(e.message || 'Registration failed');
    }
  }

  return (
    <div className="grid min-h-screen bg-ink lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden lg:block">
        <img className="absolute inset-0 h-full w-full object-cover opacity-70"
          src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1800&q=80" alt="" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/50 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <Link to="/" className="mb-8 flex items-center gap-3 text-2xl font-bold text-white">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-pine"><Hotel size={26} /></span>
            StayEase
          </Link>
          <h1 className="max-w-xl text-5xl font-bold leading-tight text-white">
            Join thousands of happy travellers.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-white/75">
            Create a free account to book premium hotel rooms, track stays, and unlock exclusive offers.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12 bg-[#f6f8f5]">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-coral">Get started</p>
            <h2 className="mt-1 text-3xl font-bold text-ink">Create account</h2>
            <p className="mt-1 text-sm text-slate-500">Fill in your details to get started.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
              <div>
                <label className="label">Full name *</label>
                <input id="name" className={`input-field ${errors.name ? 'input-error' : ''}`}
                  placeholder="Ava Stone" autoComplete="name" {...register('name')} />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label">Email *</label>
                <input id="email" type="email" className={`input-field ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com" autoComplete="email" {...register('email')} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Password * <span className="text-xs font-normal text-slate-400">(min 8 chars)</span></label>
                <div className="relative">
                  <input id="password" type={showPw ? 'text' : 'password'}
                    className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="••••••••" autoComplete="new-password" {...register('password')} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div>
                <label className="label">Confirm password *</label>
                <input id="confirmPassword" type={showPw ? 'text' : 'password'}
                  className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="••••••••" autoComplete="new-password" {...register('confirmPassword')} />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              <div>
                <label className="label">Phone <span className="text-xs font-normal text-slate-400">(optional)</span></label>
                <input id="phone" type="tel" className={`input-field ${errors.phone ? 'input-error' : ''}`}
                  placeholder="+91 98765 43210" autoComplete="tel" {...register('phone')} />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
              </div>

              <Button type="submit" className="w-full justify-center py-3" loading={isSubmitting}>
                Create account
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" state={state} className="font-semibold text-pine hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

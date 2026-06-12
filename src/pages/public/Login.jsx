import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Hotel, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
  }, [isAuthenticated]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit({ email, password }) {
    try {
      const sess = await login(email, password);
      toast.success(`Welcome back, ${sess.user.name}!`);
      navigate(sess.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (e) {
      toast.error(e.message || 'Login failed. Check your credentials.');
    }
  }

  return (
    <div className="grid min-h-screen bg-ink lg:grid-cols-[1.1fr_0.9fr]">
            <section className="relative hidden overflow-hidden lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-70"
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=80"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/50 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <Link to="/" className="mb-8 flex items-center gap-3 text-2xl font-bold text-white">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-pine">
              <Hotel size={26} />
            </span>
            StayEase
          </Link>
          <h1 className="max-w-xl text-5xl font-bold leading-tight text-white">
            Your next great stay is one login away.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-white/75">
            Access live availability, manage bookings, apply exclusive offers, and more.
          </p>
        </div>
      </section>

            <section className="flex items-center justify-center px-5 py-12 bg-[#f6f8f5]">
        <div className="w-full max-w-md">
          <div className="mb-2 flex justify-center lg:hidden">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-ink">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-pine text-white"><Hotel size={18} /></span>
              StayEase
            </Link>
          </div>
          <div className="card p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-coral">Welcome back</p>
            <h2 className="mt-1 text-3xl font-bold text-ink">Log in</h2>
            <p className="mt-1 text-sm text-slate-500">Enter your credentials to access your account.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
              <div>
                <label className="label">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`input-field ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  {...register('email')}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="label">Password</label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="••••••••"
                    {...register('password')}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full justify-center py-3" loading={isSubmitting}>
                Log in
              </Button>
            </form>

            <div className="mt-5 rounded-xl bg-mist px-4 py-3 text-sm text-slate-600">
              <strong className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Demo credentials</strong>
              Guest: guest@stayease.test / password123<br />
              Admin: admin@stayease.test / password123
            </div>

            <p className="mt-5 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-pine hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stethoscope, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const loginSchema = (en: boolean) => z.object({
  email:    z.string().email(en ? 'Invalid email' : 'Email invalide'),
  password: z.string().min(6, en ? 'Password required' : 'Mot de passe requis'),
});
type LoginForm = { email: string; password: string };

export default function LoginForm({ callbackError }: { callbackError: boolean }) {
  const locale = useLocale();
  const en = locale === 'en';
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(callbackError ? (en ? 'Invalid or expired link. Try again or request a new link.' : 'Lien invalide ou expiré. Réessayez ou demandez un nouveau lien.') : null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema(en)),
  });

  async function onSubmit(data: LoginForm) {
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) { setError(error.message); return; }
      // Reload to discard any prefetched anonymous page state after authentication.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/${locale}/dashboard`);
    } catch { setError(en ? 'Sign in failed. Try again.' : 'Connexion impossible. Réessayez.'); }
  }



  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow mb-4">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold">
            <span className="text-[#1a2e25] dark:text-green-50">Med</span>
            <span className="text-gradient">QCM</span>
          </h1>
          <p className="text-sm text-[#4b7a62] dark:text-green-400 mt-1">{en ? 'Welcome back to MedQCM' : 'Bon retour sur MedQCM'}</p>
        </div>

        {/* Card */}
        <div className="card p-8 animate-in">
          <h2 className="text-xl font-bold mb-6 text-[#1a2e25] dark:text-green-50">{en ? 'Sign in' : 'Connexion'}</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-[#1a2e25] dark:text-green-100 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email')}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder={en ? 'you@example.com' : 'vous@exemple.com'}
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-[#1a2e25] dark:text-green-100 mb-1">{en ? 'Password' : 'Mot de passe'}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password')}
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? (en ? 'Hide password' : 'Masquer le mot de passe') : (en ? 'Show password' : 'Afficher le mot de passe')}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link href={`/${locale}/forgot-password`} className="text-xs text-primary-600 hover:underline dark:text-primary-400">
                {en ? 'Forgot password?' : 'Mot de passe oublié ?'}
              </Link>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {en ? 'Sign in' : 'Se connecter'}
            </button>
          </form>



          <p className="text-center text-sm text-[#4b7a62] mt-6 dark:text-green-500">
            {en ? 'No account yet?' : 'Pas encore de compte ?'}{' '}
            <Link href={`/${locale}/register`} className="text-primary-600 font-semibold hover:underline dark:text-primary-400">
              {en ? 'Create one' : 'S’inscrire'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stethoscope, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const loginSchema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe requis'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage({ params }: { params: { locale: string } }) {
  const t = useRouter();
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setError(null);

    // In local / development mode: handle recognized admin and student logins
    const isAdminEmail = data.email.toLowerCase().includes('admin') || data.email.toLowerCase() === 'medqcmpay@gmail.com';
    
    // Set cookies for session & role
    document.cookie = 'demo_session=true; path=/; max-age=86400';
    document.cookie = `demo_role=${isAdminEmail ? 'admin' : 'student'}; path=/; max-age=86400`;

    if (isAdminEmail) {
      router.push('/fr/admin');
    } else {
      router.push('/fr/dashboard');
    }
    router.refresh();
  }

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/fr/dashboard` },
    });
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
          <p className="text-sm text-[#4b7a62] dark:text-green-400 mt-1">Bon retour sur MedQCM</p>
        </div>

        {/* Card */}
        <div className="card p-8 animate-in">
          <h2 className="text-xl font-bold mb-6 text-[#1a2e25] dark:text-green-50">Connexion</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#1a2e25] dark:text-green-100 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="votre@email.com"
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#1a2e25] dark:text-green-100 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link href="/fr/forgot-password" className="text-xs text-primary-600 hover:underline dark:text-primary-400">
                Mot de passe oublié ?
              </Link>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Se connecter
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-primary-100 dark:bg-dark-border" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px bg-primary-100 dark:bg-dark-border" />
          </div>

          {/* Google */}
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all dark:bg-dark-card dark:border-dark-border dark:text-green-100 dark:hover:bg-dark-muted"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>

          {/* Testing Quick Fill (Only for development convenience) */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-border">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className="font-semibold text-gray-400">Comptes de test (Développement) :</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  document.cookie = 'demo_session=true; path=/; max-age=86400';
                  document.cookie = 'demo_role=student; path=/; max-age=86400';
                  router.push('/fr/dashboard');
                  router.refresh();
                }}
                className="flex-1 py-1.5 px-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-[11px] font-medium text-gray-700 text-center transition-colors dark:bg-dark-muted dark:border-dark-border dark:text-green-300"
              >
                🎓 Étudiant (test)
              </button>
              <button
                type="button"
                onClick={() => {
                  document.cookie = 'demo_session=true; path=/; max-age=86400';
                  document.cookie = 'demo_role=admin; path=/; max-age=86400';
                  router.push('/fr/admin');
                  router.refresh();
                }}
                className="flex-1 py-1.5 px-2.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-[11px] font-medium text-amber-800 text-center transition-colors dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300"
              >
                🛡️ Admin (test)
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-[#4b7a62] mt-6 dark:text-green-500">
            Pas encore de compte ?{' '}
            <Link href="/fr/register" className="text-primary-600 font-semibold hover:underline dark:text-primary-400">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

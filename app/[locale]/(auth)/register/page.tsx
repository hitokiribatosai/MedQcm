'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stethoscope, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const registerSchema = z.object({
  fullName: z.string().min(3, 'Nom requis (minimum 3 caractères)'),
  email:    z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    setError(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email:    data.email,
        password: data.password,
        options: {
          data: { full_name: data.fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback?locale=${locale}`,
        },
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      if (authData.session) { router.replace(`/${locale}/dashboard`); router.refresh(); return; }
      setSuccess(true);
    } catch { setError('Connexion impossible. Réessayez.'); }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-dark-bg flex items-center justify-center px-4">
        <div className="card p-10 max-w-md w-full text-center animate-in">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-[#1a2e25] dark:text-green-50">Vérifiez votre email !</h2>
          <p className="text-sm text-[#4b7a62] dark:text-green-400">
            Un lien de confirmation a été envoyé à votre adresse email. Cliquez dessus pour activer votre compte.
          </p>
          <Link href={`/${locale}/login`} className="btn-primary mt-6 inline-flex">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-bg flex items-center justify-center px-4 py-12">
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
          <p className="text-sm text-[#4b7a62] dark:text-green-400 mt-1">Rejoignez des milliers d&apos;étudiants en médecine</p>
        </div>

        <div className="card p-8 animate-in">
          <h2 className="text-xl font-bold mb-6 text-[#1a2e25] dark:text-green-50">Créer un compte</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[#1a2e25] dark:text-green-100 mb-1">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('fullName')}
                  placeholder="Votre nom complet"
                  className={`input pl-10 ${errors.fullName ? 'input-error' : ''}`}
                />
              </div>
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
            </div>

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
                  placeholder="Min. 8 caractères"
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

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3 mt-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Créer mon compte
            </button>
          </form>

          <p className="text-center text-sm text-[#4b7a62] mt-6 dark:text-green-500">
            Déjà un compte ?{' '}
            <Link href={`/${locale}/login`} className="text-primary-600 font-semibold hover:underline dark:text-primary-400">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

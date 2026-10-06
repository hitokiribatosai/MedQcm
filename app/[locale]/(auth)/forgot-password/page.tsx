'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stethoscope, Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const forgotSchema = (en: boolean) => z.object({
  email: z.string().email(en ? 'Invalid email address' : 'Adresse email invalide'),
});
type ForgotForm = { email: string };

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const en = locale === 'en';
  const supabase = createClient();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema(en)),
  });

  async function onSubmit(data: ForgotForm) {
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback?locale=${locale}&next=/${locale}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message || (en ? 'An error occurred.' : 'Une erreur est survenue.'));
        return;
      }

      setSubmitted(true);
    } catch { setError(en ? 'Request failed. Try again.' : 'Demande impossible. Réessayez.'); }
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
          <p className="text-sm text-[#4b7a62] dark:text-green-400 mt-1">{en ? 'Password reset' : 'Réinitialisation du mot de passe'}</p>
        </div>

        {/* Card */}
        <div className="card p-8 animate-in">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto dark:bg-primary-950/40">
                <CheckCircle2 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-xl font-bold text-[#1a2e25] dark:text-green-50">{en ? 'Email sent!' : 'Email envoyé !'}</h2>
              <p className="text-sm text-[#4b7a62] dark:text-green-300">
                {en ? 'If an account exists for this email, you will receive a password reset link shortly.' : 'Si un compte existe pour cet email, vous recevrez bientôt un lien pour réinitialiser votre mot de passe.'}
              </p>
              <div className="pt-2">
                <Link href={`/${locale}/login`} className="btn-primary w-full justify-center">
                  {en ? 'Back to sign in' : 'Retour à la connexion'}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-2 text-[#1a2e25] dark:text-green-50">{en ? 'Forgot password?' : 'Mot de passe oublié ?'}</h2>
              <p className="text-sm text-[#4b7a62] dark:text-green-400 mb-6">
                {en ? 'Enter your email to receive reset instructions.' : 'Entrez votre adresse email pour recevoir les instructions de réinitialisation.'}
              </p>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-[#1a2e25] dark:text-green-100 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('email')}
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder={en ? 'you@example.com' : 'vous@exemple.com'}
                      className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3 mt-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {en ? 'Send reset link' : 'Envoyer le lien'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href={`/${locale}/login`}
                  className="inline-flex items-center gap-2 text-sm text-[#4b7a62] hover:text-primary-700 dark:text-green-400 dark:hover:text-primary-300 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {en ? 'Back to sign in' : 'Retour à la connexion'}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

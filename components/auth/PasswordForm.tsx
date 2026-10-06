'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from 'next-intl';

export default function PasswordForm() {
  const en = useLocale() === 'en';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(''); setSuccess(false);
    if (password.length < 8) { setError(en ? 'Use at least 8 characters.' : 'Utilisez au moins 8 caractères.'); return; }
    if (password !== confirmation) { setError(en ? 'Passwords do not match.' : 'Les mots de passe ne correspondent pas.'); return; }
    setBusy(true);
    try {
      const supabase = createClient();
      const { data, error: sessionError } = await supabase.auth.getUser();
      if (sessionError || !data.user) { setError(en ? 'Sign in again or request a new reset link.' : 'Reconnectez-vous ou demandez un nouveau lien de réinitialisation.'); return; }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) { setError(error.message); return; }
      setPassword(''); setConfirmation(''); setSuccess(true);
    } catch { setError(en ? 'Could not update the password. Try again.' : 'Modification impossible. Réessayez.'); }
    finally { setBusy(false); }
  }

  return <form onSubmit={submit} className="space-y-4">
    <h3 className="font-bold">{en ? 'Change password' : 'Modifier le mot de passe'}</h3>
    <label className="block">{en ? 'New password' : 'Nouveau mot de passe'}
      <input className="input mt-1" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} />
    </label>
    <label className="block">{en ? 'Confirm new password' : 'Confirmer le nouveau mot de passe'}
      <input className="input mt-1" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={e => setConfirmation(e.target.value)} />
    </label>
    {error && <p role="alert" className="text-red-600">{error}</p>}
    {success && <p role="status" className="text-emerald-600">{en ? 'Password updated.' : 'Mot de passe mis à jour.'}</p>}
    <button className="btn-primary" disabled={busy} type="submit">{busy ? '…' : en ? 'Update password' : 'Mettre à jour le mot de passe'}</button>
  </form>;
}

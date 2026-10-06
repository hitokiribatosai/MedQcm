'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, Calendar, School, CheckCircle2,
  Lock, LogOut, Save
} from 'lucide-react';
import { logout } from '@/lib/auth/logout';
import PasswordForm from '@/components/auth/PasswordForm';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

const ALGERIAN_FACULTIES = [
  'Faculté de Médecine d\'Alger (Zania / Alexis Larrey)',
  'Faculté de Médecine d\'Oran',
  'Faculté de Médecine de Constantine',
  'Faculté de Médecine d\'Annaba',
  'Faculté de Médecine de Sétif',
  'Faculté de Médecine de Batna',
  'Faculté de Médecine de Tlemcen',
  'Faculté de Médecine de Sidi Bel Abbès',
  'Faculté de Médecine de Blida',
  'Faculté de Médecine de Béjaïa',
  'Faculté de Médecine de Tizi Ouzou',
  'Faculté de Médecine de Mostaganem',
  'Autre faculté (Étranger / Privé)',
];

const STUDY_YEARS = [
  { id: '1ere-annee', label: '1ère Année Médecine (PCEM1)', labelEn: 'Year 1 medicine' },
  { id: '2eme-annee', label: '2ème Année Médecine (PCEM2)', labelEn: 'Year 2 medicine' },
  { id: '3eme-annee', label: '3ème Année Médecine (PCEM3)', labelEn: 'Year 3 medicine' },
  { id: '4eme-annee', label: '4ème Année Médecine (DCEM1)', labelEn: 'Year 4 medicine' },
  { id: '5eme-annee', label: '5ème Année Médecine (DCEM2)', labelEn: 'Year 5 medicine' },
  { id: '6eme-annee', label: '6ème Année Médecine (DCEM3)', labelEn: 'Year 6 medicine' },
  { id: '7eme-annee', label: '7ème Année (Internat)', labelEn: 'Year 7 internship' },
  { id: 'residanat',  label: 'Préparation Concours de Résidanat', labelEn: 'Residency exam preparation' },
];

const AVATAR_OPTIONS = ['👨‍⚕️', '👩‍⚕️', '🩺', '🧠', '🫀', '🧬', '🔬', '💊'];

export default function ProfilePage() {
  const router = useRouter();
  const locale = useLocale();
  const en = locale === 'en';
  const supabase = createClient();

  // Form State
  const [avatar, setAvatar] = useState('👨‍⚕️');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phone, setPhone] = useState('');
  const [faculty, setFaculty] = useState('');
  const [studyYear, setStudyYear] = useState('');
  const [goal, setGoal] = useState('');

  // Status
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!active) return;
        if (error || !data.user) { setProfileError(en ? 'Unable to load your profile. Sign in again.' : 'Impossible de charger votre profil. Reconnectez-vous.'); return; }
        const meta = data.user.user_metadata;
        const text = (key: string) => typeof meta[key] === 'string' ? meta[key] : '';
        setEmail(data.user.email ?? '');
        setFullName(text('full_name')); setBirthday(text('birthday'));
        setPhone(text('phone')); setFaculty(text('faculty')); setStudyYear(text('studyYear'));
        setAvatar(text('avatar') || '👨‍⚕️'); setGoal(text('goal'));
      } catch { if (active) setProfileError(en ? 'Unable to load your profile.' : 'Impossible de charger votre profil.'); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [supabase, en]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaved(false); setProfileError(''); setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: {
        full_name: fullName.trim(), birthday, phone, faculty, studyYear,
        avatar, goal,
      } });
      if (error) { setProfileError(error.message); return; }
      setIsSaved(true);
      router.refresh();
    } catch { setProfileError(en ? 'Could not save your profile. Try again.' : 'Enregistrement impossible. Réessayez.'); }
    finally { setSaving(false); }
  }

  async function handleLogout() {
    try { await logout(locale); }
    catch { setProfileError(en ? 'Sign out failed. Try again.' : 'Déconnexion impossible. Réessayez.'); }
  }

  if (loading) return <p role="status" className="p-8">{en ? 'Loading profile…' : 'Chargement du profil…'}</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in pb-16">
      {profileError && <p role="alert" className="text-red-600">{profileError}</p>}
      {/* Toast Notification on Save */}
      {isSaved && (
        <div role="status" className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-sm font-black">{en ? 'Profile updated.' : 'Profil mis à jour avec succès !'} 🎉</span>
        </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-white dark:bg-dark-card rounded-3xl p-6 sm:p-8 border-2 border-emerald-100 dark:border-dark-border shadow-sm relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-100/50 dark:bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar & Selector */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-5xl shadow-card border-4 border-white dark:border-dark-card">
              {avatar}
            </div>
            <div className="flex items-center gap-1 bg-surface-50 dark:bg-dark-muted p-1 rounded-2xl border border-gray-200 dark:border-dark-border">
              {AVATAR_OPTIONS.slice(0, 4).map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  aria-label={`${en ? 'Choose avatar' : 'Choisir l’avatar'} ${emoji}`}
                  aria-pressed={avatar === emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`text-lg p-1.5 rounded-xl hover:scale-110 transition-transform ${avatar === emoji ? 'bg-white dark:bg-dark-card shadow-xs' : ''}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* User Overview */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-[#1a2e25] dark:text-green-50">
                {fullName || (en ? 'MedQCM student' : 'Étudiant MedQCM')}
              </h1>
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                🎓 {en ? 'Student' : 'Étudiant'}
              </span>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {faculty}
            </p>

            {goal && <p className="text-xs text-primary-600 dark:text-primary-400 font-bold italic">« {goal} »</p>}

          </div>

          {/* Logout Action */}
          <div className="shrink-0 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40 text-xs font-black border border-red-200 dark:border-red-900 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{en ? 'Sign out' : 'Se déconnecter'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b-2 border-gray-100 dark:border-dark-border pb-1">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'info'
              ? 'bg-primary-600 text-white shadow-card'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-muted'
          }`}
        >
          <User className="w-4 h-4" />
          {en ? 'Personal information' : 'Informations personnelles'}
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-primary-600 text-white shadow-card'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-muted'
          }`}
        >
          <Lock className="w-4 h-4" />
          {en ? 'Security' : 'Sécurité'}
        </button>
      </div>

      {/* TAB 1: Edit Profile Form */}
      {activeTab === 'info' && (
        <form onSubmit={handleSave} className="bg-white dark:bg-dark-card rounded-3xl p-6 sm:p-8 border-2 border-gray-100 dark:border-dark-border space-y-6">
          <div className="border-b border-gray-100 dark:border-dark-border pb-4">
            <h2 className="text-lg font-black text-[#1a2e25] dark:text-green-50">
              {en ? 'Edit my details' : 'Modifier mes coordonnées'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {en ? 'These details are saved in your account. The displayed curriculum is still a draft.' : 'Ces informations sont enregistrées dans votre compte. Le programme affiché reste provisoire.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nom & Prénom */}
            <div>
              <label htmlFor="profile-name" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {en ? 'Full name' : 'Nom complet'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  id="profile-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={en ? 'Your full name' : 'Votre nom complet'}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-dark-border dark:bg-dark-muted font-semibold text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="profile-email" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {en ? 'Email address' : 'Adresse email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  id="profile-email"
                  value={email}
                  readOnly
                  aria-label={en ? 'Account email (read only)' : 'Adresse email du compte (lecture seule)'}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-dark-border dark:bg-dark-muted font-semibold text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Date de naissance (Birthday) */}
            <div>
              <label htmlFor="profile-birthday" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {en ? 'Date of birth (optional)' : 'Date de naissance (facultative)'}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  id="profile-birthday"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-dark-border dark:bg-dark-muted font-semibold text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Numéro de téléphone */}
            <div>
              <label htmlFor="profile-phone" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {en ? 'Phone number (optional)' : 'Numéro de téléphone (facultatif)'}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  id="profile-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05 / 06 / 07..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-dark-border dark:bg-dark-muted font-semibold text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Faculté de Médecine */}
            <div className="sm:col-span-2">
              <label htmlFor="profile-faculty" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {en ? 'Medical faculty' : 'Faculté de médecine'}
              </label>
              <div className="relative">
                <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  id="profile-faculty"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-dark-border dark:bg-dark-muted font-semibold text-sm focus:border-emerald-500 focus:outline-hidden appearance-none"
                >
                  <option value="">{en ? 'Choose a faculty' : 'Choisir une faculté'}</option>
                  {ALGERIAN_FACULTIES.map((fac) => (
                    <option key={fac} value={fac}>{fac}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Année d&apos;étude actuelle */}
            <div className="sm:col-span-2">
              <label htmlFor="profile-year" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {en ? 'Current year of study' : 'Année d’étude actuelle'}
              </label>
              <select
                id="profile-year"
                value={studyYear}
                onChange={(e) => setStudyYear(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-dark-border dark:bg-dark-muted font-semibold text-sm focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="">{en ? 'Choose a year' : 'Choisir une année'}</option>
                {STUDY_YEARS.map((yr) => (
                  <option key={yr.id} value={yr.id}>{en ? yr.labelEn : yr.label}</option>
                ))}
              </select>
            </div>

            {/* Objectif personnel */}
            <div className="sm:col-span-2">
              <label htmlFor="profile-goal" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {en ? 'Personal study goal' : 'Objectif personnel de révision'}
              </label>
              <input
                type="text"
                id="profile-goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder={en ? 'For example: revise anatomy each week' : 'Ex. : réviser l’anatomie chaque semaine'}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-dark-border dark:bg-dark-muted font-semibold text-sm focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
            <button
              disabled={saving || loading || !email}
              type="submit"
              className="btn-duo-green px-8 py-3.5 text-sm font-black flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{en ? 'Save changes' : 'Sauvegarder les modifications'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-dark-card rounded-3xl p-6 sm:p-8 border-2 border-gray-100 dark:border-dark-border space-y-6 animate-in">
          <div className="border-b border-gray-100 dark:border-dark-border pb-4">
            <h2 className="text-lg font-black text-[#1a2e25] dark:text-green-50">
              {en ? 'Account security' : 'Sécurité du compte'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {en ? 'Manage your password.' : 'Gérez votre mot de passe.'}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-dark-border">
            <PasswordForm />
          </div>
        </div>
      )}
    </div>
  );
}

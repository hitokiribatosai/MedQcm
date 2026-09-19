'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, Calendar, School, Award,
  CheckCircle2,
  Lock, Bell, Volume2, LogOut, Save
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
  { id: '1ere-annee', label: '1ère Année Médecine (PCEM1)' },
  { id: '2eme-annee', label: '2ème Année Médecine (PCEM2)' },
  { id: '3eme-annee', label: '3ème Année Médecine (PCEM3)' },
  { id: '4eme-annee', label: '4ème Année Médecine (DCEM1)' },
  { id: '5eme-annee', label: '5ème Année Médecine (DCEM2)' },
  { id: '6eme-annee', label: '6ème Année Médecine (DCEM3)' },
  { id: '7eme-annee', label: '7ème Année (Internat)' },
  { id: 'residanat',  label: 'Préparation Concours de Résidanat' },
];

const AVATAR_OPTIONS = ['👨‍⚕️', '👩‍⚕️', '🩺', '🧠', '🫀', '🧬', '🔬', '💊'];

export default function ProfilePage() {
  const router = useRouter();
  const locale = useLocale();
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

  // Preferences
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);

  // Status
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'security'>('info');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!active) return;
        if (error || !data.user) { setProfileError('Impossible de charger votre profil. Reconnectez-vous.'); return; }
        const meta = data.user.user_metadata;
        const text = (key: string) => typeof meta[key] === 'string' ? meta[key] : '';
        setEmail(data.user.email ?? '');
        setFullName(text('full_name')); setBirthday(text('birthday'));
        setPhone(text('phone')); setFaculty(text('faculty')); setStudyYear(text('studyYear'));
        setAvatar(text('avatar') || '👨‍⚕️'); setGoal(text('goal'));
        setSoundEnabled(meta.soundEnabled !== false); setDailyReminders(meta.dailyReminders === true);
      } catch { if (active) setProfileError('Impossible de charger votre profil.'); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaved(false); setProfileError(''); setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: {
        full_name: fullName.trim(), birthday, phone, faculty, studyYear,
        avatar, goal, soundEnabled, dailyReminders,
      } });
      if (error) { setProfileError(error.message); return; }
      setIsSaved(true);
      router.refresh();
    } catch { setProfileError('Enregistrement impossible. Réessayez.'); }
    finally { setSaving(false); }
  }

  async function handleLogout() {
    try { await logout(locale); }
    catch { setProfileError('Déconnexion impossible. Réessayez.'); }
  }

  if (loading) return <p role="status" className="p-8">Chargement du profil…</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in pb-16">
      {profileError && <p role="alert" className="text-red-600">{profileError}</p>}
      {/* Toast Notification on Save */}
      {isSaved && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-sm font-black">Profil mis à jour avec succès ! 🎉</span>
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
                {fullName || 'Étudiant MedQCM'}
              </h1>
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                🎓 Étudiant
              </span>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {faculty}
            </p>

            <p className="text-xs text-primary-600 dark:text-primary-400 font-bold italic">
              « {goal} »
            </p>

            {/* Account status */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold dark:bg-emerald-950/30 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Profil synchronisé</span>
              </div>
            </div>
          </div>

          {/* Logout Action */}
          <div className="shrink-0 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40 text-xs font-black border border-red-200 dark:border-red-900 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter</span>
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
          Informations Personnelles
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-primary-600 text-white shadow-card'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-muted'
          }`}
        >
          <Award className="w-4 h-4" />
          Succès & Trophées
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
          Sécurité & Préférences
        </button>
      </div>

      {/* TAB 1: Edit Profile Form */}
      {activeTab === 'info' && (
        <form onSubmit={handleSave} className="bg-white dark:bg-dark-card rounded-3xl p-6 sm:p-8 border-2 border-gray-100 dark:border-dark-border space-y-6">
          <div className="border-b border-gray-100 dark:border-dark-border pb-4">
            <h2 className="text-lg font-black text-[#1a2e25] dark:text-green-50">
              Modifier mes coordonnées
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ces informations permettent d&apos;adapter vos séries de QCMs et vos statistiques selon votre faculté et année.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nom & Prénom */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Rahal Abdelilah"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-dark-border dark:bg-dark-muted font-semibold text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  readOnly
                  aria-label="Adresse email du compte (lecture seule)"
                  placeholder="votre.email@medqcm.dz"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-dark-border dark:bg-dark-muted font-semibold text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Date de naissance (Birthday) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Date de naissance
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-dark-border dark:bg-dark-muted font-semibold text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Numéro de téléphone */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Numéro de téléphone (Optionnel)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05 / 06 / 07..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-dark-border dark:bg-dark-muted font-semibold text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Faculté de Médecine */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Faculté de Médecine
              </label>
              <div className="relative">
                <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-dark-border dark:bg-dark-muted font-semibold text-sm focus:border-emerald-500 focus:outline-hidden appearance-none"
                >
                  <option value="">Choisir une faculté</option>
                  {ALGERIAN_FACULTIES.map((fac) => (
                    <option key={fac} value={fac}>{fac}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Année d&apos;étude actuelle */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Année d&apos;étude actuelle
              </label>
              <select
                value={studyYear}
                onChange={(e) => setStudyYear(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-dark-border dark:bg-dark-muted font-semibold text-sm focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="">Choisir une année</option>
                {STUDY_YEARS.map((yr) => (
                  <option key={yr.id} value={yr.id}>{yr.label}</option>
                ))}
              </select>
            </div>

            {/* Objectif personnel */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Objectif personnel de révision
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Ex: Valider l'anatomie avec mention / 100 QCMs par jour"
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
              <span>Sauvegarder les modifications</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Stats & Badges */}
      {activeTab === 'stats' && (
        <div className="space-y-6 animate-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-dark-card p-5 rounded-3xl border-2 border-emerald-100 dark:border-dark-border text-center space-y-1">
              <span className="text-3xl font-black text-emerald-600">842</span>
              <p className="text-xs font-bold text-gray-400 uppercase">QCMs Résolus</p>
            </div>
            <div className="bg-white dark:bg-dark-card p-5 rounded-3xl border-2 border-sky-100 dark:border-dark-border text-center space-y-1">
              <span className="text-3xl font-black text-sky-600">88.5%</span>
              <p className="text-xs font-bold text-gray-400 uppercase">Précision Clinique</p>
            </div>
            <div className="bg-white dark:bg-dark-card p-5 rounded-3xl border-2 border-orange-100 dark:border-dark-border text-center space-y-1">
              <span className="text-3xl font-black text-orange-500">5</span>
              <p className="text-xs font-bold text-gray-400 uppercase">Jours de Flamme 🔥</p>
            </div>
            <div className="bg-white dark:bg-dark-card p-5 rounded-3xl border-2 border-purple-100 dark:border-dark-border text-center space-y-1">
              <span className="text-3xl font-black text-purple-600">#4</span>
              <p className="text-xs font-bold text-gray-400 uppercase">Ligue Diamant</p>
            </div>
          </div>

          {/* Badges Gallery */}
          <div className="bg-white dark:bg-dark-card p-6 sm:p-8 rounded-3xl border-2 border-gray-100 dark:border-dark-border space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-400">
              Trophées et Distinctions Médicales
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-center space-y-1">
                <div className="text-3xl">🎯</div>
                <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300">Sans Faute</h4>
                <p className="text-[10px] text-gray-500">100% sur un module d&apos;Anatomie</p>
              </div>

              <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 text-center space-y-1">
                <div className="text-3xl">🔥</div>
                <h4 className="text-xs font-black text-orange-900 dark:text-orange-300">Guerrier</h4>
                <p className="text-[10px] text-gray-500">5 jours consécutifs de révision</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 text-center space-y-1">
                <div className="text-3xl">🧠</div>
                <h4 className="text-xs font-black text-purple-900 dark:text-purple-300">Neurologue</h4>
                <p className="text-[10px] text-gray-500">200 QCMs de système nerveux</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-muted border border-dashed border-gray-300 text-center space-y-1 opacity-60">
                <div className="text-3xl">👑</div>
                <h4 className="text-xs font-black text-gray-700 dark:text-gray-300">Major</h4>
                <p className="text-[10px] text-gray-500">Terminer 1ère année à 100%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Security & Preferences */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-dark-card rounded-3xl p-6 sm:p-8 border-2 border-gray-100 dark:border-dark-border space-y-6 animate-in">
          <div className="border-b border-gray-100 dark:border-dark-border pb-4">
            <h2 className="text-lg font-black text-[#1a2e25] dark:text-green-50">
              Sécurité & Paramètres de l&apos;application
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Gérez votre mot de passe et vos préférences sonores style Duolingo.
            </p>
          </div>

          <div className="space-y-4">
            {/* Audio Feedback Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-50 dark:bg-dark-muted border border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-black text-gray-800 dark:text-gray-200">Effets sonores (Web Audio)</h4>
                  <p className="text-[11px] text-gray-500">Joue les carillons audio lors des bonnes réponses et passages de niveau.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 rounded-lg cursor-pointer"
              />
            </div>

            {/* Daily Reminder Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-50 dark:bg-dark-muted border border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-sky-600" />
                <div>
                  <h4 className="text-xs font-black text-gray-800 dark:text-gray-200">Rappels quotidiens de flamme 🔥</h4>
                  <p className="text-[11px] text-gray-500">Recevez un rappel pour ne pas perdre votre série de jours consécutifs.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={dailyReminders}
                onChange={(e) => setDailyReminders(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <button type="button" className="btn-primary" disabled={saving || !email} onClick={handleSave}>Enregistrer les préférences</button>
          <div className="pt-4 border-t border-gray-100 dark:border-dark-border">
            <PasswordForm />
          </div>
        </div>
      )}
    </div>
  );
}

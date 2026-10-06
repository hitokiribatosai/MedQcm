'use client';

import type { User } from '@supabase/supabase-js';
import { Moon, BookOpen, Menu, X, Shield, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { navItems } from './DashboardSidebar';
import { isAdmin } from '@/lib/auth/policy';
import { logout } from '@/lib/auth/logout';

export default function DashboardTopbar({ user }: { user: User }) {
  const locale = useLocale();
  const en = locale === 'en';
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark');
  }, []);
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  function toggleDark() {
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'Dr';

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? (en ? 'Student' : 'Étudiant');
  const studyYear = typeof user?.user_metadata?.studyYear === 'string' ? user.user_metadata.studyYear : '';
  const yearNumber = Number.parseInt(studyYear, 10);
  const yearLabel = studyYear === 'residanat'
    ? (en ? 'Residency' : 'Résidanat')
    : yearNumber >= 1 && yearNumber <= 7
      ? `${en ? 'Year' : 'Année'} ${yearNumber}`
      : (en ? 'Choose year' : 'Choisir l’année');

  return (
    <header className="h-16 bg-white dark:bg-dark-card border-b-2 border-gray-100 dark:border-dark-border flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-30 shadow-xs">
      {/* Left: Year & User Greeting */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="lg:hidden rounded-xl p-2 text-primary-700 hover:bg-primary-50 dark:text-primary-300"
          aria-label={menuOpen ? (en ? 'Close navigation' : 'Fermer le menu') : (en ? 'Open navigation' : 'Ouvrir le menu')}
          aria-controls="mobile-student-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(open => !open)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link
          href={`/${locale}/years`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider hover:bg-emerald-100 transition-all dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{yearLabel}</span>
        </Link>

        <span className="hidden md:inline text-xs font-bold text-gray-500 dark:text-gray-400">
          {en ? 'Hello' : 'Salut'}, <strong className="text-[#1a2e25] dark:text-white">{firstName}</strong> !
        </span>
      </div>

      {/* Preferences and account */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-muted transition-all"
          title={en ? 'Change theme' : 'Changer le thème'}
          aria-label={en ? 'Change theme' : 'Changer le thème'}
        >
          <Moon className="w-4 h-4" />
        </button>

        {/* Account */}
        <Link
          href={`/${locale}/profile`}
          className="relative group cursor-pointer"
          title={en ? 'My profile and settings' : 'Mon profil et paramètres'}
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-xs font-black shadow-card border-2 border-white dark:border-dark-card group-hover:scale-105 transition-transform">
            {initials}
          </div>
        </Link>
      </div>
      {menuOpen && <nav id="mobile-student-navigation" aria-label={en ? 'Student navigation' : 'Navigation étudiant'} className="lg:hidden absolute top-full inset-x-0 max-h-[calc(100dvh-4rem)] overflow-y-auto bg-white dark:bg-dark-card border-b border-primary-100 dark:border-dark-border shadow-xl p-3 space-y-1">
        {navItems.map(({href,labelFr,labelEn,icon:Icon}) => {
          const localizedHref = href.replace('/fr/', `/${locale}/`);
          return <Link key={href} href={localizedHref} aria-current={pathname.startsWith(localizedHref) ? 'page' : undefined} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-primary-800 dark:text-green-100 hover:bg-primary-50 dark:hover:bg-dark-muted">
            <Icon className="w-4 h-4" />{en ? labelEn : labelFr}
          </Link>;
        })}
        {isAdmin(user) && <Link href={`/${locale}/admin`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-50 dark:text-amber-300"><Shield className="w-4 h-4" />Administration</Link>}
        {logoutError && <p role="alert" className="px-3 text-sm text-red-700">{en ? 'Sign out failed. Try again.' : 'Déconnexion impossible. Réessayez.'}</p>}
        <button type="button" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 w-full" onClick={async () => { try { await logout(locale); } catch { setLogoutError(true); } }}><LogOut className="w-4 h-4" />{en ? 'Sign out' : 'Se déconnecter'}</button>
      </nav>}
    </header>
  );
}

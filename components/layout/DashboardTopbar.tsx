'use client';

import type { User } from '@supabase/supabase-js';
import { Moon, Sun, BookOpen } from 'lucide-react';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardTopbar({ user }: { user: User }) {
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  function toggleDark() {
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'Dr';

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Étudiant';

  return (
    <header className="h-16 bg-white dark:bg-dark-card border-b-2 border-gray-100 dark:border-dark-border flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-30 shadow-xs">
      {/* Left: Year & User Greeting */}
      <div className="flex items-center gap-3">
        <Link
          href="/fr/years"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider hover:bg-emerald-100 transition-all dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>1ère Année</span>
        </Link>

        <span className="hidden md:inline text-xs font-bold text-gray-500 dark:text-gray-400">
          Salut, <strong className="text-[#1a2e25] dark:text-white">{firstName}</strong> !
        </span>
      </div>

      {/* Account controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-muted transition-all"
          title="Changer le thème"
        >
          <Moon className="w-4 h-4 dark:hidden" />
          <Sun className="hidden w-4 h-4 text-amber-400 dark:block" />
        </button>

        {/* Profile */}
        <Link
          href="/fr/profile"
          className="relative group cursor-pointer"
          title="Mon Profil & Paramètres"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-xs font-black shadow-card border-2 border-white dark:border-dark-card group-hover:scale-105 transition-transform">
            {initials}
          </div>
        </Link>
      </div>
    </header>
  );
}

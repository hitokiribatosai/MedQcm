'use client';

import type { User } from '@supabase/supabase-js';
import { Moon, Sun, Flame, Diamond, Heart, Sparkles, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardTopbar({ user }: { user: User }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, []);

  function toggleDark() {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setDarkMode(!darkMode);
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

      {/* Center/Right: Duolingo Gamification HUD */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Streak Flame 🔥 */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-900/60 text-orange-600 font-extrabold text-xs sm:text-sm cursor-pointer hover:scale-105 transition-transform"
          title="Série de jours consécutifs"
        >
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
          <span>5</span>
        </div>

        {/* Gems / Diamants 💎 */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-sky-200 bg-sky-50 dark:bg-sky-950/30 dark:border-sky-900/60 text-sky-600 font-extrabold text-xs sm:text-sm cursor-pointer hover:scale-105 transition-transform"
          title="Gemmes médicales gagnées"
        >
          <Diamond className="w-4 h-4 text-sky-500 fill-sky-500" />
          <span>420</span>
        </div>

        {/* Hearts ❤️ */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900/60 text-red-600 font-extrabold text-xs sm:text-sm"
          title="Vies d'entraînement"
        >
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          <span>5</span>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-muted transition-all"
          title="Changer le thème"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Avatar with Pro Crown */}
        <Link
          href="/fr/profile"
          className="relative group cursor-pointer"
          title="Mon Profil & Paramètres"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-xs font-black shadow-card border-2 border-white dark:border-dark-card group-hover:scale-105 transition-transform">
            {initials}
          </div>
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black flex items-center justify-center border border-white shadow">
            👑
          </span>
        </Link>
      </div>
    </header>
  );
}

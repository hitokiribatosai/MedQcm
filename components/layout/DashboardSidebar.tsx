'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Stethoscope, LayoutDashboard, BookOpen,
  Clock, BarChart3, User, CreditCard, LogOut, Shield,
  FolderArchive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/fr/dashboard',  label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/fr/years',      label: 'Années & Parcours', icon: BookOpen },
  { href: '/fr/depot',      label: 'Dépôt des Cours', icon: FolderArchive },
  { href: '/fr/exams',      label: 'Examens blancs',  icon: Clock },
  { href: '/fr/stats',      label: 'Statistiques',    icon: BarChart3 },
  { href: '/fr/subscribe',  label: 'Abonnement',      icon: CreditCard },
  { href: '/fr/profile',    label: 'Profil',          icon: User },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch {}
    document.cookie = 'demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'demo_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/fr/login';
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white dark:bg-dark-card border-r border-primary-100 dark:border-dark-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-primary-100 dark:border-dark-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
          <Stethoscope className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="font-extrabold text-xl">
          <span className="text-[#1a2e25] dark:text-green-50">Med</span>
          <span className="text-gradient">QCM</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary-600 text-white shadow-card'
                  : 'text-[#4b7a62] hover:bg-primary-50 hover:text-primary-700 dark:text-green-400 dark:hover:bg-dark-muted dark:hover:text-primary-300'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* Admin link (visible ONLY for users with admin role) */}
        {typeof document !== 'undefined' && document.cookie.includes('demo_role=admin') && (
          <Link
            href="/fr/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50 transition-all duration-200 mt-2 border-t border-primary-100 dark:border-dark-border pt-4"
          >
            <Shield className="w-4 h-4 shrink-0 text-amber-600" />
            Administration
          </Link>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-primary-100 dark:border-dark-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 w-full transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}

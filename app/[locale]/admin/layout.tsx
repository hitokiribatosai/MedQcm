'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield, CreditCard, HelpCircle, FileText,
  Users, ArrowLeft, LayoutDashboard, UploadCloud,
  FolderArchive, Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNav = [
  { href: '/fr/admin',               label: 'Vue d\'ensemble',      icon: LayoutDashboard },
  { href: '/fr/admin/subscriptions', label: 'Validations Paiement',  icon: CreditCard },
  { href: '/fr/admin/depot',         label: 'Dépôt des Cours PDF',  icon: FolderArchive },
  { href: '/fr/admin/questions',     label: 'Banque de QCMs',       icon: HelpCircle },
  { href: '/fr/admin/reports',       label: 'Signalements Erreurs', icon: Flag },
  { href: '/fr/admin/import',        label: 'Import PDF & IA',      icon: UploadCloud },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-bg flex flex-col lg:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full lg:w-64 bg-[#14231b] text-white border-r border-[#1f372a] flex flex-col shrink-0">
        <div className="p-5 border-b border-[#1f372a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-500 text-amber-950 flex items-center justify-center font-black">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wide">MedQCM</span>
              <span className="block text-[10px] text-accent-400 font-bold uppercase tracking-wider">Espace Admin</span>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          {adminNav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/fr/admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all',
                  active
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-gray-300 hover:bg-[#1a3325] hover:text-white'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#1f372a]">
          <Link
            href="/fr/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-primary-300 hover:bg-[#1a3325] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'Espace Étudiant
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

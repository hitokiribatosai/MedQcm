"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Shield,
  CreditCard,
  HelpCircle,
  ArrowLeft,
  LayoutDashboard,
  FolderArchive,
  Flag,
  BookOpen,
  Clock,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  {
    href: "/fr/admin/curriculum",
    labelFr: "Programme",
    labelEn: "Curriculum",
    icon: BookOpen,
  },
  {
    href: "/fr/admin/exams",
    labelFr: "Examens",
    labelEn: "Exams",
    icon: Clock,
  },
  {
    href: "/fr/admin/offers",
    labelFr: "Offres",
    labelEn: "Offers",
    icon: CreditCard,
  },
  {
    href: "/fr/admin/audit",
    labelFr: "Historique admin",
    labelEn: "Audit",
    icon: ClipboardList,
  },
  {
    href: "/fr/admin",
    labelFr: "Vue d’ensemble",
    labelEn: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/fr/admin/subscriptions",
    labelFr: "Validations paiement",
    labelEn: "Payment review",
    icon: CreditCard,
  },
  {
    href: "/fr/admin/depot",
    labelFr: "Documents PDF",
    labelEn: "PDF documents",
    icon: FolderArchive,
  },
  {
    href: "/fr/admin/questions",
    labelFr: "Publication QCM",
    labelEn: "QCM publication",
    icon: HelpCircle,
  },
  {
    href: "/fr/admin/reports",
    labelFr: "Signalements",
    labelEn: "Question reports",
    icon: Flag,
  },
];

export default function AdminShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: string;
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const en = locale === "en";

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-bg flex flex-col lg:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full lg:w-64 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto bg-[#14231b] text-white border-r border-[#1f372a] flex flex-col shrink-0">
        <div className="p-5 border-b border-[#1f372a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-500 text-amber-950 flex items-center justify-center font-black">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wide">
                MedQCM
              </span>
              <span className="block text-[10px] text-accent-400 font-bold uppercase tracking-wider">
                {en ? "Admin area" : "Espace admin"}
              </span>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          {adminNav
            .filter(
              (item) =>
                role === "admin" ||
                (role === "payment_manager"
                  ? ["/fr/admin/offers", "/fr/admin/subscriptions"].includes(
                      item.href,
                    )
                  : ![
                      "/fr/admin",
                      "/fr/admin/offers",
                      "/fr/admin/subscriptions",
                      "/fr/admin/audit",
                      "/fr/admin/reports",
                    ].includes(item.href)),
            )
            .map(({ href, labelFr, labelEn, icon: Icon }) => {
              const localizedHref = href
                .replace("/fr/", `/${locale}/`)
                .replace(/^\/fr$/, `/${locale}`);
              const active =
                pathname === localizedHref ||
                (localizedHref !== `/${locale}/admin` &&
                  pathname.startsWith(localizedHref));
              return (
                <Link
                  key={href}
                  href={localizedHref}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all",
                    active
                      ? "bg-primary-600 text-white shadow"
                      : "text-gray-300 hover:bg-[#1a3325] hover:text-white",
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {en ? labelEn : labelFr}
                </Link>
              );
            })}
        </nav>

        <div className="p-3 border-t border-[#1f372a]">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-primary-300 hover:bg-[#1a3325] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {en ? "Back to student area" : "Retour à l’espace étudiant"}
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

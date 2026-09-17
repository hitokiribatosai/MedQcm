import { requireUser } from '@/lib/auth/server';
import { isAdmin } from '@/lib/auth/policy';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';

export default async function DashboardLayout({
  children, params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireUser(locale);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-bg flex">
      <DashboardSidebar isAdmin={isAdmin(user)} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar user={user} />
        <main className="flex-1 p-6 lg:p-8 overflow-auto animate-in">
          {children}
        </main>
      </div>
    </div>
  );
}

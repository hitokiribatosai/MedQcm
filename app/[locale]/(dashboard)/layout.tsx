import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isDemoSession = cookieStore.get('demo_session')?.value === 'true';

  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch {
    user = null;
  }

  if (!user && !isDemoSession) redirect('/fr/login');

  const displayUser = user || (isDemoSession ? {
    id: 'demo-student',
    email: 'demo@medqcm.dz',
    user_metadata: { full_name: 'Dr. Étudiant (Démo)' }
  } : null);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-bg flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar user={displayUser as any} />
        <main className="flex-1 p-6 lg:p-8 overflow-auto animate-in">
          {children}
        </main>
      </div>
    </div>
  );
}

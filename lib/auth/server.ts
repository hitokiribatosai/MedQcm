import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from './policy';

// Call at every future protected data operation as well as page boundaries.
export async function requireUser(locale = 'fr') {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect(`/${locale}/login`);
  return data.user;
}

export async function requireAdmin(locale = 'fr') {
  const user = await requireUser(locale);
  if (!isAdmin(user)) redirect(`/${locale}/dashboard?error=unauthorized`);
  return user;
}

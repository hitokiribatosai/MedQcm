import SubscriptionPanel from '@/components/subscriptions/SubscriptionPanel';
import { requireAdmin } from '@/lib/auth/server';
export default async function AdminSubscriptionsPage({params}:{params:Promise<{locale:string}>}) {
 const {locale}=await params;await requireAdmin(locale);
 return <SubscriptionPanel admin/>;
}

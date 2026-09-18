import SubscriptionPanel from '@/components/subscriptions/SubscriptionPanel';
import { requireUser } from '@/lib/auth/server';
export default async function SubscribePage({params}:{params:Promise<{locale:string}>}) {
 const {locale}=await params;await requireUser(locale);
 return <SubscriptionPanel/>;
}

import { createClient } from '@/utils/supabase/server';
import LandingPage from '@/components/landing/LandingPage';
import DashboardFeed from '@/components/feed/DashboardFeed';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: plugs } = await supabase
      .from('plugs')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*');

    return <DashboardFeed user={user} initialPlugs={plugs || []} initialProfiles={profiles || []} />;
  }

  return <LandingPage />;
}

import { createClient } from '@/utils/supabase/server';
import LandingPage from '@/components/landing/LandingPage';
import DashboardFeed from '@/components/feed/DashboardFeed';

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If the user is logged in, show them the internal marketplace
    if (user) {
      const { data: plugs } = await supabase
        .from('plugs')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch all profiles so we can search for people
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      return <DashboardFeed user={user} initialPlugs={plugs || []} initialProfiles={profiles || []} />;
    }

    // Otherwise, show the public landing page
    return <LandingPage />;
  } catch (error) {
    return (
      <div style={{ padding: '2rem', color: 'red', background: '#fdd' }}>
        <h2>Home Page Server Error</h2>
        <pre>{error.message || String(error)}</pre>
        <pre>{error.stack}</pre>
      </div>
    );
  }
}

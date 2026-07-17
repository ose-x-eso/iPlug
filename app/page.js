import { createClient } from '@/utils/supabase/server';
import LandingPage from '@/components/landing/LandingPage';
import DashboardFeed from '@/components/feed/DashboardFeed';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let user = null;
  let plugs = [];
  let profiles = [];
  let error = null;

  try {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    user = currentUser;

    if (user) {
      const { data: userPlugs } = await supabase
        .from('plugs')
        .select('*')
        .order('created_at', { ascending: false });
      plugs = userPlugs || [];

      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('*');
      profiles = allProfiles || [];
    }
  } catch (err) {
    error = err;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red', background: '#fdd' }}>
        <h2>Home Page Server Error</h2>
        <pre>{error.message || String(error)}</pre>
        <pre>{error.stack}</pre>
      </div>
    );
  }

  if (user) {
    return <DashboardFeed user={user} initialPlugs={plugs} initialProfiles={profiles} />;
  }

  return <LandingPage />;
}

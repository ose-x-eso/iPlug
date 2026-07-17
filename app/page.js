import { createClient } from '@/utils/supabase/server';
import LandingPage from '@/components/landing/LandingPage';
import DashboardFeed from '@/components/feed/DashboardFeed';

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
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
  } catch (err) {
    // Next.js 15 uses these specific errors for control flow. We MUST rethrow them.
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('NEXT_REDIRECT') || err?.digest?.startsWith('NEXT_REDIRECT') || err?.message?.includes('NEXT_NOT_FOUND')) {
      throw err;
    }
    
    // Any other error is a real crash. We catch it and display it safely.
    return (
      <div style={{ padding: '3rem', color: 'red', background: '#fdd', minHeight: '100vh' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Home Page Server Error</h2>
        <p style={{ fontWeight: 'bold' }}>Message: {err.message || String(err)}</p>
        <pre style={{ overflowX: 'auto', background: '#fff', padding: '1rem' }}>{err.stack}</pre>
        <p>Digest: {err.digest || 'none'}</p>
      </div>
    );
  }
}

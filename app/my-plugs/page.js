import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import MyPlugCard from '@/components/feed/MyPlugCard';
import { Package } from 'lucide-react';

export default async function MyPlugsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch all plugs owned by this user
  const { data: plugs } = await supabase
    .from('plugs')
    .select('*')
    .eq('provider_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <AppShell initialUser={user}>
      <div className="dashboard-container">
      
      <main className="dashboard-main native-main">
        
        <header className="native-header" style={{ position: 'relative', marginBottom: '1.5rem', background: 'transparent', borderBottom: 'none' }}>
          <div>
            <h1 className="native-title">My Plugs</h1>
            <p className="native-input-label" style={{ marginTop: '0.25rem' }}>Manage all the services and shops you have listed on iPlug.</p>
          </div>
        </header>

        <section className="feed-grid">
          {!plugs || plugs.length === 0 ? (
            <div className="native-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
              <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', color: '#9ca3af' }}><Package size={48} className="inline-icon" /></span>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>You haven't listed any plugs yet!</h3>
              <p className="native-input-label" style={{ marginBottom: '2rem' }}>Start reaching customers in your area by listing your first service or shop.</p>
              {/* Note: In a full app, we would put a button here that opens the CreatePlugModal via state */}
            </div>
          ) : (
            plugs.map(plug => (
              <MyPlugCard key={plug.id} plug={plug} />
            ))
          )}
        </section>

      </main>
      </div>
    </AppShell>
  );
}

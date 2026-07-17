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
      
      <main className="dashboard-main" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>My Plugs</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Manage all the services and shops you have listed on iPlug.</p>
          </div>
        </div>

        <section className="feed-grid">
          {!plugs || plugs.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}><Package size={16} className="inline-icon" /></span>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>You haven't listed any plugs yet!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Start reaching customers in your area by listing your first service or shop.</p>
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

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
        
        <header style={{ 
          marginBottom: '2rem', 
          background: 'var(--bg-surface)', 
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Subtle gradient background element */}
          <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, var(--accent-subtle) 0%, transparent 70%)', opacity: 0.5, zIndex: 0 }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>My Plugs</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0, maxWidth: '600px' }}>Manage all the services and shops you have listed on iPlug.</p>
          </div>
        </header>

        <section style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '1.5rem',
          paddingBottom: '4rem'
        }}>
          {!plugs || plugs.length === 0 ? (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '5rem 2rem',
              background: 'var(--bg-surface)',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-input)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--text-muted)'
              }}>
                <Package size={40} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 'bold' }}>You haven't listed any plugs yet!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '400px', lineHeight: '1.5' }}>Start reaching customers in your area by listing your first service or shop.</p>
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

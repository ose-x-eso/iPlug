import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import BackButton from '@/components/layout/BackButton';
import { Package, Wrench, ShoppingBag, Building, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default async function CategoryPage(props) {
  const params = await props.params;
  const pillar = params.pillar;
  
  const validPillars = ['services', 'shops', 'places', 'new'];
  if (!validPillars.includes(pillar)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let plugs = [];
  if (pillar === 'new') {
    const { data } = await supabase
      .from('plugs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    plugs = data || [];
  } else {
    const { data } = await supabase
      .from('plugs')
      .select('*')
      .eq('pillar', pillar)
      .order('created_at', { ascending: false });
    plugs = data || [];
  }

  const titles = {
    'services': <><Wrench size={16} className="inline-icon" /> Top Services &amp; Mechanics</>,
    'shops': <><ShoppingBag size={16} className="inline-icon" /> Trending Shops</>,
    'places': <><Building size={16} className="inline-icon" /> Places to Explore</>,
    'new': <><Sparkles size={16} className="inline-icon" /> Newest Arrivals</>
  };

  return (
    <AppShell initialUser={user}>
      <div className="dashboard-container">
        <main className="dashboard-main">
          <BackButton />
          <h1 style={{ marginBottom: '2rem' }}>{titles[pillar]}</h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {plugs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No plugs found in this category yet.</p>
            ) : (
              plugs.map(plug => (
                <Link href={`/plug/${plug.id}`} key={plug.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', transition: 'transform 0.2s' }}>
                    <div style={{ 
                      height: '150px', 
                      background: 'var(--bg-input)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundImage: plug.image_url?.startsWith('http') ? `url(${plug.image_url})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}>
                      {!plug.image_url?.startsWith('http') && <Package size={48} color="var(--text-muted)" />}
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{plug.title}</h3>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{plug.category || plug.address || 'Local Plug'}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </main>
      </div>
    </AppShell>
  );
}

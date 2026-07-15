import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import MyPlugCard from '@/components/feed/MyPlugCard';

export default async function ProfilePage(props) {
  const params = await props.params;
  const supabase = await createClient();
  
  // Get current user session
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch the profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Fetch all plugs by this user
  const { data: plugs, error: plugsError } = await supabase
    .from('plugs')
    .select('*')
    .eq('provider_id', params.id)
    .order('created_at', { ascending: false });

  const isOwner = user?.id === profile.id;

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <main className="dashboard-main" style={{ maxWidth: '1000px', margin: '0 auto', padding: '6rem 1rem 2rem 1rem' }}>
        
        {/* Profile Header */}
        <div className="profile-header-card" style={{ background: 'var(--bg-card)', padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'white', flexShrink: 0 }}>
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>{profile?.full_name || 'Unknown User'}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', margin: 0 }}>iPlugg Provider</p>
          </div>

          {!isOwner && (
            <div className="profile-header-actions" style={{ display: 'flex', gap: '1rem' }}>
              {profile?.phone_number && (
                <a 
                  href={`tel:${profile.phone_number}`}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                >
                  📞 Call
                </a>
              )}
              <Link 
                href={`/messages/${profile.id}`}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
              >
                💬 Message
              </Link>
            </div>
          )}
        </div>

        {/* User's Plugs Section */}
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📦</span> Listed Plugs
        </h2>

        {plugs && plugs.length > 0 ? (
          <div className="feed-grid">
            {plugs.map((plug) => (
              <Link href={`/plug/${plug.id}`} key={plug.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden', transition: 'transform 0.2s, borderColor 0.2s' }}>
                  <div style={{ height: '150px', background: 'linear-gradient(45deg, #1A1A2E, #16213E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                    {plug.image_url || '📦'}
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{plug.category}</span>
                      <span className="category-pill">{plug.pillar}</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>{plug.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {plug.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📭</span>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', margin: 0 }}>No plugs listed yet!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>This provider hasn't listed any services or shops.</p>
          </div>
        )}

      </main>
    </div>
  );
}

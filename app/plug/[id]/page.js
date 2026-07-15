import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default async function PlugDetailsPage(props) {
  const params = await props.params;
  const supabase = await createClient();
  
  // Get current user session
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch the specific plug
  const { data: plug, error: plugError } = await supabase
    .from('plugs')
    .select('*')
    .eq('id', params.id)
    .single();

  if (plugError || !plug) {
    notFound();
  }

  // Fetch the creator's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', plug.provider_id)
    .single();

  const isOwner = user?.id === plug.provider_id;

  return (
    <div className="dashboard-container">
      <Navbar user={user} />
      
      <main className="dashboard-main" style={{ maxWidth: '800px', margin: '0 auto', padding: '6rem 1rem 2rem 1rem' }}>
        
        <Link href="/" style={{ color: 'var(--text-primary)', fontWeight: '500', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <span>←</span> Back to Feed
        </Link>

        <div className="plug-details-card" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          
          <div className="plug-header-bg" style={{ height: '200px', background: 'linear-gradient(45deg, #1A1A2E, #16213E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '6rem' }}>{plug.image_url || '📦'}</span>
          </div>

          <div className="plug-details-content" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{plug.title}</h1>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '1rem', alignItems: 'center' }}>
                  <span>📍 {plug.address || 'Location unknown'}</span>
                  <span>⭐ 4.8 (12 Reviews)</span>
                  <span>🏷️ {plug.category}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="category-pill active">{plug.pillar}</span>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>About this Plug</h3>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                {plug.description}
              </p>
            </div>

            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Provider Details</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }}>
                    {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', margin: 0 }}>{profile?.full_name || 'Unknown User'}</h4>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>iPlugg Provider</p>
                  </div>
                </div>

                {!isOwner ? (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {/* Call Button - native phone dialer */}
                    {profile?.phone_number ? (
                      <a 
                        href={`tel:${profile.phone_number}`}
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                      >
                        📞 Call
                      </a>
                    ) : (
                      <span 
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5, cursor: 'not-allowed' }}
                        title="This provider did not provide a phone number"
                      >
                        📞 Call
                      </span>
                    )}

                    {/* Message Button - links to the chat system we will build in Step 8 */}
                    <Link 
                      href={`/messages/${plug.provider_id}`}
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                    >
                      💬 Message
                    </Link>
                  </div>
                ) : (
                  <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
                    This is your plug
                  </div>
                )}
                
              </div>
            </div>

            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', margin: 0 }}>Reviews & Ratings</h3>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>⭐ 4.8 (12 Reviews)</span>
              </div>
              
              <div style={{ padding: '1.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
                  "Great service! Very professional and highly recommended to anyone in the area."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>S</div>
                  <span>Sarah J.</span> • <span>2 weeks ago</span>
                </div>
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }} disabled>
                  View all 12 reviews
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

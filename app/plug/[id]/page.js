import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import BackButton from '@/components/layout/BackButton';
import RecentlyViewedTracker from '@/components/feed/RecentlyViewedTracker';
import PlugDetailActions from '@/components/feed/PlugDetailActions';
import { Package, MapPin, Star, Tag, LinkIcon, Phone, Mail, MessageSquare } from 'lucide-react';

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

  // Fetch reviews for the provider
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('provider_id', plug.provider_id);

  const averageRating = reviews?.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  const isOwner = user?.id === plug.provider_id;

  return (
    <AppShell initialUser={user}>
      <div className="dashboard-container">
      <RecentlyViewedTracker plug={plug} />
      
      <main className="dashboard-main" style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
        
        <BackButton />

        <div className="plug-details-card" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          
          <div className="plug-header-bg" style={{ 
            height: '250px', 
            background: 'var(--bg-input)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundImage: plug.image_url?.startsWith('http') ? `url(${plug.image_url})` : 'linear-gradient(45deg, #1A1A2E, #16213E)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            {!plug.image_url?.startsWith('http') && <div style={{ color: 'var(--text-muted)' }}><Package size={64} /></div>}
          </div>

          <div className="plug-details-content" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{plug.title}</h1>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '1rem', alignItems: 'center' }}>
                  <span><MapPin size={16} className="inline-icon" /> {plug.address || 'Location unknown'}</span>
                  <span><Star size={16} className="inline-icon" /> {averageRating === 'New' ? 'New' : `${averageRating} (${reviews?.length} Reviews)`}</span>
                  <span><Tag size={16} className="inline-icon" /> {plug.category}</span>
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
              
              {plug.portfolio_url && (
                <div style={{ marginTop: '1.5rem' }}>
                  <a 
                    href={plug.portfolio_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.5rem 1rem' }}
                  >
                    <LinkIcon size={16} className="inline-icon" /> View Portfolio / Website
                  </a>
                </div>
              )}
            </div>

            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Provider Details</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(45deg, var(--primary), var(--secondary))', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '1.5rem', 
                    color: 'white',
                    backgroundImage: profile?.avatar_url?.startsWith('http') ? `url(${profile.avatar_url})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}>
                    {!profile?.avatar_url?.startsWith('http') && ((profile?.username || profile?.full_name)?.charAt(0).toUpperCase() || 'U')}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {profile?.username || profile?.full_name || 'Unknown User'}
                      {profile?.is_verified && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" title="Verified Provider">
                          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#3b82f6"/>
                        </svg>
                      )}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>iPlug Provider</p>
                  </div>
                </div>

                {!isOwner ? (
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {/* Call Button - Only show if phone number is provided */}
                    {profile?.phone_number && (
                      <a 
                        href={`tel:${profile.phone_number}`}
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                      >
                        <Phone size={16} className="inline-icon" /> Call
                      </a>
                    )}

                    {/* Email Button - As an alternative contact method */}
                    {profile?.email && (
                      <a 
                        href={`mailto:${profile.email}`}
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                      >
                        <Mail size={16} className="inline-icon" /> Email
                      </a>
                    )}

                    {/* Message Button - links to the chat system we built */}
                    <Link 
                      href={`/messages/${plug.provider_id}`}
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                    >
                      <MessageSquare size={16} className="inline-icon" /> Message
                    </Link>
                  </div>
                ) : (
                  <PlugDetailActions plug={plug} />
                )}
                
              </div>
            </div>

            {plug.pillar !== 'civic' && (
              <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', margin: 0 }}>Reviews & Ratings</h3>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}><Star size={16} className="inline-icon" /> {averageRating === 'New' ? 'New' : `${averageRating} (${reviews?.length} Reviews)`}</span>
              </div>
              
              <div style={{ padding: '1.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                {isOwner ? (
                  <>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      To manage your reviews and see all ratings, visit your dashboard.
                    </p>
                    <Link href={`/profile/${profile.id}`}>
                      <button className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                        View Dashboard
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      To read all reviews and ratings, visit {profile.username || profile.full_name}'s profile.
                    </p>
                    <Link href={`/profile/${profile.id}`}>
                      <button className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                        View Profile
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            )}

          </div>
        </div>
      </main>
      </div>
    </AppShell>
  );
}

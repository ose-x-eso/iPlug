import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import BackButton from '@/components/layout/BackButton';
import RecentlyViewedTracker from '@/components/feed/RecentlyViewedTracker';
import PlugDetailActions from '@/components/feed/PlugDetailActions';
import PlugShareActions from '@/components/feed/PlugShareActions';
import ReportPlugButton from '@/components/feed/ReportPlugButton';
import { Package, MapPin, Star, Tag, LinkIcon, Phone, Mail, MessageSquare } from 'lucide-react';

export async function generateMetadata(props) {
  const params = await props.params;
  const supabase = await createClient();
  
  const { data: plug } = await supabase
    .from('plugs')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!plug) return { title: 'Plug Not Found' };

  return {
    title: `${plug.title} | iPlug`,
    description: plug.description?.substring(0, 160) || `Check out ${plug.title} on iPlug.`,
    openGraph: {
      title: plug.title,
      description: plug.description?.substring(0, 160) || `Check out ${plug.title} on iPlug.`,
      images: plug.image_url ? [plug.image_url] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: plug.title,
      description: plug.description?.substring(0, 160),
      images: plug.image_url ? [plug.image_url] : [],
    },
  };
}

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
      <div className="dashboard-container plug-details-page-container">
        <RecentlyViewedTracker plug={plug} />
        
        {/* DESKTOP & MOBILE LAYOUT COMBINED */}
        <main className="dashboard-main" style={{ padding: '0 0 4rem 0', display: 'flex', flexDirection: 'column' }}>
          

          {/* Hero Header Image */}
          <div style={{ 
            height: '350px', 
            width: '100%', 
            position: 'relative',
            background: plug.image_url?.startsWith('http') ? `url(${plug.image_url}) center/cover no-repeat` : 'linear-gradient(135deg, var(--accent-flat), var(--accent-subtle))', 
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.7) 100%)' }}></div>
            {!plug.image_url?.startsWith('http') && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                <Package size={100} />
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 1.5rem', position: 'relative', marginTop: '-100px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Floating Glass Title Card */}
            <div className="glass card" style={{ zIndex: 10, padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <h1 style={{ fontSize: '2.5rem', margin: '0', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: '1.2' }}>{plug.title}</h1>
                <span className="category-pill active" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: 'bold' }}>{plug.pillar}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '1.05rem', alignItems: 'center', flexWrap: 'wrap', fontWeight: '500' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={18} color="var(--accent-flat)" /> {plug.address || 'Location unknown'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={18} color="var(--accent-flat)" /> {plug.category}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-flat)' }}>
                  <Star size={18} fill="var(--accent-flat)" /> {averageRating === 'New' ? 'New' : `${averageRating} (${reviews?.length} Reviews)`}
                </span>
              </div>
            </div>

            {/* Layout Grid: 2 Columns on Desktop */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
              {/* Left Column: Description & Portfolio */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>About this Plug</h3>
                  <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                    {plug.description}
                  </p>
                  
                  {plug.portfolio_url && (
                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)' }}>
                      <a 
                        href={plug.portfolio_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.75rem 1.5rem', width: '100%', justifyContent: 'center', fontWeight: 'bold' }}
                      >
                        <LinkIcon size={18} /> View Portfolio / Website
                      </a>
                    </div>
                  )}
                </div>

                {/* Reviews Section */}
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 'bold' }}>Reviews & Ratings</h3>
                      <span style={{ fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-flat)' }}><Star size={20} fill="var(--accent-flat)" /> {averageRating === 'New' ? 'New' : `${averageRating}`}</span>
                    </div>
                    
                    <div style={{ padding: '1.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      {isOwner ? (
                        <>
                          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                            Manage your reviews and see all ratings on your dashboard.
                          </p>
                          <Link href={`/profile/${profile.id}`}>
                            <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontWeight: 'bold' }}>
                              View Dashboard
                            </button>
                          </Link>
                        </>
                      ) : (
                        <>
                          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                            Read all reviews and ratings on {profile.username || profile.full_name}'s profile.
                          </p>
                          <Link href={`/profile/${profile.id}`}>
                            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontWeight: 'bold' }}>
                              View Profile
                            </button>
                          </Link>
                        </>
                      )}
                  </div>
                </div>
              </div>

              {/* Right Column: Provider Card */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '100px' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Provided By</h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ 
                      width: '70px', 
                      height: '70px', 
                      borderRadius: '50%', 
                      background: 'var(--bg-card)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '1.8rem', 
                      color: 'var(--text-primary)',
                      border: '3px solid var(--accent-subtle)',
                      backgroundImage: profile?.avatar_url?.startsWith('http') ? `url(${profile.avatar_url})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0
                    }}>
                      {!profile?.avatar_url?.startsWith('http') && ((profile?.username || profile?.full_name)?.charAt(0).toUpperCase() || 'U')}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.3rem', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                        {profile?.username || profile?.full_name || 'Unknown User'}
                        {profile?.is_verified && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" title="Verified Provider">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="var(--accent-flat)"/>
                          </svg>
                        )}
                      </h4>
                      <p style={{ color: 'var(--accent-flat)', margin: 0, fontWeight: '600' }}>{profile?.title || 'iPlug Provider'}</p>
                    </div>
                  </div>

                  {!isOwner ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <Link 
                        href={`/messages/${plug.provider_id}`}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', textDecoration: 'none', padding: '0.85rem', fontWeight: 'bold', fontSize: '1.05rem', borderRadius: 'var(--radius-md)' }}
                      >
                        <MessageSquare size={20} /> Send Message
                      </Link>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {(profile?.phone_number && profile?.phone_visible) && (
                          <a 
                            href={`tel:${profile.phone_number}`}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.75rem', fontWeight: '600' }}
                          >
                            <Phone size={18} /> Call
                          </a>
                        )}
                        {profile?.email && (
                          <a 
                            href={`mailto:${profile.email}`}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.75rem', fontWeight: '600', gridColumn: !(profile?.phone_number && profile?.phone_visible) ? '1 / span 2' : 'auto' }}
                          >
                            <Mail size={18} /> Email
                          </a>
                        )}
                      </div>
                      
                      <PlugShareActions plugTitle={plug.title} isOwner={false} />
                      <ReportPlugButton />
                    </div>
                  ) : (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <PlugDetailActions plug={plug} />
                      <PlugShareActions plugTitle={plug.title} isOwner={true} />
                    </div>
                  )}
                  
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </AppShell>
  );
}

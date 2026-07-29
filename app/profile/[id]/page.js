import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import ProfileActions from '@/components/profile/ProfileActions';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileViewTracker from '@/components/profile/ProfileViewTracker';
import BioSection from '@/components/profile/BioSection';
import BackButton from '@/components/layout/BackButton';
import SkillRequestToggle from '@/components/profile/SkillRequestToggle';
import { Package, Star, Calendar, Target } from 'lucide-react';

export async function generateMetadata(props) {
  const params = await props.params;
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!profile) return { title: 'Profile Not Found' };

  const name = profile.full_name || profile.username || 'User';
  const description = profile.bio?.substring(0, 160) || `Check out ${name}'s official profile on iPlug.`;

  return {
    title: `${name} | iPlug`,
    description: description,
    openGraph: {
      title: `${name} on iPlug`,
      description: description,
      images: profile.avatar_url ? [profile.avatar_url] : (profile.cover_url ? [profile.cover_url] : []),
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} on iPlug`,
      description: description,
      images: profile.avatar_url ? [profile.avatar_url] : (profile.cover_url ? [profile.cover_url] : []),
    },
  };
}

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

  // Fetch recommendations
  const { data: recommendations } = await supabase
    .from('recommendations')
    .select('*, profiles:recommender_id(id, username, full_name, email)')
    .eq('provider_id', params.id)
    .order('created_at', { ascending: false });

  // Fetch reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviewer_id(id, username, full_name, avatar_url)')
    .eq('provider_id', params.id)
    .order('created_at', { ascending: false });

  const isOwner = user?.id === profile.id;
  const viewerName = user?.user_metadata?.username || user?.email?.split('@')[0];

  // Derive joined year from created_at, or default to current year if undefined
  const joinedDate = profile.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear();

  // Calculate Average Rating
  const averageRating = reviews?.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  return (
    <AppShell initialUser={user}>
      <div className="dashboard-container profile-page-container">
        <ProfileViewTracker profileId={profile.id} viewerId={user?.id} viewerName={viewerName} />
        
        {/* DESKTOP LAYOUT */}
        <main className="dashboard-main desktop-only" style={{ display: 'flex', maxWidth: '1000px', margin: '0 auto', padding: '0 0 2rem 0', flexDirection: 'column' }}>
          {/* Cover Banner */}
          <div style={{ 
            height: '280px', 
            background: profile?.cover_url ? `url(${profile.cover_url}) center/cover no-repeat` : 'linear-gradient(135deg, var(--accent-flat), var(--accent-subtle))', 
            width: '100%', 
            position: 'relative' 
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.6))' }}></div>
            {isOwner && (
              <Link href="/settings" style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '50%',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease',
                zIndex: 20
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </Link>
            )}
          </div>

          <div style={{ padding: '0 2rem', position: 'relative', marginTop: '-80px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Glassmorphic Info Card */}
            <div style={{
              background: 'color-mix(in srgb, var(--bg-surface) 85%, transparent)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-lg)',
              flexWrap: 'wrap',
              gap: '2rem',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover no-repeat` : 'var(--bg-card)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '4rem', 
                  color: 'var(--text-primary)', 
                  border: '4px solid var(--bg-page)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                }}>
                  {!profile?.avatar_url && ((profile?.username || profile?.full_name)?.charAt(0).toUpperCase() || 'U')}
                </div>
                <div>
                  <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                    {profile?.username || profile?.full_name || 'Unknown User'}
                    {profile?.is_verified && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" title="Verified Provider">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="var(--accent-flat)"/>
                    </svg>
                    )}
                  </h1>
                  <p style={{ color: 'var(--accent-flat)', fontWeight: '600', margin: '0', fontSize: '1.1rem' }}>{profile?.title || 'iPlug Provider'}</p>
                </div>
              </div>

              {/* Actions Bar (Desktop alignment) */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <ProfileActions profile={profile} isOwner={isOwner} profileId={profile.id} user={user} />
              </div>
            </div>

            {/* Skill Request Banner (Public) */}
            {profile.is_requesting_skill && (
              <div style={{ padding: '1rem 1.5rem', background: 'var(--danger-subtle)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '1rem', alignItems: 'center', boxShadow: '0 4px 12px var(--danger-subtle)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                  <Target size={24} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--danger)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Actively Looking For</h4>
                  <p style={{ margin: 0, color: 'var(--text-heading)', fontSize: '1.1rem', fontWeight: '500' }}>"{profile.skill_request_desc}"</p>
                </div>
              </div>
            )}

            {/* Premium Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-subtle)', color: 'var(--accent-flat)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-heading)', lineHeight: '1' }}>{plugs?.length || 0}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '0.25rem' }}>Total Plugs</div>
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-subtle)', color: 'var(--accent-flat)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-heading)', lineHeight: '1' }}>{averageRating === 'New' ? '—' : averageRating}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '0.25rem' }}>Avg Rating</div>
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-card)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-heading)', lineHeight: '1' }}>{joinedDate}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '0.25rem' }}>Joined</div>
                </div>
              </div>
            </div>

            <BioSection bio={profile?.bio} />
            
            {isOwner && (
              <div style={{ marginTop: '0.5rem' }}>
                <SkillRequestToggle isRequesting={profile.is_requesting_skill} currentDesc={profile.skill_request_desc} />
              </div>
            )}

            {/* Interactive Tabs */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <ProfileTabs 
                profile={profile}
                plugs={plugs || []} 
                profileId={profile.id} 
                isOwner={isOwner} 
                isPremium={profile?.is_premium}
                user={user} 
                recommendations={recommendations || []}
                reviews={reviews || []}
              />
            </div>
          </div>
        </main>

        {/* MOBILE LAYOUT */}
        <main className="dashboard-main mobile-profile-main mobile-only" style={{ paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: '90px', flexDirection: 'column' }}>
          {!isOwner && (
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 50 }}>
              <BackButton label="Back" />
            </div>
          )}
          {/* Cover Photo / Header */}
          <div style={{ 
            height: '220px', 
            background: profile?.cover_url ? `url(${profile.cover_url}) center/cover no-repeat` : 'linear-gradient(135deg, var(--accent-flat), var(--accent-subtle))', 
            width: '100%', 
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)' }}></div>
            {isOwner && (
              <Link href="/settings" style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '50%',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </Link>
            )}
          </div>

          <div style={{ padding: '0 1rem', position: 'relative', marginTop: '-60px', display: 'flex', flexDirection: 'column' }}>
            {/* Glassmorphic Info Card */}
            <div style={{
              background: 'color-mix(in srgb, var(--bg-surface) 85%, transparent)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '1.5rem',
              zIndex: 10
            }}>
              {/* Centered Avatar */}
              <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover no-repeat` : 'var(--bg-card)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '2.5rem', 
                color: 'var(--text-primary)', 
                border: '4px solid var(--bg-surface)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                marginTop: '-4rem',
                marginBottom: '1rem'
              }}>
                {!profile?.avatar_url && ((profile?.username || profile?.full_name)?.charAt(0).toUpperCase() || 'U')}
              </div>

              {/* Profile Name & Verification */}
              <h1 style={{ fontSize: '1.6rem', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'center', fontWeight: '800', letterSpacing: '-0.02em' }}>
                {profile?.username || profile?.full_name || 'Unknown User'}
                {profile?.is_verified && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" title="Verified Provider">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="var(--accent-flat)"/>
                  </svg>
                )}
              </h1>
              
              {/* Title / Handle */}
              <p style={{ color: 'var(--accent-flat)', fontSize: '1rem', fontWeight: '600', margin: '0 0 1.5rem 0', textAlign: 'center' }}>
                {profile?.title || 'iPlug Provider'}
              </p>

              {/* Actions Bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', width: '100%' }}>
                <ProfileActions profile={profile} isOwner={isOwner} profileId={profile.id} user={user} />
              </div>
            </div>

            {/* Skill Request Banner (Mobile Public) */}
            {profile.is_requesting_skill && (
              <div style={{ width: '100%', marginBottom: '1.5rem', padding: '1rem', background: 'var(--danger-subtle)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '1rem', alignItems: 'center', textAlign: 'left', boxShadow: '0 4px 12px var(--danger-subtle)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                  <Target size={20} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--danger)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Actively Looking For</h4>
                  <p style={{ margin: 0, color: 'var(--text-heading)', fontSize: '1rem', fontWeight: '500' }}>"{profile.skill_request_desc}"</p>
                </div>
              </div>
            )}

            {/* Premium Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-heading)' }}>{plugs?.length || 0}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-flat)', fontWeight: '600', marginTop: '0.25rem' }}>
                  <Package size={14} /> Plugs
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-heading)' }}>{averageRating === 'New' ? '—' : averageRating}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-flat)', fontWeight: '600', marginTop: '0.25rem' }}>
                  <Star size={14} /> Rating
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-heading)' }}>{joinedDate}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '0.25rem' }}>
                  <Calendar size={14} /> Joined
                </div>
              </div>
            </div>

            <BioSection bio={profile?.bio} />
            
            {isOwner && (
              <div style={{ marginTop: '0.5rem', width: '100%', marginBottom: '1rem' }}>
                <SkillRequestToggle isRequesting={profile.is_requesting_skill} currentDesc={profile.skill_request_desc} />
              </div>
            )}
          </div>

          {/* Interactive Tabs Container */}
          <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
            <ProfileTabs 
              profile={profile}
              plugs={plugs || []} 
              profileId={profile.id} 
              isOwner={isOwner} 
              isPremium={profile?.is_premium}
              user={user} 
              recommendations={recommendations || []}
              reviews={reviews || []}
            />
          </div>
        </main>
      </div>
    </AppShell>
  );
}

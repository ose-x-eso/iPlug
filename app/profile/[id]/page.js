import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import ProfileActions from '@/components/profile/ProfileActions';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileViewTracker from '@/components/profile/ProfileViewTracker';
import ReferralTracker from '@/components/profile/ReferralTracker';
import BioSection from '@/components/profile/BioSection';
import BackButton from '@/components/layout/BackButton';
import { Package, Star, Calendar } from 'lucide-react';

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
        <ReferralTracker profileId={profile.id} />
        
        {/* DESKTOP LAYOUT */}
        <main className="dashboard-main desktop-only" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 0 2rem 0', flexDirection: 'column' }}>
          {/* Cover Banner */}
          <div style={{ 
            height: '250px', 
            background: profile?.cover_url ? `url(${profile.cover_url}) center/cover no-repeat` : 'linear-gradient(135deg, var(--primary), var(--secondary))', 
            width: '100%', 
            position: 'relative' 
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }}></div>
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
                transition: 'background 0.2s ease',
                zIndex: 20
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </Link>
            )}
          </div>

          <div style={{ padding: '0 2rem', position: 'relative', marginTop: '-60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              {/* Avatar */}
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
                boxShadow: 'var(--shadow-lg)',
                zIndex: 10
              }}>
                {!profile?.avatar_url && ((profile?.username || profile?.full_name)?.charAt(0).toUpperCase() || 'U')}
              </div>

              {/* Actions Bar (Desktop alignment) */}
              <div style={{ display: 'flex', gap: '1rem', zIndex: 10 }}>
                <ProfileActions profile={profile} isOwner={isOwner} profileId={profile.id} user={user} />
              </div>
            </div>

            {/* Bio & Details */}
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {profile?.username || profile?.full_name || 'Unknown User'}
                {profile?.is_verified && (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" title="Verified Provider">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#3b82f6"/>
                  </svg>
                )}
              </h1>
              <p style={{ color: 'var(--primary)', fontWeight: '600', margin: '0 0 1rem 0' }}>{profile?.title || 'iPlug Provider'}</p>

              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={16} /> Member since {joinedDate}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Package size={16} /> {plugs?.length || 0} Plugs
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Star size={16} /> {averageRating === 'New' ? 'New' : `${averageRating} Average Rating`}
                </span>
              </div>

              <BioSection bio={profile?.bio} />
            </div>

            {/* Interactive Tabs */}
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

        {/* MOBILE LAYOUT */}
        <main className="dashboard-main mobile-profile-main mobile-only" style={{ paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: '90px', flexDirection: 'column' }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 50, width: '100%' }}>
            <BackButton label="Back" />
          </div>
          {/* Cover Photo / Header */}
          <div style={{ 
            height: '180px', 
            background: profile?.cover_url ? `url(${profile.cover_url}) center/cover no-repeat` : 'linear-gradient(135deg, var(--primary), var(--secondary))', 
            width: '100%', 
            position: 'relative',
            marginTop: '-60px' /* Pull up to hide behind glass back button if desired, but we want it below */
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)' }}></div>
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

          <div style={{ padding: '0 1.5rem', position: 'relative', marginTop: '-50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
              boxShadow: 'var(--shadow-md)',
              zIndex: 10,
              marginBottom: '1rem'
            }}>
              {!profile?.avatar_url && ((profile?.username || profile?.full_name)?.charAt(0).toUpperCase() || 'U')}
            </div>

            {/* Profile Name & Verification */}
            <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
              {profile?.username || profile?.full_name || 'Unknown User'}
              {profile?.is_verified && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" title="Verified Provider">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#3b82f6"/>
                </svg>
              )}
            </h1>
            
            {/* Title / Handle */}
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0 0 1.5rem 0', textAlign: 'center' }}>
              {profile?.title || 'iPlug Provider'}
            </p>

            {/* Stats Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              width: '100%', 
              padding: '1rem 0', 
              borderTop: '1px solid var(--border)', 
              borderBottom: '1px solid var(--border)',
              marginBottom: '1.5rem',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{plugs?.length || 0}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  <Package size={14} /> Plugs
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{averageRating === 'New' ? '—' : averageRating}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  <Star size={14} /> Rating
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{joinedDate}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  <Calendar size={14} /> Joined
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginBottom: '1.5rem' }}>
              <ProfileActions profile={profile} isOwner={isOwner} profileId={profile.id} user={user} />
            </div>

            <BioSection bio={profile?.bio} />
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

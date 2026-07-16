import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import ProfileActions from '@/components/profile/ProfileActions';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileViewTracker from '@/components/profile/ProfileViewTracker';
import ReferralTracker from '@/components/profile/ReferralTracker';

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
      <div className="dashboard-container">
      <ProfileViewTracker profileId={profile.id} viewerId={user?.id} viewerName={viewerName} />
      <ReferralTracker profileId={profile.id} />
      
      <main className="dashboard-main" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 0 2rem 0' }}>
        
        {/* Cover Banner */}
        <div style={{ 
          height: '250px', 
          background: profile?.cover_url ? `url(${profile.cover_url}) center/cover no-repeat` : 'linear-gradient(135deg, var(--primary), var(--secondary))', 
          width: '100%', 
          position: 'relative' 
        }}>
          {/* A soft overlay to make it look premium */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }}></div>
        </div>

        {/* Profile Info Container */}
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
                📅 Member since {joinedDate}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                📦 {plugs?.length || 0} Plugs
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                ⭐ {averageRating === 'New' ? 'New' : `${averageRating} Average Rating`}
              </span>
            </div>

            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text-primary)', maxWidth: '800px', whiteSpace: 'pre-wrap' }}>
              {profile?.bio || "This provider hasn't written a bio yet. Check out their plugs and reviews to learn more about what they offer!"}
            </p>
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
      </div>
    </AppShell>
  );
}

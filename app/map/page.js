import AppShell from '@/components/layout/AppShell';
import MapClientWrapper from './MapClientWrapper';
import { createClient } from '@/utils/supabase/server';

export default async function MapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: plugs, error: plugsError } = await supabase
    .from('plugs')
    .select('*, profiles(username, full_name, avatar_url, title, is_requesting_skill, skill_request_desc)');
    
  let currentUserProfile = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    currentUserProfile = profile;
  }
    
  // Fetch active distress beacons
  const { data: beacons } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, skill_request_desc, skill_request_lat, skill_request_lng')
    .eq('is_requesting_skill', true)
    .not('skill_request_lat', 'is', null);

  return (
    <AppShell initialUser={user}>
      <div style={{ flex: 1, minHeight: 'calc(100dvh - 70px)', position: 'relative', overflow: 'hidden' }}>
        <MapClientWrapper 
          initialPlugs={plugs || []} 
          initialBeacons={beacons || []}
          currentUserProfile={currentUserProfile} 
        />
      </div>
    </AppShell>
  );
}

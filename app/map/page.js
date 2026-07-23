import AppShell from '@/components/layout/AppShell';
import MapClientWrapper from './MapClientWrapper';
import { createClient } from '@/utils/supabase/server';

export default async function MapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: plugs, error: plugsError } = await supabase
    .from('plugs')
    .select('*, profiles(username, full_name, avatar_url, title)');
    
  const { data: broadcasts, error: civicError } = await supabase
    .from('civic_broadcasts')
    .select('*')
    .gte('expires_at', new Date().toISOString());

  return (
    <AppShell initialUser={user}>
      <div style={{ flex: 1, minHeight: 'calc(100dvh - 70px)', position: 'relative', overflow: 'hidden' }}>
        <MapClientWrapper initialPlugs={plugs || []} initialBroadcasts={broadcasts || []} />
      </div>
    </AppShell>
  );
}

import AppShell from '@/components/layout/AppShell';
import MapClientWrapper from './MapClientWrapper';
import { createClient } from '@/utils/supabase/server';

export default async function MapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: plugs, error } = await supabase
    .from('plugs')
    .select('*, profiles(username, full_name, avatar_url, title)');
    
  return (
    <AppShell initialUser={user}>
      <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, position: 'relative' }}>
          <MapClientWrapper initialPlugs={plugs || []} />
        </main>
      </div>
    </AppShell>
  );
}

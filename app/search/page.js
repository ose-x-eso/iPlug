import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SearchPageClient from './SearchPageClient';

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: plugs } = await supabase
    .from('plugs')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*');

  return (
    <SearchPageClient 
      user={user} 
      initialPlugs={plugs || []} 
      initialProfiles={profiles || []} 
    />
  );
}

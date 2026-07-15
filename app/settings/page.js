import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import SettingsForm from './SettingsForm';
import SecuritySettings from './SecuritySettings';

export default async function SettingsPage() {
  const supabase = await createClient();
  
  // Get current user session
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch the user's profile from the database
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="dashboard-container">
      <Navbar user={user} />
      
      <main className="dashboard-main" style={{ maxWidth: '800px', margin: '0 auto', padding: '6rem 1rem 2rem 1rem' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>Settings</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Manage your personal profile and account settings.</p>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Personal Information</h2>
          
          <SettingsForm initialProfile={profile} />
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
          <SecuritySettings />
        </div>

      </main>
    </div>
  );
}

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import SettingsForm from './SettingsForm';
import SecuritySettings from './SecuritySettings';
import BackButton from '@/components/layout/BackButton';
import LogoutButton from './LogoutButton';
import EditProfileSettings from './EditProfileSettings';
import ThemeToggle from '@/components/layout/ThemeToggle';
import DemoSettings from './DemoSettings';

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
    <AppShell initialUser={user}>
      <div className="dashboard-container">
      
      <main className="dashboard-main" style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem 1rem 2rem 1rem' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <BackButton />
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>Settings</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Manage your personal profile and account settings.</p>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Personal Information</h2>
          
          <SettingsForm initialProfile={profile} />
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Public Profile</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Update your bio, title, portfolio links, and photos.</p>
          <EditProfileSettings profile={profile} />
        </div>

        <DemoSettings />

        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
          <SecuritySettings />
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Appearance</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Theme</p>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Toggle between light and dark mode.</p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div style={{ marginTop: '3rem' }}>
          <LogoutButton />
        </div>

      </main>
      </div>
    </AppShell>
  );
}

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import SettingsForm from './SettingsForm';
import SecuritySettings from './SecuritySettings';
import LogoutButton from './LogoutButton';
import EditProfileSettings from './EditProfileSettings';
import ThemeToggle from '@/components/layout/ThemeToggle';
import DemoSettings from './DemoSettings';
import BackButton from '@/components/layout/BackButton';


export default async function SettingsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <AppShell initialUser={user}>
      <div className="native-page">
        
        <div className="native-header">
          <div className="native-header-content">
            <h1 className="native-title">Settings</h1>
            {/* The user explicitly wants the back arrow! */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BackButton label="Done" plain={true} />
            </div>
          </div>
        </div>

        <main className="native-main">
          
          <div className="native-section">
            <h2 className="native-section-title">Personal Information</h2>
            <SettingsForm initialProfile={profile} />
          </div>

          <div className="native-section">
            <h2 className="native-section-title">Public Profile</h2>
            <div className="native-card">
              <EditProfileSettings profile={profile} />
            </div>
          </div>

          <div className="native-section">
            <DemoSettings />
          </div>

          <div className="native-section">
            <h2 className="native-section-title">Security</h2>
            <SecuritySettings />
          </div>

          <div className="native-section">
            <h2 className="native-section-title">Appearance</h2>
            <div className="native-card">
              <div className="native-row">
                <span className="native-row-title">Dark Mode</span>
                <ThemeToggle />
              </div>
            </div>
          </div>

          <div className="native-section">
            <LogoutButton />
          </div>

          <div className="native-spacer"></div>
        </main>
      </div>
    </AppShell>
  );
}

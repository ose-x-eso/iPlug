import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import MarkAsRead from './MarkAsRead';
import { Bell } from 'lucide-react';

export default async function NotificationsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Notifications will be marked as read on the client side
  // via the <MarkAsRead /> component

  // Fetch notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <AppShell initialUser={user}>
      <div className="dashboard-container" style={{ background: 'var(--bg-base)', minHeight: '100dvh' }}>
      <MarkAsRead />
      
      <main className="dashboard-main native-main">
        
        <header className="native-header" style={{ position: 'relative', marginBottom: '1.5rem', background: 'transparent', borderBottom: 'none' }}>
          <h1 className="native-title">Notifications</h1>
        </header>

        <div className="native-card">
          {!notifications || notifications.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}><Bell size={48} className="inline-icon" /></span>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>All caught up!</h3>
              <p style={{ margin: 0 }}>You have no notifications right now.</p>
            </div>
          ) : (
            notifications.map((notif, index) => (
              <Link 
                href={notif.link || '#'} 
                key={notif.id}
                className="native-row"
                style={{ 
                  background: notif.is_read ? 'transparent' : '#2C2C2E',
                  padding: '1rem'
                }}
              >
                <div className="native-row-content" style={{ flex: 1, overflow: 'hidden', alignItems: 'flex-start' }}>
                  <div className="native-icon-box" style={{ background: '#3b82f6', borderRadius: '50%' }}>
                    <Bell size={16} color="white" />
                  </div>
                  
                  <div className="native-row-text" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <h4 className="native-row-title" style={{ fontWeight: notif.is_read ? '500' : '700', textTransform: 'capitalize' }}>
                        {notif.type ? notif.type.replace('_', ' ') : 'Notification'}
                      </h4>
                      <span suppressHydrationWarning style={{ color: '#6b7280', fontSize: '13px' }}>
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="native-input-label" style={{ 
                      lineHeight: '1.4',
                      color: notif.is_read ? '#9ca3af' : 'white',
                      whiteSpace: 'normal'
                    }}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
      </div>
    </AppShell>
  );
}

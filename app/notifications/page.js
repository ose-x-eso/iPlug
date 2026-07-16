import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import MarkAsRead from './MarkAsRead';

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
      <div className="dashboard-container">
      <MarkAsRead />
      
      <main className="dashboard-main" style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem 1rem 2rem 1rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Notifications</h1>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {!notifications || notifications.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔔</span>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>All caught up!</h3>
              <p style={{ margin: 0 }}>You have no notifications right now.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notifications.map((notif, index) => (
                <Link 
                  href={notif.link || '#'} 
                  key={notif.id}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '1rem', 
                    padding: '1.5rem', 
                    borderBottom: index < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                    textDecoration: 'none',
                    background: notif.is_read ? 'transparent' : 'var(--bg-input)',
                    transition: 'background 0.2s ease'
                  }}
                  className="hover:bg-input"
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                    🔔
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: notif.is_read ? '500' : '700', textTransform: 'capitalize' }}>
                        {notif.type ? notif.type.replace('_', ' ') : 'Notification'}
                      </h4>
                      <span suppressHydrationWarning style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ 
                      margin: 0, 
                      color: 'var(--text-secondary)', 
                      fontSize: '0.95rem',
                      lineHeight: '1.4'
                    }}>
                      {notif.message}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      </div>
    </AppShell>
  );
}

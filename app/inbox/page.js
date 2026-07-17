import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { Mailbox } from 'lucide-react';

export default async function InboxPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch all messages involving this user
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  // Fetch all profiles so we can map names
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name');

  // Group messages by conversation partner
  const conversationsMap = new Map();

  if (messages) {
    messages.forEach(msg => {
      const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          latestMessage: msg,
          unreadCount: 0
        });
      }
      
      // Count unread messages where current user is the receiver
      if (msg.receiver_id === user.id && !msg.is_read) {
        conversationsMap.get(otherUserId).unreadCount += 1;
      }
    });
  }

  // Convert to array and format
  const conversations = Array.from(conversationsMap.entries()).map(([otherUserId, data]) => {
    const profile = profiles?.find(p => p.id === otherUserId);
    return {
      otherUserId,
      fullName: profile?.full_name || 'Unknown User',
      latestMessage: data.latestMessage,
      unreadCount: data.unreadCount
    };
  });

  return (
    <AppShell initialUser={user}>
      <div className="dashboard-container">
      
      <main className="dashboard-main" style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem 1rem 2rem 1rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Inbox</h1>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}><Mailbox size={16} className="inline-icon" /></span>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>No messages yet</h3>
              <p style={{ margin: 0 }}>When you contact a plug or someone contacts you, it will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {conversations.map((conv, index) => (
                <Link 
                  href={`/messages/${conv.otherUserId}`} 
                  key={conv.otherUserId}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    padding: '1.5rem', 
                    borderBottom: index < conversations.length - 1 ? '1px solid var(--border)' : 'none',
                    textDecoration: 'none',
                    background: 'transparent',
                    transition: 'background 0.2s ease'
                  }}
                  className="hover:bg-input"
                >
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', flexShrink: 0 }}>
                    {conv.fullName.charAt(0).toUpperCase()}
                  </div>
                  
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <h4 style={{ margin: 0, color: conv.unreadCount > 0 ? 'white' : 'var(--text-primary)', fontSize: '1.1rem', fontWeight: conv.unreadCount > 0 ? '700' : '500' }}>
                        {conv.fullName}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span suppressHydrationWarning style={{ color: conv.unreadCount > 0 ? 'var(--brand-primary)' : 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: conv.unreadCount > 0 ? '600' : 'normal' }}>
                          {new Date(conv.latestMessage.created_at).toLocaleDateString()}
                        </span>
                        {conv.unreadCount > 0 && (
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
                        )}
                      </div>
                    </div>
                    <p style={{ 
                      margin: 0, 
                      color: conv.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)', 
                      fontWeight: conv.unreadCount > 0 ? '600' : 'normal',
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      fontSize: '0.95rem'
                    }}>
                      <span style={{ color: 'var(--text-tertiary)', marginRight: '0.5rem', fontWeight: 'normal' }}>
                        {conv.latestMessage.sender_id === user.id ? 'You:' : ''}
                      </span>
                      {conv.latestMessage.content}
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

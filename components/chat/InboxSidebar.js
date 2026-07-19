import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Mailbox, Edit, Search } from 'lucide-react';

export default async function InboxSidebar({ user }) {
  const supabase = await createClient();

  if (!user) return null;

  // Fetch all messages involving this user
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  // Fetch all profiles so we can map names
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url');

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
      fullName: profile?.full_name || profile?.username || 'Instagram User',
      avatarUrl: profile?.avatar_url,
      latestMessage: data.latestMessage,
      unreadCount: data.unreadCount
    };
  });

  return (
    <div className="messages-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-card)' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {user.user_metadata?.username || user.user_metadata?.full_name || 'ose_101'}
          <svg aria-label="Down chevron icon" fill="currentColor" height="12" role="img" viewBox="0 0 24 24" width="12"><path d="M21 17.502a.997.997 0 0 1-.707-.293L12 8.913l-8.293 8.296a1 1 0 1 1-1.414-1.414l9-9.004a1.03 1.03 0 0 1 1.414 0l9 9.004A1 1 0 0 1 21 17.502Z"></path></svg>
        </h2>
        <Edit size={24} />
      </div>

      {/* Search Bar Placeholder */}
      <div style={{ padding: '0.5rem 1.5rem' }}>
         <div style={{ background: 'var(--bg-input)', borderRadius: '100px', display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', gap: '0.5rem' }}>
           <Search size={16} color="var(--text-muted)" />
           <input type="text" placeholder="Search" style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none' }} />
         </div>
      </div>

      {/* Messages Header */}
      <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Messages</h3>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>Requests</span>
      </div>

      {/* Conversation List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {conversations.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}><Mailbox size={32} /></span>
            <p style={{ margin: 0 }}>No messages found.</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <Link 
              href={`/messages/${conv.otherUserId}`} 
              key={conv.otherUserId}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                padding: '0.5rem 1.5rem', 
                textDecoration: 'none',
                background: 'transparent',
                transition: 'background 0.2s ease',
              }}
              className="hover-bg-input"
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', flexShrink: 0, overflow: 'hidden' }}>
                {conv.avatarUrl ? (
                  <img src={conv.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  conv.fullName.charAt(0).toUpperCase()
                )}
              </div>
              
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <h4 style={{ margin: 0, color: conv.unreadCount > 0 ? 'white' : 'var(--text-primary)', fontSize: '1rem', fontWeight: conv.unreadCount > 0 ? '700' : '500', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {conv.fullName}
                  {/* Mock Verification Badge for AI */}
                  {conv.fullName.includes('AI') && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#3b82f6"/>
                    </svg>
                  )}
                </h4>
                <p style={{ 
                  margin: 0, 
                  color: conv.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)', 
                  fontWeight: conv.unreadCount > 0 ? '600' : 'normal',
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  fontSize: '0.85rem',
                  display: 'flex',
                  gap: '0.25rem'
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                    {conv.latestMessage.sender_id === user.id ? 'You: ' : ''}
                  </span>
                  {conv.latestMessage.content}
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    {' · '}
                    <span suppressHydrationWarning>
                      {new Date(conv.latestMessage.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </span>
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

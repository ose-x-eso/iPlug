'use client';

import Link from 'next/link';
import { Mailbox, Edit, Search } from 'lucide-react';

export default function InboxSidebar({ user, initialConversations = [] }) {
  if (!user) return null;

  const conversations = initialConversations;

  return (
    <div className="messages-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-surface)' }}>
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
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 2rem 1rem' }}>
        {conversations.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}><Mailbox size={32} /></span>
            <p style={{ margin: 0 }}>No messages found.</p>
          </div>
        ) : (
          <div className="native-card">
            {conversations.map((conv) => (
              <Link 
                href={`/messages/${conv.otherUserId}`} 
                key={conv.otherUserId}
                className="native-row hover-bg-input"
                style={{ padding: '0.75rem 1rem' }}
              >
                <div className="native-row-content" style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem', flexShrink: 0, overflow: 'hidden' }}>
                    {conv.avatarUrl ? (
                      <img src={conv.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      conv.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  <div className="native-row-text" style={{ flex: 1, overflow: 'hidden' }}>
                    <span className="native-row-title" style={{ color: conv.unreadCount > 0 ? 'white' : 'var(--text-primary)', fontWeight: conv.unreadCount > 0 ? '700' : '500', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {conv.fullName}
                      {conv.fullName.includes('AI') && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#3b82f6"/>
                        </svg>
                      )}
                    </span>
                    <span className="native-input-label" style={{ 
                      color: conv.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)', 
                      fontWeight: conv.unreadCount > 0 ? '600' : 'normal',
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
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
                    </span>
                  </div>
                </div>
                {conv.unreadCount > 0 ? (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }}></div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="m9 18 6-6-6-6"/></svg>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

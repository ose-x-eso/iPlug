'use client';

import Link from 'next/link';
import { Mailbox, Edit, Search } from 'lucide-react';

export default function InboxSidebar({ user, initialConversations = [] }) {
  if (!user) return null;

  const conversations = initialConversations;

  return (
    <div className="messages-sidebar flex flex-col h-full bg-[var(--bg-surface)] md:bg-[var(--bg-card)]">
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
      <div className="flex-1 overflow-y-auto px-4 pb-8 md:p-0">
        {conversations.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}><Mailbox size={32} /></span>
            <p style={{ margin: 0 }}>No messages found.</p>
          </div>
        ) : (
          <>
            {/* Desktop View (Instagram-like) */}
            <div className="desktop-only">
              {conversations.map((conv) => (
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
                    color: 'inherit'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-input)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-heading)', fontSize: '1.25rem', fontWeight: '600', flexShrink: 0, overflow: 'hidden' }}>
                    {conv.avatarUrl ? (
                      <img src={conv.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      conv.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ margin: 0, color: conv.unreadCount > 0 ? 'var(--text-heading)' : 'var(--text-heading)', fontSize: '0.95rem', fontWeight: conv.unreadCount > 0 ? '700' : '400', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {conv.fullName}
                      {conv.fullName.includes('AI') && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#3b82f6"/>
                        </svg>
                      )}
                    </span>
                    <span style={{ 
                      margin: 0, 
                      color: conv.unreadCount > 0 ? 'var(--text-heading)' : 'var(--text-muted)', 
                      fontWeight: conv.unreadCount > 0 ? '600' : '400',
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      fontSize: '0.85rem',
                      display: 'flex',
                      gap: '4px'
                    }}>
                      <span style={{ color: 'inherit' }}>
                        {conv.latestMessage.sender_id === user.id ? 'You: ' : ''}{conv.latestMessage.content}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {' · '}
                        <span suppressHydrationWarning>
                          {new Date(conv.latestMessage.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </span>
                    </span>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div>
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile View (Edge-to-Edge) */}
            <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column' }}>
              {conversations.map((conv) => (
                <Link 
                  href={`/messages/${conv.otherUserId}`} 
                  key={conv.otherUserId}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '12px 0', 
                    textDecoration: 'none',
                    color: 'inherit',
                    borderBottom: '1px solid var(--border)'
                  }}
                >
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-heading)', fontSize: '1.25rem', fontWeight: '600', flexShrink: 0, overflow: 'hidden' }}>
                    {conv.avatarUrl ? (
                      <img src={conv.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      conv.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: conv.unreadCount > 0 ? 'var(--text-heading)' : 'var(--text-heading)', fontSize: '0.95rem', fontWeight: conv.unreadCount > 0 ? '700' : '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {conv.fullName}
                      {conv.fullName.includes('AI') && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#3b82f6"/>
                        </svg>
                      )}
                    </span>
                    <span style={{ 
                      color: conv.unreadCount > 0 ? 'var(--text-heading)' : 'var(--text-muted)', 
                      fontWeight: conv.unreadCount > 0 ? '600' : '400',
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      fontSize: '0.85rem',
                      display: 'flex',
                      gap: '4px'
                    }}>
                      <span style={{ color: 'inherit' }}>
                        {conv.latestMessage.sender_id === user.id ? 'You: ' : ''}{conv.latestMessage.content}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {' · '}
                        <span suppressHydrationWarning>
                          {new Date(conv.latestMessage.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </span>
                    </span>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0, marginRight: '8px' }}></div>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

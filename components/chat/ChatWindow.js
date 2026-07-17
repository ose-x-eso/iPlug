'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { sendMessage, markMessagesAsRead } from '@/app/actions/messages';
import Link from 'next/link';
import { useTransition } from 'react';
import { Hand, MapPin, Phone, User } from 'lucide-react';

export default function ChatWindow({ initialMessages, currentUser, otherUser }) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [isSending, setIsSending] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef(null);
  const supabase = createClient();

  const displayName = otherUser?.username || otherUser?.full_name || otherUser?.email?.split('@')[0] || "User";

  const isInitialLoad = useRef(true);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: isInitialLoad.current ? 'auto' : 'smooth' 
    });
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up Realtime Subscription
  useEffect(() => {
    if (!currentUser?.id || !otherUser?.id) return;

    // Listen for inserts on the messages table where sender or receiver match
    const channel = supabase
      .channel('realtime_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new;
          if (
            (newMessage.sender_id === currentUser.id && newMessage.receiver_id === otherUser.id) ||
            (newMessage.sender_id === otherUser.id && newMessage.receiver_id === currentUser.id)
          ) {
            setMessages((prev) => {
              if (!prev.find(m => m.id === newMessage.id)) {
                return [...prev, newMessage];
              }
              return prev;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const updatedMessage = payload.new;
          setMessages((prev) => 
            prev.map((msg) => msg.id === updatedMessage.id ? updatedMessage : msg)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.id, otherUser.id]);

  // Mark messages as read when they come in or when the window opens
  useEffect(() => {
    const unreadMessages = messages.filter(
      (msg) => msg.receiver_id === currentUser.id && !msg.is_read
    );

    if (unreadMessages.length > 0) {
      markMessagesAsRead(otherUser.id);
      
      // Update local state so they appear read immediately
      setTimeout(() => {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.receiver_id === currentUser.id ? { ...msg, is_read: true } : msg
          )
        );
      }, 0);
    }
  }, [messages, currentUser.id, otherUser.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const content = form.content.value;
    
    if (!content.trim()) return;

    setIsSending(true);

    const formData = new FormData();
    formData.append('receiver_id', otherUser.id);
    formData.append('content', content);

    // Clear input immediately for better UX
    form.reset();

    startTransition(async () => {
      try {
        const result = await sendMessage(formData);
        
        if (result?.error) {
          alert("Failed to send: " + result.error);
        }
      } catch (err) {
        console.error("Message send error:", err);
      } finally {
        setIsSending(false);
      }
    });
  };

  return (
    <div className="chat-window-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      
      {/* Chat Header */}
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', zIndex: 10 }}>
        <Link href={`/profile/${otherUser.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-primary)' }}>
              {displayName}
              {otherUser?.is_verified && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" title="Verified Provider">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#3b82f6"/>
                </svg>
              )}
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>iPlug Provider</p>
          </div>
        </Link>
        
        {/* Call Icons */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: 'var(--primary)' }}>
          <button style={{ color: 'inherit', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => alert("Voice call coming soon!")}>
            <Phone size={20} />
          </button>
          <button style={{ color: 'inherit', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => alert("Video call coming soon!")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages-area" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}><Hand size={16} className="inline-icon" /></span>
            <p>Send a message to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === currentUser.id;
            return (
              <div className="chat-message-bubble" key={msg.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                <div style={{ 
                  background: isMine ? 'linear-gradient(45deg, var(--primary), var(--secondary))' : 'var(--bg-input)', 
                  color: isMine ? 'white' : 'var(--text-primary)',
                  padding: '0.75rem 1rem', 
                  borderRadius: isMine ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {msg.content}
                </div>
                <div style={{ 
                  fontSize: '0.65rem', 
                  marginTop: '0.25rem', 
                  textAlign: isMine ? 'right' : 'left',
                  color: isMine ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  justifyContent: isMine ? 'flex-end' : 'flex-start'
                }}>
                  <span suppressHydrationWarning>
                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  </span>
                  {isMine && (
                      <span style={{ 
                        color: msg.is_read ? '#60a5fa' : 'rgba(255,255,255,0.7)',
                        fontSize: '0.8rem',
                        marginLeft: '2px',
                        fontWeight: 'bold',
                        letterSpacing: '-2px'
                      }}>
                        ✓✓
                      </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', position: 'relative' }}>
        
        {/* Attachment Menu Popup */}
        {showAttachments && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '1rem',
            marginBottom: '0.5rem',
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border)',
            borderRadius: '1rem',
            padding: '0.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 100,
            width: '240px'
          }}>
            {[
              { icon: '📷', label: 'Photo/Video', color: '#ec4899' },
              { icon: <MapPin size={16} className="inline-icon" />, label: 'Location', color: '#10b981' },
              { icon: '📄', label: 'Document', color: '#8b5cf6' },
              { icon: <User size={16} className="inline-icon" />, label: 'Contact', color: '#6366f1' }
            ].map((item, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  alert(`${item.label} attachment is coming soon!`);
                  setShowAttachments(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  color: 'white'
                }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} autoComplete="off">
          <input type="hidden" name="receiver_id" value={otherUser?.id} />
          
          <button 
            type="button"
            onClick={() => setShowAttachments(!showAttachments)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              color: showAttachments ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, color 0.2s',
              transform: showAttachments ? 'rotate(45deg)' : 'rotate(0)'
            }}
            title="Attach"
          >
            +
          </button>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', background: 'var(--bg-input)', padding: '0 0.5rem 0 1rem' }}>
            <input 
              type="text" 
              name="content"
              placeholder="Type a message..." 
              disabled={isSending}
              autoComplete="off"
              style={{ flex: 1, padding: '0.75rem 0', border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none' }}
            />
            
            {/* Camera inside input bar */}
            <button type="button" onClick={() => alert("Camera coming soon!")} style={{ padding: '0.5rem', color: 'var(--text-secondary)', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            </button>
          </div>
          
          {/* Microphone next to Send / in input bar area */}
          <button type="button" onClick={() => alert("Voice note coming soon!")} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', background: 'var(--bg-input)', borderRadius: '50%', border: 'none', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
          </button>

          <button 
            type="submit" 
            disabled={isSending}
            style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 'bold', cursor: isSending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>

    </div>
  );
}

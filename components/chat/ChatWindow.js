'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { sendMessage, markMessagesAsRead } from '@/app/actions/messages';
import Link from 'next/link';

export default function ChatWindow({ initialMessages, currentUser, otherUser }) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const supabase = createClient();

  // Scroll to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      setMessages((prev) => 
        prev.map((msg) => 
          msg.receiver_id === currentUser.id ? { ...msg, is_read: true } : msg
        )
      );
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

    const result = await sendMessage(formData);
    
    if (result?.error) {
      alert("Failed to send: " + result.error);
    }
    
    setIsSending(false);
  };

  return (
    <div className="chat-window-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      
      {/* Chat Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href={`/profile/${otherUser.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {otherUser.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="chat-header-content">
            <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>{otherUser.full_name}</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>iPlugg Provider</p>
          </div>
        </Link>
      </div>

      {/* Messages Area */}
      <div className="chat-messages-area" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>👋</span>
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
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMine && (
                    <span style={{ 
                      color: msg.is_read ? '#60a5fa' : 'rgba(255,255,255,0.7)',
                      fontSize: '0.8rem',
                      marginLeft: '2px',
                      fontWeight: 'bold'
                    }}>
                      {msg.is_read ? '✓✓' : msg.is_delivered ? '✓✓' : '✓'}
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
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="hidden" name="receiver_id" value={otherUser?.id} />
          <input 
            type="text" 
            name="content"
            placeholder="Type a message..." 
            disabled={isSending}
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
          />
          <button 
            type="submit" 
            disabled={isSending}
            style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 'bold', cursor: isSending ? 'not-allowed' : 'pointer' }}
          >
            Send
          </button>
        </form>
      </div>

    </div>
  );
}

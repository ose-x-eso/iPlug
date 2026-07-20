'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X, Mailbox } from 'lucide-react';
import { getNotifications, markNotificationAsRead } from '@/app/actions/notifications';
import './layout.css';

export default function NotificationsDropdown({ unreadCount }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Fetch notifications when opened
  useEffect(() => {
    if (isOpen) {
      const fetchNotifs = async () => {
        setIsLoading(true);
        try {
          const data = await getNotifications();
          setNotifications(data.slice(0, 5)); // Show top 5
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchNotifs();
    }
  }, [isOpen, unreadCount]);

  const handleSeeAll = () => {
    setIsOpen(false);
    router.push('/notifications');
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="nav-icon-wrap" 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-primary)', 
          cursor: 'pointer',
          padding: 0
        }}
      >
        <Bell size={24} strokeWidth={2} />
        {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '-0.5rem',
          marginTop: '0.5rem',
          width: '320px',
          backgroundColor: 'var(--bg-surface, #121214)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '400px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            borderBottom: '1px solid var(--border)'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Notifications</h3>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem 0' }}>
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}><Mailbox size={16} className="inline-icon" /></span>
                No new notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={async () => {
                    setIsOpen(false);
                    if (!notif.is_read) {
                      await markNotificationAsRead(notif.id);
                      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                    }
                    if (notif.link) {
                      router.push(notif.link);
                    } else if (notif.type === 'NEW_MESSAGE') {
                      router.push('/messages');
                    } else {
                      router.push('/notifications');
                    }
                  }}
                  style={{ 
                    padding: '1rem', 
                    borderBottom: '1px solid var(--border)',
                    background: notif.is_read ? 'transparent' : 'var(--bg-input)',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => { if (notif.is_read) e.currentTarget.style.background = 'var(--bg-input)' }}
                  onMouseOut={(e) => { if (notif.is_read) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{notif.type}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{notif.message}</p>
                </div>
              ))
            )}
          </div>

          <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <button 
              onClick={handleSeeAll}
              className="btn btn-ghost btn-full"
              style={{ fontSize: '0.9rem' }}
            >
              See all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

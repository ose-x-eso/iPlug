'use client';

import Link from 'next/link';

import { useState, useEffect, useMemo, useRef } from 'react';
import ThemeToggle from './ThemeToggle';
import AuthModal from '@/components/auth/AuthModal';
import CreatePlugModal from '@/components/feed/CreatePlugModal';
import { createClient } from '@/utils/supabase/client';
import { logout } from '@/app/actions/auth';
import { markMessageAsDelivered, markAllUnreadAsDelivered } from '@/app/actions/messages';

export default function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const menuRef = useRef(null);
  
  // Stabilize the client instance across renders to prevent infinite useEffect loops
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Get initial session
    const fetchUserAndBadges = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        // Ping the server to mark any backlog messages as delivered!
        markAllUnreadAsDelivered();

        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', currentUser.id)
          .eq('is_read', false);
        if (count !== null) setUnreadCount(count);
      }
    };
    fetchUserAndBadges();

    // Bulletproof Delivery Catch-Up: Run every 5 seconds to ensure any missed websocket events are caught
    const interval = setInterval(() => {
      // The server action handles auth validation, so we don't need to rely on local React state which might be trapped in a closure!
      markAllUnreadAsDelivered();
    }, 5000);

    // Listen for auth changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // Listen for new incoming messages to update the badge!
    let messageSub;
    if (user) {
      messageSub = supabase
        .channel('navbar_messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
          (payload) => {
            setUnreadCount((prev) => prev + 1);
            // Fire delivery receipt back to the server
            markMessageAsDelivered(payload.new.id);
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
          (payload) => {
            if (payload.old.is_read === false && payload.new.is_read === true) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe();
    }

    return () => {
      authSub.unsubscribe();
      if (messageSub) supabase.removeChannel(messageSub);
    };
  }, [supabase, user?.id]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      <nav className="landing-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="logo-mark">⚡</div>
            iPlugg
          </Link>

          {/* Desktop Navigation Links */}
          <div className="desktop-only" style={{ gap: '1.5rem', alignItems: 'center' }}>
            <Link href="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '500', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🏠 Home
            </Link>
            {user && (
              <Link href="/my-plugs" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '500', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📦 My Plugs
              </Link>
            )}
          </div>
        </div>
        
        <div className="topbar-actions">
          <div className="desktop-only"><ThemeToggle /></div>
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                className="btn btn-primary btn-sm desktop-only"
                onClick={() => setIsCreateOpen(true)}
              >
                + List a Plug
              </button>
              
              <Link href="/inbox" className="btn btn-secondary desktop-only" style={{ textDecoration: 'none', position: 'relative' }}>
                📥 Inbox
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </Link>
              
              <div className="user-menu" ref={menuRef} style={{ position: 'relative' }}>
              <button 
                className="user-email-btn"
                style={{ display: 'flex', background: 'var(--bg-input)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)' }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              {isMenuOpen && (
                <div className="user-dropdown">
                  {/* Mobile Only Dropdown Links */}
                  <div className="mobile-only" style={{ flexDirection: 'column' }}>
                    <Link href="/" className="dropdown-item" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setIsMenuOpen(false)}>🏠 Home</Link>
                    <button className="dropdown-item" onClick={() => { setIsCreateOpen(true); setIsMenuOpen(false); }}>➕ List a Plug</button>
                    <Link href="/inbox" className="dropdown-item" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setIsMenuOpen(false)}>
                      📥 Inbox {unreadCount > 0 && <span style={{ background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '10px', marginLeft: '5px', fontSize: '0.7rem' }}>{unreadCount}</span>}
                    </Link>
                    <div className="dropdown-item" onClick={(e) => e.stopPropagation()} style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Theme
                      <ThemeToggle />
                    </div>
                    <div className="dropdown-divider"></div>
                  </div>

                  <div className="dropdown-item">👤 Profile <span className="coming-soon">Soon</span></div>
                  <Link href="/my-plugs" className="dropdown-item" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }} onClick={() => setIsMenuOpen(false)}>
                    📦 My Plugs
                  </Link>
                  <div className="dropdown-item">⚙️ Settings <span className="coming-soon">Soon</span></div>
                  <div className="dropdown-divider"></div>
                  <button 
                    onClick={async () => {
                      setIsMenuOpen(false);
                      await logout();
                      window.location.reload();
                    }} 
                    className="dropdown-item logout-btn"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          ) : (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setIsAuthOpen(true)}
            >
              Get Started
            </button>
          )}
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />

      {user && (
        <CreatePlugModal 
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </>
  );
}

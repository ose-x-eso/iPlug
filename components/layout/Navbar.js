'use client';

import { useState, useEffect, useMemo } from 'react';
import ThemeToggle from './ThemeToggle';
import AuthModal from '@/components/auth/AuthModal';
import { createClient } from '@/utils/supabase/client';
import { logout } from '@/app/actions/auth';

export default function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // Stabilize the client instance across renders to prevent infinite useEffect loops
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Get initial session
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <>
      <nav className="landing-topbar">
        <div className="logo">
          <div className="logo-mark">⚡</div>
          iPlugg
        </div>
        
        <div className="topbar-actions">
          <ThemeToggle />
          
          {user ? (
            <div className="user-menu">
              <span className="user-email">{user.email}</span>
              <button 
                onClick={async () => await logout()} 
                className="btn btn-outline btn-sm"
              >
                Logout
              </button>
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
    </>
  );
}

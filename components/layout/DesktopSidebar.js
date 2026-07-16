'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MessageSquare, PlusCircle, LogIn, MapPin, Bell } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import './layout.css';

export default function DesktopSidebar({ user, unreadCount, unreadNotificationsCount, onOpenCreate, onOpenAuth }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('username, avatar_url, full_name').eq('id', user.id).single();
      if (data) setProfile(data);
    };
    fetchProfile();
  }, [user]);

  const navLinks = [
    { name: 'Map', href: '/map', icon: MapPin, reqAuth: false },
    { name: 'Home', href: '/', icon: Home, reqAuth: false },
    { name: 'Search', href: '/search', icon: Search, reqAuth: false },
    { name: 'Notifications', href: '/notifications', icon: Bell, badge: unreadNotificationsCount, reqAuth: true },
    { name: 'Inbox', href: '/inbox', icon: MessageSquare, badge: unreadCount, reqAuth: true },
  ];

  return (
    <aside className="desktop-sidebar glass">
      <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className="logo">
          <div className="logo-mark">iP</div>
          iPlug
        </Link>
      </div>

      <nav className="sidebar-nav">
        {navLinks.map((link) => {
          if (link.reqAuth && !user) return null;
          
          const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
          const Icon = link.icon;
          
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon-wrap">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {link.badge > 0 && <span className="nav-badge">{link.badge}</span>}
              </div>
              <span>{link.name}</span>
            </Link>
          );
        })}


        {/* Action Button right under main navigation */}
        {user && (
          <button className="btn btn-primary btn-full new-plug-btn" onClick={onOpenCreate} style={{ marginTop: '1.5rem', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}>
            <PlusCircle size={20} />
            <span style={{ marginLeft: '0.5rem', fontWeight: 'bold' }}>Post a Plug</span>
          </button>
        )}
      </nav>

      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto' }}>
        {user ? (
          <Link 
            href={`/profile/${user.id}`} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-md)', 
              textDecoration: 'none', 
              color: 'var(--text-primary)',
              background: pathname?.startsWith(`/profile/${user.id}`) ? 'var(--bg-input)' : 'transparent',
              transition: 'background 0.2s'
            }}
          >
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: 'var(--primary)', 
              color: 'white',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 'bold',
              overflow: 'hidden'
            }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.username || user?.user_metadata?.username || 'Profile'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View Profile</span>
            </div>
          </Link>
        ) : (
          <button className="btn btn-primary btn-full" onClick={onOpenAuth}>
            <LogIn size={18} />
            <span style={{ marginLeft: '0.5rem' }}>Get Started</span>
          </button>
        )}
      </div>
    </aside>
  );
}

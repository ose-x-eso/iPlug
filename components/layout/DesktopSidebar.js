'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MessageSquare, PlusCircle, LogIn, MapPin, Bell, Settings, Package, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Logo from './Logo';
import './layout.css';

export default function DesktopSidebar({ user, unreadCount, unreadNotificationsCount, onOpenCreate, onOpenAuth }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  // Restore collapse state from localStorage on mount
  useEffect(() => {
    setTimeout(() => {
      try {
        const stored = localStorage.getItem('iplug_sidebar_collapsed');
        if (stored === 'true') setCollapsed(true);
      } catch (e) {}
    }, 0);
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem('iplug_sidebar_collapsed', String(next));
    } catch (e) {}
  };

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
    { name: 'Inbox', href: '/messages', icon: MessageSquare, badge: unreadCount, reqAuth: true },
    { name: 'My Plugs', href: '/my-plugs', icon: Package, reqAuth: true },
    { name: 'Settings', href: '/settings', icon: Settings, reqAuth: true },
  ];

  return (
    <aside className={`desktop-sidebar glass ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        <Link href="/" style={{ textDecoration: 'none', overflow: 'hidden' }}>
          <Logo size={28} showText={!collapsed} />
        </Link>
        <button
          className="sidebar-toggle-btn"
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
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
              title={collapsed ? link.name : undefined}
            >
              <div className="nav-icon-wrap">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {link.badge > 0 && <span className="nav-badge">{link.badge}</span>}
              </div>
              <span className="nav-label">{link.name}</span>
            </Link>
          );
        })}

        {user && (
          <button
            className="btn btn-primary btn-full new-plug-btn"
            onClick={onOpenCreate}
            title={collapsed ? 'Post a Plug' : undefined}
          >
            <PlusCircle size={20} />
            <span className="nav-label" style={{ marginLeft: '0.5rem', fontWeight: 'bold' }}>Post a Plug</span>
          </button>
        )}
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <Link
            href={`/profile/${user.id}`}
            className="sidebar-profile-link"
            style={{
              background: pathname?.startsWith(`/profile/${user.id}`) ? 'var(--bg-input)' : 'transparent',
            }}
            title={collapsed ? (profile?.username || 'Profile') : undefined}
          >
            <div className="sidebar-avatar">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div className="nav-label sidebar-profile-text">
              <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.username || user?.user_metadata?.username || 'Profile'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View Profile</span>
            </div>
          </Link>
        ) : (
          <button className="btn btn-primary btn-full" onClick={onOpenAuth} title={collapsed ? 'Get Started' : undefined}>
            <LogIn size={18} />
            <span className="nav-label" style={{ marginLeft: '0.5rem' }}>Get Started</span>
          </button>
        )}
      </div>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationsDropdown from './NotificationsDropdown';
import { Settings, Package } from 'lucide-react';
import Logo from './Logo';
import './layout.css';

export default function MobileTopNav({ unreadNotificationsCount }) {
  const pathname = usePathname();
  
  // Only show on these specific pages on mobile
  const allowedRoutes = ['/', '/search', '/messages'];
  if (!allowedRoutes.includes(pathname)) return null;

  return (
    <header className="mobile-top-nav glass" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '0 1rem',
      height: 'var(--topbar-height)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <Logo size={24} showText={true} />
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link id="tour-map" href="/map" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)', textDecoration: 'none', gap: '2px' }} title="Map">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
          <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>Map</span>
        </Link>
        <Link href="/my-plugs" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)', textDecoration: 'none', gap: '2px' }}>
          <Package size={20} />
          <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>Plugs</span>
        </Link>
        <Link href="/settings" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)', textDecoration: 'none', gap: '2px' }}>
          <Settings size={20} />
          <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>Settings</span>
        </Link>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <NotificationsDropdown unreadCount={unreadNotificationsCount} />
          <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Alerts</span>
        </div>
      </div>
    </header>
  );
}

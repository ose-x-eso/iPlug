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
  const allowedRoutes = ['/', '/search', '/inbox'];
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link href="/map" style={{ color: 'var(--text-secondary)' }} title="Map">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
        </Link>
        <Link href="/my-plugs" style={{ color: 'var(--text-secondary)' }}>
          <Package size={20} />
        </Link>
        <Link href="/settings" style={{ color: 'var(--text-secondary)' }}>
          <Settings size={20} />
        </Link>
        <NotificationsDropdown unreadCount={unreadNotificationsCount} />
      </div>
    </header>
  );
}

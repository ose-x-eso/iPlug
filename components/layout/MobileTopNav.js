'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationsDropdown from './NotificationsDropdown';
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
      <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
        <div className="logo-mark" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>iP</div>
        <span style={{ fontSize: '1.25rem' }}>iPlug</span>
      </Link>

      <NotificationsDropdown unreadCount={unreadNotificationsCount} />
    </header>
  );
}

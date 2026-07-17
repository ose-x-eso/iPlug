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

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileBottomNav({ user, unreadCount, onOpenCreate, onOpenMenu }) {
  const pathname = usePathname();

  // If user is not logged in, we shouldn't show the full nav (maybe just Home and Auth)
  // For now, let's just return nothing if no user, since the top bar still has "Get Started"
  if (!user) return null;

  return (
    <div className="mobile-bottom-nav mobile-only">
      <Link href="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}>
        <span className="bottom-nav-icon">🏠</span>
        <span className="bottom-nav-label">Home</span>
      </Link>
      
      <Link href="/my-plugs" className={`bottom-nav-item ${pathname === '/my-plugs' ? 'active' : ''}`}>
        <span className="bottom-nav-icon">📦</span>
        <span className="bottom-nav-label">My Plugs</span>
      </Link>

      {/* Floating Action Button style for creating a plug */}
      <button className="bottom-nav-item create-fab" onClick={onOpenCreate}>
        <div className="fab-icon">➕</div>
      </button>

      <Link href="/inbox" className={`bottom-nav-item ${pathname === '/inbox' || pathname?.startsWith('/messages/') ? 'active' : ''}`} style={{ position: 'relative' }}>
        <span className="bottom-nav-icon">📥</span>
        <span className="bottom-nav-label">Inbox</span>
        {unreadCount > 0 && (
          <span className="bottom-nav-badge">{unreadCount}</span>
        )}
      </Link>

      <button className="bottom-nav-item" onClick={onOpenMenu}>
        <span className="bottom-nav-icon">👤</span>
        <span className="bottom-nav-label">Profile</span>
      </button>
    </div>
  );
}

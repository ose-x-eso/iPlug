'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Package, Plus, Inbox, User, ShieldAlert } from 'lucide-react';

export default function MobileBottomNav({ user, isCivicAuth, unreadCount, onOpenCreate, onOpenBroadcast, onOpenMenu }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleHomeClick = (e) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      router.refresh();
    }
  };

  if (!user) return null;

  return (
    <div className="mobile-bottom-nav mobile-only">
      <Link href="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`} onClick={handleHomeClick}>
        <span className="bottom-nav-icon"><Home size={16} className="inline-icon" /></span>
        <span className="bottom-nav-label">Home</span>
      </Link>
      
      <Link href="/my-plugs" className={`bottom-nav-item ${pathname === '/my-plugs' ? 'active' : ''}`}>
        <span className="bottom-nav-icon"><Package size={16} className="inline-icon" /></span>
        <span className="bottom-nav-label">My Plugs</span>
      </Link>

      {/* Floating Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', margin: '0 -0.5rem' }}>
        {isCivicAuth && (
          <button className="bottom-nav-item create-fab" onClick={onOpenBroadcast} style={{ transform: 'scale(0.8)', background: '#ef4444', border: '2px solid var(--bg-base)' }}>
            <div className="fab-icon" style={{ background: 'transparent' }}><ShieldAlert size={16} className="inline-icon" color="white" /></div>
          </button>
        )}
        <button className="bottom-nav-item create-fab" onClick={onOpenCreate}>
          <div className="fab-icon"><Plus size={16} className="inline-icon" /></div>
        </button>
      </div>

      <Link href="/messages" className={`bottom-nav-item ${pathname === '/messages' || pathname?.startsWith('/messages/') ? 'active' : ''}`} style={{ position: 'relative' }}>
        <span className="bottom-nav-icon"><Inbox size={16} className="inline-icon" /></span>
        <span className="bottom-nav-label">Inbox</span>
        {unreadCount > 0 && (
          <span className="bottom-nav-badge">{unreadCount}</span>
        )}
      </Link>

      <Link href={`/profile/${user.id}`} className={`bottom-nav-item ${pathname?.startsWith('/profile/') ? 'active' : ''}`}>
        <span className="bottom-nav-icon"><User size={16} className="inline-icon" /></span>
        <span className="bottom-nav-label">Profile</span>
      </Link>
    </div>
  );
}

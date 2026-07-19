'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Package, Plus, Inbox, User } from 'lucide-react';

export default function MobileBottomNav({ user, unreadCount, onOpenCreate, onOpenMenu }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleHomeClick = (e) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      router.refresh();
    }
  };

  // If user is not logged in, we shouldn't show the full nav (maybe just Home and Auth)
  // For now, let's just return nothing if no user, since the top bar still has "Get Started"
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

      {/* Floating Action Button style for creating a plug */}
      <button className="bottom-nav-item create-fab" onClick={onOpenCreate}>
        <div className="fab-icon"><Plus size={16} className="inline-icon" /></div>
      </button>

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

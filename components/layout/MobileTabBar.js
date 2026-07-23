'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MessageSquare, User, Plus, LogIn, MapPin, Bell, ShieldAlert } from 'lucide-react';
import './layout.css';

export default function MobileTabBar({ user, isCivicAuth, unreadCount, unreadNotificationsCount, onOpenCreate, onOpenBroadcast, onOpenAuth }) {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    user 
      ? { name: 'Post', href: '#', icon: Plus, isAction: true, onClick: onOpenCreate }
      : { name: 'Login', href: '#', icon: LogIn, isAction: true, onClick: onOpenAuth },
    { name: 'Inbox', href: '/messages', icon: MessageSquare, badge: unreadCount, reqAuth: true },
    { name: 'Profile', href: user ? `/profile/${user.id}` : '#', icon: User, reqAuth: true },
  ];

  return (
    <nav className="mobile-tab-bar glass">
      {navLinks.map((link) => {
        if (link.reqAuth && !user) return null;
        
        const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
        const Icon = link.icon;
        
        if (link.isAction) {
          return (
            <div key="action-btns" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              {isCivicAuth && (
                <button onClick={onOpenBroadcast} className="tab-action-btn" style={{ transform: 'scale(0.8)' }}>
                  <div className="action-circle" style={{ background: '#ef4444' }}>
                    <ShieldAlert size={24} color="#fff" strokeWidth={2.5} />
                  </div>
                </button>
              )}
              <button onClick={link.onClick} className="tab-action-btn">
                <div className="action-circle">
                  <Icon size={24} color="#fff" strokeWidth={2.5} />
                </div>
              </button>
            </div>
          );
        }

        return (
          <Link 
            key={link.name} 
            href={link.href}
            className={`tab-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon-wrap">
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {link.badge > 0 && <span className="nav-badge">{link.badge}</span>}
            </div>
            <span className="tab-label">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

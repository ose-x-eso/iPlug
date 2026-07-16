'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MessageSquare, User, Plus, LogIn, MapPin, Bell } from 'lucide-react';
import './layout.css';

export default function MobileTabBar({ user, unreadCount, unreadNotificationsCount, onOpenCreate, onOpenAuth }) {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Map', href: '/map', icon: MapPin },
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    user 
      ? { name: 'Post', href: '#', icon: Plus, isAction: true, onClick: onOpenCreate }
      : { name: 'Login', href: '#', icon: LogIn, isAction: true, onClick: onOpenAuth },
    { name: 'Inbox', href: '/inbox', icon: MessageSquare, badge: unreadCount, reqAuth: true },
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
            <button key="action-btn" onClick={link.onClick} className="tab-action-btn">
              <div className="action-circle">
                <Icon size={24} color="#fff" strokeWidth={2.5} />
              </div>
            </button>
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

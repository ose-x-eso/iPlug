'use client';

import Link from 'next/link';
import { logout } from '@/app/actions/auth';

export default function ProfileActions() {
  const handleLogout = async () => {
    await logout();
    window.location.href = '/'; // Force a full page reload to clear cache and redirect to home
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
      <Link 
        href="/settings"
        className="btn btn-secondary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
      >
        ⚙️ Settings
      </Link>
      <button 
        onClick={handleLogout}
        className="btn btn-secondary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#ff4d4d', borderColor: '#ff4d4d' }}
      >
        🚪 Logout
      </button>
    </div>
  );
}

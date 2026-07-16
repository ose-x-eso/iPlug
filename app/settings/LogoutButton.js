'use client';

import { logout } from '@/app/actions/auth';

export default function LogoutButton() {
  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <button 
      onClick={handleLogout}
      className="btn btn-secondary"
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        color: '#ff4d4d', 
        borderColor: '#ff4d4d',
        width: '100%',
        justifyContent: 'center',
        padding: '1rem',
        fontSize: '1.1rem'
      }}
    >
      🚪 Logout
    </button>
  );
}

'use client';

import { logout } from '@/app/actions/auth';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <button 
      onClick={handleLogout}
      className="native-btn-danger"
    >
      <LogOut size={16} className="inline-icon" /> Logout
    </button>
  );
}

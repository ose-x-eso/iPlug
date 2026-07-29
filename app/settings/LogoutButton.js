'use client';

import { logout } from '@/app/actions/auth';
import { LogOut } from 'lucide-react';
import posthog from 'posthog-js';

export default function LogoutButton() {
  const handleLogout = async () => {
    posthog.capture('user_logged_out');
    posthog.reset();
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

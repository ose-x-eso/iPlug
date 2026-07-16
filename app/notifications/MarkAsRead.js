'use client';

import { useEffect } from 'react';
import { markNotificationsAsRead } from '@/app/actions/notifications';

export default function MarkAsRead() {
  useEffect(() => {
    markNotificationsAsRead();
  }, []);
  
  return null;
}

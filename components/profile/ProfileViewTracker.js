'use client';

import { useEffect, useRef } from 'react';
import { createNotification } from '@/app/actions/notifications';

export default function ProfileViewTracker({ profileId, viewerId, viewerName }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current || !viewerId || profileId === viewerId) return;
    hasTracked.current = true;

    // Fire and forget
    createNotification(
      profileId,
      'profile_view',
      `${viewerName || 'Someone'} viewed your profile.`
    ).catch(e => console.error(e));
  }, [profileId, viewerId, viewerName]);

  return null;
}

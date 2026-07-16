'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { logReferral } from '@/app/actions/recommendations';

export default function ReferralTracker({ profileId }) {
  const searchParams = useSearchParams();
  const refId = searchParams.get('ref');
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!refId || hasTracked.current || refId === profileId) return;
    
    hasTracked.current = true;
    
    // Call server action to log referral
    logReferral(profileId, refId).catch(console.error);

  }, [refId, profileId]);

  return null;
}

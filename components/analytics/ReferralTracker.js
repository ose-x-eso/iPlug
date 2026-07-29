'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ReferralTracker() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ref = searchParams.get('ref');
      if (ref) {
        // Store referral ID in localStorage for 30 days
        localStorage.setItem('iplug_referred_by', ref);
        
        // Optionally store as a cookie if we need it in Server Actions / SSR later
        document.cookie = `iplug_referred_by=${ref}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      }
    }
  }, [searchParams]);

  return null;
}

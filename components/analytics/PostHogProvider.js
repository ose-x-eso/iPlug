'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export default function PostHogProvider({ children }) {
  useEffect(() => {
    // Only init PostHog in the browser, and only if we have a key
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'identified_only', // Create profiles for identified users
        capture_pageview: false // We will handle pageviews manually in Next.js app router if needed, or rely on auto-capture
      });
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

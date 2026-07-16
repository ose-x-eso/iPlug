import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          if (typeof document === 'undefined') return '';
          const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
          return match ? decodeURIComponent(match[2]) : '';
        },
        set(name, value, options) {
          if (typeof document === 'undefined') return;
          let cookieStr = `${name}=${encodeURIComponent(value)}; path=${options.path || '/'}`;
          if (options.domain) cookieStr += `; domain=${options.domain}`;
          if (options.secure) cookieStr += `; secure`;
          if (options.sameSite) cookieStr += `; samesite=${options.sameSite}`;
          // Deliberately omitting max-age and expires to create a Session Cookie
          document.cookie = cookieStr;
        },
        remove(name, options) {
          if (typeof document === 'undefined') return;
          document.cookie = `${name}=; path=${options.path || '/'}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
      }
    }
  )
}

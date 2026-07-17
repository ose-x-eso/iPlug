import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Strip maxAge and expires so this becomes a session cookie
              const { maxAge, expires, ...sessionOptions } = options;
              cookieStore.set(name, value, sessionOptions)
            })
          } catch (error) {
            // Rethrow Next.js control flow exceptions so we don't crash the server
            if (error && typeof error === 'object') {
              const errMsg = error.message || String(error);
              if (errMsg.includes('NEXT_') || error.digest === 'DYNAMIC_SERVER_USAGE') {
                throw error;
              }
              // If it's a known read-only error from Next.js, we can safely ignore it
              if (errMsg.includes('Cookies can only be modified')) {
                return;
              }
            }
            // For safety against other framework errors, rethrow if we don't recognize it
            throw error;
          }
        },
      },
    }
  )
}

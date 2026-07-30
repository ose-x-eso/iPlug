import { createClient } from '@supabase/supabase-js'

// This client uses the service role key to bypass RLS.
// It should ONLY be used in secure server-side contexts like webhooks or background jobs.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rkmpegyazjazhlyltuzh.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

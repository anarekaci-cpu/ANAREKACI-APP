import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const cle = process.env.SUPABASE_SECRET_KEY!
  return createSupabaseClient(url, cle, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
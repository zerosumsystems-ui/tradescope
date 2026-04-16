import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for use inside Client Components. Not used for auth
 * mutations in this app — magic-link login goes through a Server Action
 * and /auth/callback is a Route Handler — but available if a page ever
 * needs a realtime subscription or browser-side read.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

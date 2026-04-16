import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/session'

/**
 * Next.js 16 Proxy (renamed from middleware). Refreshes the Supabase
 * session cookie on every page request and gates private routes.
 *
 * /api/* is excluded here — API auth is enforced per-route (bearer
 * SYNC_SECRET on POST, Supabase session check on GET where applicable).
 * Excluding /api from the proxy keeps CORS + sync-secret behavior
 * independent of the page-level redirect logic.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match every path EXCEPT:
     * - api routes (handled per-route)
     * - _next/static and _next/image (static assets)
     * - favicon.ico and other root static files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}

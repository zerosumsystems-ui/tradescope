import { createClient } from '@/lib/supabase/server'
import { isAllowed } from '@/lib/auth/allowlist'

/**
 * Gate for Route Handler reads on private endpoints. Accepts either:
 *   1. Valid Supabase session cookie + email on allowlist (normal browser), OR
 *   2. Valid `Authorization: Bearer $SYNC_SECRET` header (Python sync scripts
 *      that need to read, e.g. capture_eod.py fetching /api/scan).
 *
 * Returns a 401 Response on failure, null on success.
 *
 * The proxy already gates page navigation; this is defense-in-depth for
 * direct API hits (curl, another origin, stale tab) and the only gate
 * protecting reads from sync scripts.
 */
export async function requireAuth(request: Request): Promise<Response | null> {
  // Path 1: shared-secret bearer (sync scripts).
  const expectedSecret = process.env.SYNC_SECRET
  const header = request.headers.get('authorization') ?? ''
  const bearerMatch = /^Bearer\s+(.+)$/i.exec(header)
  if (expectedSecret && bearerMatch && bearerMatch[1] === expectedSecret) {
    return null
  }

  // Path 2: Supabase session + allowlist (browser).
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && isAllowed(user.email)) {
    return null
  }

  return Response.json({ error: 'unauthorized' }, { status: 401 })
}

// Backwards-compatible alias so any imports that already say requireSession
// keep working. New code should use requireAuth.
export const requireSession = requireAuth

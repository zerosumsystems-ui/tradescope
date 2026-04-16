/**
 * Shared-secret bearer auth for sync scripts that POST to /api/*.
 * The scanner + site sync scripts send `Authorization: Bearer $SYNC_SECRET`;
 * route handlers call requireSyncSecret() at the top of POST.
 *
 * If SYNC_SECRET is unset in the server env, every write is rejected —
 * fail closed, never fall back to open writes.
 */
export function requireSyncSecret(request: Request): Response | null {
  const expected = process.env.SYNC_SECRET
  if (!expected) {
    return Response.json(
      { error: 'sync auth not configured' },
      { status: 503 }
    )
  }

  const header = request.headers.get('authorization') ?? ''
  const match = /^Bearer\s+(.+)$/i.exec(header)
  if (!match || match[1] !== expected) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  return null
}

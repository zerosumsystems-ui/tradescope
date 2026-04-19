import type { RoutinesPayload } from '@/lib/types'
import { requireSyncSecret } from '@/lib/auth/sync-secret'
import { getSnapshot, setSnapshot } from '@/lib/snapshots'

export const dynamic = 'force-dynamic'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const EMPTY_PAYLOAD: RoutinesPayload = {
  routines: [],
  syncedAt: '',
  hostName: '',
}

export async function GET() {
  const payload = await getSnapshot<RoutinesPayload>('routines', EMPTY_PAYLOAD)
  return Response.json(payload, { headers: CORS_HEADERS })
}

export async function POST(request: Request) {
  const unauth = requireSyncSecret(request)
  if (unauth) return unauth
  try {
    const payload: RoutinesPayload = await request.json()
    await setSnapshot('routines', payload)
    return Response.json(
      { ok: true, count: payload.routines.length },
      { status: 200, headers: CORS_HEADERS },
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ error: message }, { status: 500, headers: CORS_HEADERS })
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

import { readFile, writeFile } from 'fs/promises'
import type { ScanPayload } from '@/lib/types'
import { requireSyncSecret } from '@/lib/auth/sync-secret'
import { requireSession } from '@/lib/auth/require-session'

export const dynamic = 'force-dynamic'

const SCAN_FILE = '/tmp/aiedge-scan-latest.json'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const EMPTY_PAYLOAD: ScanPayload = {
  results: [],
  timestamp: '',
  date: '',
  symbolsScanned: 0,
  passedFilters: 0,
  scanTime: '',
  nextScan: '',
}

// Module-level cache — persists across warm invocations on the same
// serverless instance. Scanner POSTs every 5 min which keeps the
// function warm, so GET from the browser hits the same instance.
let cachedPayload: ScanPayload | null = null

export async function GET(request: Request) {
  const unauth = await requireSession(request)
  if (unauth) return unauth
  // 1. Try in-memory cache first (fastest, works on warm instances)
  if (cachedPayload) {
    return Response.json(cachedPayload, { headers: CORS_HEADERS })
  }
  // 2. Fall back to /tmp file (works within same instance lifecycle)
  try {
    const raw = await readFile(SCAN_FILE, 'utf-8')
    const payload: ScanPayload = JSON.parse(raw)
    cachedPayload = payload // warm the cache
    return Response.json(payload, { headers: CORS_HEADERS })
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code
    if (code === 'ENOENT') {
      return Response.json(EMPTY_PAYLOAD, { headers: CORS_HEADERS })
    }
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ error: message }, { status: 500, headers: CORS_HEADERS })
  }
}

export async function POST(request: Request) {
  const unauth = requireSyncSecret(request)
  if (unauth) return unauth
  try {
    const payload: ScanPayload = await request.json()
    // Write to both in-memory cache and file
    cachedPayload = payload
    await writeFile(SCAN_FILE, JSON.stringify(payload), 'utf-8')
    return Response.json({ ok: true }, { status: 200, headers: CORS_HEADERS })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ error: message }, { status: 500, headers: CORS_HEADERS })
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

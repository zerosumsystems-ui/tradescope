import { readFile, writeFile } from 'fs/promises'
import type { ScanPayload } from '@/lib/types'

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

export async function GET() {
  try {
    const raw = await readFile(SCAN_FILE, 'utf-8')
    const payload: ScanPayload = JSON.parse(raw)
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
  try {
    const payload: ScanPayload = await request.json()
    await writeFile(SCAN_FILE, JSON.stringify(payload), 'utf-8')
    return Response.json({ ok: true }, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

import { readFile, writeFile } from 'fs/promises'
import type { VaultPayload } from '@/lib/types'

export const dynamic = 'force-dynamic'

const VAULT_FILE = '/tmp/aiedge-vault-latest.json'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const EMPTY_PAYLOAD: VaultPayload = {
  notes: [],
  syncedAt: '',
  noteCount: 0,
}

let cachedPayload: VaultPayload | null = null

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  const payload = await getPayload()

  if (slug) {
    const note = payload.notes.find((n) => n.slug === slug)
    if (!note) {
      return Response.json({ error: 'Note not found' }, { status: 404, headers: CORS_HEADERS })
    }
    return Response.json(note, { headers: CORS_HEADERS })
  }

  return Response.json(payload, { headers: CORS_HEADERS })
}

export async function POST(request: Request) {
  try {
    const payload: VaultPayload = await request.json()
    cachedPayload = payload
    await writeFile(VAULT_FILE, JSON.stringify(payload), 'utf-8')
    return Response.json({ ok: true, noteCount: payload.noteCount }, { status: 200, headers: CORS_HEADERS })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ error: message }, { status: 500, headers: CORS_HEADERS })
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

async function getPayload(): Promise<VaultPayload> {
  if (cachedPayload) return cachedPayload
  try {
    const raw = await readFile(VAULT_FILE, 'utf-8')
    const payload: VaultPayload = JSON.parse(raw)
    cachedPayload = payload
    return payload
  } catch {
    return EMPTY_PAYLOAD
  }
}

/**
 * Email allowlist. Phase 5 gate — no public signup; only these addresses
 * can sign in via magic link. Comma-separated in ALLOWED_EMAILS env var.
 *
 * Case-insensitive, whitespace-tolerant. Empty / missing env var means
 * NO ONE is allowed (deny by default — safer than allow by default).
 */
function parseAllowlist(): string[] {
  const raw = process.env.ALLOWED_EMAILS ?? ''
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export function isAllowed(email: string | null | undefined): boolean {
  if (!email) return false
  const normalized = email.trim().toLowerCase()
  return parseAllowlist().includes(normalized)
}

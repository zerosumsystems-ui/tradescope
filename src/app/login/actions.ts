'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAllowed } from '@/lib/auth/allowlist'

type LoginState = { error?: string; sent?: boolean; email?: string }

/**
 * Server Action invoked by the /login form. Allowlist is checked up-front
 * so we don't leak magic-link emails to uninvited addresses. On success,
 * Supabase sends the link; user clicks → /auth/callback finishes login.
 */
export async function sendMagicLink(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const rawEmail = String(formData.get('email') ?? '').trim()
  const next = String(formData.get('next') ?? '/') || '/'

  if (!rawEmail) {
    return { error: 'Enter an email address.' }
  }

  if (!isAllowed(rawEmail)) {
    return {
      error: 'This email isn\u2019t on the invite list.',
      email: rawEmail,
    }
  }

  const hdrs = await headers()
  // x-forwarded-* headers set by Vercel; fall back to host for local dev.
  const proto = hdrs.get('x-forwarded-proto') ?? 'http'
  const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host')
  const origin = `${proto}://${host}`

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: rawEmail,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error) {
    return { error: error.message, email: rawEmail }
  }

  return { sent: true, email: rawEmail }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

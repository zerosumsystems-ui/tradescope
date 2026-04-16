'use server'

import { createClient } from '@/lib/supabase/server'

export type AccountState = {
  error?: string
  success?: string
}

/**
 * Update (or initially set) the password on the current user. Supabase's
 * updateUser({ password }) works the same whether this is the first
 * password ever on the account (magic-link-only user) or a rotation.
 *
 * The route itself is proxy-gated, so only a signed-in + allowlisted user
 * reaches this action; a second getUser() check here is belt + suspenders.
 */
export async function updatePassword(
  _prev: AccountState,
  formData: FormData
): Promise<AccountState> {
  const pw = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')

  if (pw.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  if (pw !== confirm) {
    return { error: 'Passwords don\u2019t match.' }
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return { error: 'You\u2019re not signed in.' }
  }

  const { error } = await supabase.auth.updateUser({ password: pw })
  if (error) return { error: error.message }

  return { success: 'Password updated. Use \u201cPassword\u201d on the sign-in page next time.' }
}

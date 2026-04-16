'use client'

import { useActionState } from 'react'
import { sendMagicLink } from './actions'

type Props = { next: string; initialError: string | null }

export function LoginForm({ next, initialError }: Props) {
  const [state, formAction, pending] = useActionState(sendMagicLink, {
    error: initialError ?? undefined,
  })

  if (state.sent) {
    return (
      <div className="text-center">
        <div className="w-10 h-10 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto mb-4 text-lg">
          ✓
        </div>
        <div className="text-sm font-medium mb-1">Check your email</div>
        <div className="text-xs text-sub">
          We sent a sign-in link to <span className="text-text">{state.email}</span>.
        </div>
        <div className="text-xs text-sub mt-4">
          The link opens this site signed in. You can close this tab.
        </div>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label htmlFor="email" className="text-xs text-sub">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        autoFocus
        defaultValue={state.email ?? ''}
        placeholder="you@example.com"
        className="bg-bg border border-border rounded-[var(--radius)] px-3 py-2 text-sm text-text focus:outline-none focus:border-teal/60"
      />
      <input type="hidden" name="next" value={next} />

      {state.error && (
        <div className="text-xs text-red">{state.error}</div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 bg-teal text-bg font-medium text-sm py-2 rounded-[var(--radius)] hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Sending…' : 'Send magic link'}
      </button>
    </form>
  )
}

'use client'

import { useActionState } from 'react'
import { updatePassword, type AccountState } from './actions'

export function PasswordForm() {
  const [state, action, pending] = useActionState<AccountState, FormData>(
    updatePassword,
    {}
  )

  return (
    <form action={action} className="flex flex-col gap-3 max-w-sm" key={state.success ? 'reset' : 'active'}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs text-sub">New password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="bg-bg border border-border rounded-[var(--radius)] px-3 py-2 text-sm text-text focus:outline-none focus:border-teal/60"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm" className="text-xs text-sub">Confirm password</label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="bg-bg border border-border rounded-[var(--radius)] px-3 py-2 text-sm text-text focus:outline-none focus:border-teal/60"
        />
      </div>

      {state.error && <div className="text-xs text-red">{state.error}</div>}
      {state.success && <div className="text-xs text-teal">{state.success}</div>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 self-start bg-teal text-bg font-medium text-sm px-4 py-2 rounded-[var(--radius)] hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Saving\u2026' : 'Save password'}
      </button>
    </form>
  )
}

'use client'

import { useActionState, useState } from 'react'
import { sendMagicLink, signInWithPassword, type LoginState } from './actions'

type Props = { next: string; initialError: string | null }

type Mode = 'magic' | 'password'

export function LoginForm({ next, initialError }: Props) {
  const [mode, setMode] = useState<Mode>('magic')

  // Separate action states per mode so errors/values don't bleed across.
  const [magicState, magicAction, magicPending] = useActionState<LoginState, FormData>(
    sendMagicLink,
    { error: mode === 'magic' ? initialError ?? undefined : undefined }
  )
  const [pwState, pwAction, pwPending] = useActionState<LoginState, FormData>(
    signInWithPassword,
    { error: mode === 'password' ? initialError ?? undefined : undefined }
  )

  const state = mode === 'magic' ? magicState : pwState

  if (mode === 'magic' && magicState.sent) {
    const isSetup = magicState.intent === 'setup'
    return (
      <div className="text-center">
        <div className="w-10 h-10 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto mb-4 text-lg">
          ✓
        </div>
        <div className="text-sm font-medium mb-1">Check your email</div>
        <div className="text-xs text-sub">
          We sent a sign-in link to <span className="text-text">{magicState.email}</span>.
        </div>
        <div className="text-xs text-sub mt-4">
          {isSetup
            ? 'After signing in, you\u2019ll land on your Account page to set a password.'
            : 'The link opens this site signed in. You can close this tab.'}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ModeToggle mode={mode} setMode={setMode} />

      {mode === 'magic' ? (
        <form action={magicAction} className="flex flex-col gap-3">
          <Field id="email" label="Email" type="email" autoComplete="email"
            defaultValue={magicState.email ?? ''} placeholder="you@example.com" autoFocus />
          <input type="hidden" name="next" value={next} />
          {state.error && <div className="text-xs text-red">{state.error}</div>}
          <button
            type="submit"
            name="intent"
            value="signin"
            disabled={magicPending}
            className="mt-2 bg-teal text-bg font-medium text-sm py-2 rounded-[var(--radius)] hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {magicPending ? 'Sending…' : 'Send magic link'}
          </button>
          <button
            type="submit"
            name="intent"
            value="setup"
            disabled={magicPending}
            className="text-xs text-sub hover:text-text py-1 disabled:opacity-50"
          >
            Set up a password for faster sign-in →
          </button>
        </form>
      ) : (
        <form action={pwAction} className="flex flex-col gap-3">
          <Field id="email" label="Email" type="email" autoComplete="username"
            defaultValue={pwState.email ?? ''} placeholder="you@example.com" autoFocus />
          <Field id="password" label="Password" type="password" autoComplete="current-password"
            placeholder="••••••••" />
          <input type="hidden" name="next" value={next} />
          {state.error && <div className="text-xs text-red">{state.error}</div>}
          <Submit pending={pwPending} label="Sign in" pendingLabel="Signing in…" />
        </form>
      )}
    </div>
  )
}

function ModeToggle({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div className="flex gap-0.5 bg-bg border border-border rounded-[var(--radius)] p-0.5 text-xs">
      <ToggleButton active={mode === 'magic'} onClick={() => setMode('magic')}>
        Magic link
      </ToggleButton>
      <ToggleButton active={mode === 'password'} onClick={() => setMode('password')}>
        Password
      </ToggleButton>
    </div>
  )
}

function ToggleButton({ active, onClick, children }: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-1.5 rounded-[calc(var(--radius)-2px)] transition-colors ${
        active
          ? 'bg-surface text-text'
          : 'text-sub hover:text-text'
      }`}
    >
      {children}
    </button>
  )
}

function Field({
  id, label, type, autoComplete, defaultValue, placeholder, autoFocus,
}: {
  id: string
  label: string
  type: string
  autoComplete: string
  defaultValue?: string
  placeholder?: string
  autoFocus?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs text-sub">{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        required
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="bg-bg border border-border rounded-[var(--radius)] px-3 py-2 text-sm text-text focus:outline-none focus:border-teal/60"
      />
    </div>
  )
}

function Submit({ pending, label, pendingLabel }: {
  pending: boolean
  label: string
  pendingLabel: string
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 bg-teal text-bg font-medium text-sm py-2 rounded-[var(--radius)] hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface NavItem {
  href: string
  label: string
}

interface MobileNavDrawerProps {
  items: NavItem[]
  userEmail: string | null
  open: boolean
  onClose: () => void
}

/**
 * Right-side sliding drawer for mobile navigation. Replaces the horizontal
 * scroll-nav on small screens — 9+ routes don't fit on an iPhone width
 * without hiding things behind a swipe.
 *
 * Behavior:
 * - Slides in from the right, dark backdrop fades in behind.
 * - Closes on: backdrop click, route change (usePathname effect), Escape key.
 * - Locks body scroll while open.
 */
export function MobileNavDrawer({ items, userEmail, open, onClose }: MobileNavDrawerProps) {
  const pathname = usePathname()

  // Close on route change.
  useEffect(() => {
    if (open) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Escape key closes.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel */}
      <aside
        aria-hidden={!open}
        aria-label="Navigation"
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[80vw] bg-surface border-l border-border shadow-2xl transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          paddingTop: 'max(env(safe-area-inset-top), 12px)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-bold text-teal tracking-tight">AI Edge</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="w-8 h-8 flex items-center justify-center rounded text-sub hover:text-text hover:bg-bg"
          >
            {/* X icon — pure SVG, no dep */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 3L13 13M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <ul className="px-2 py-2 space-y-0.5 overflow-y-auto" style={{ maxHeight: 'calc(100% - 160px)' }}>
          {items.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-3 py-3 rounded text-sm font-medium transition-colors ${
                    active
                      ? 'bg-teal/10 text-teal'
                      : 'text-sub hover:text-text hover:bg-bg'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="absolute left-0 right-0 bottom-0 border-t border-border px-4 py-3 bg-surface" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
          {userEmail ? (
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/account"
                className="text-xs text-sub hover:text-text truncate px-2 py-1.5 rounded hover:bg-bg flex-1"
                title={userEmail}
              >
                {userEmail}
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-xs text-sub hover:text-text px-2 py-1.5 rounded hover:bg-bg"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="block text-center text-xs text-sub hover:text-text px-2 py-2 rounded hover:bg-bg"
            >
              Sign in
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}

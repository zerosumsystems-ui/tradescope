'use client'

import { useState } from 'react'
import type { AuditHistoryEntry } from '@/lib/types'

interface AuditHistoryDrawerProps {
  history: AuditHistoryEntry[]
  activeDir: string
}

export function AuditHistoryDrawer({ history, activeDir }: AuditHistoryDrawerProps) {
  const [open, setOpen] = useState(false)
  const active = history.find((h) => h.auditDir === activeDir)
  const count = history.length

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2 text-xs">
          <span className={`text-sub transition-transform ${open ? 'rotate-90' : ''}`}>
            ▸
          </span>
          <span className="text-text font-medium">
            {count} audit{count !== 1 ? 's' : ''}
          </span>
          {active && (
            <span className="text-sub">
              · Latest: {active.auditDate} {active.auditTime}
            </span>
          )}
        </div>
        <span className="text-[10px] text-sub uppercase tracking-wider">
          {open ? 'Hide' : 'View history'}
        </span>
      </button>
      {open && (
        <div className="border-t border-border divide-y divide-border/50 animate-[fadeIn_0.15s_ease]">
          {history.map((h) => {
            const isActive = h.auditDir === activeDir
            return (
              <div
                key={h.auditDir}
                className={`flex items-center justify-between px-3 py-2 text-xs ${
                  isActive ? 'bg-teal/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-medium ${isActive ? 'text-teal' : 'text-text'}`}
                  >
                    {h.auditDate}
                  </span>
                  <span className="text-sub">{h.auditTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sub">
                  <span className="tabular-nums">{h.symbolCount} symbols</span>
                  {isActive && (
                    <span className="text-[10px] uppercase tracking-wider text-teal">
                      Active
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

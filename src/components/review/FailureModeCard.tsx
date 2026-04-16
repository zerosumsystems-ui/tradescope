'use client'

import type { AuditFailureMode } from '@/lib/types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function FailureModeCard({ mode }: { mode: AuditFailureMode }) {
  return (
    <details className="bg-bg border border-border rounded-lg overflow-hidden hover:border-border-hover transition-colors">
      <summary className="list-none cursor-pointer p-3 select-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-start gap-3">
          <span className="text-red/80 text-xs mt-0.5 shrink-0">▸</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-text mb-1">{mode.title}</div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
              {mode.fileCitation && (
                <code className="text-teal/80 font-mono bg-teal/5 px-1.5 py-0.5 rounded">
                  {mode.fileCitation}
                </code>
              )}
              {mode.affectedTickers.length > 0 && (
                <span className="text-sub">
                  <span className="text-text/80">{mode.affectedTickers.length}</span>{' '}
                  affected
                </span>
              )}
            </div>
          </div>
        </div>
      </summary>
      <div className="border-t border-border p-3 space-y-3 animate-[fadeIn_0.15s_ease]">
        {mode.affectedTickers.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-sub font-semibold mb-1.5">
              Affected tickers
            </div>
            <div className="flex flex-wrap gap-1">
              {mode.affectedTickers.map((t) => (
                <span
                  key={t}
                  className="text-[11px] font-semibold text-text bg-surface border border-border rounded px-1.5 py-0.5"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-sub font-semibold mb-1.5">
            What went wrong
          </div>
          <div className="text-xs text-text/85 leading-relaxed prose-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2">{children}</p>,
                strong: ({ children }) => (
                  <strong className="font-semibold text-text">{children}</strong>
                ),
                code: ({ children }) => (
                  <code className="bg-surface rounded px-1 py-0.5 text-[11px] font-mono text-teal/80">
                    {children}
                  </code>
                ),
                a: ({ children }) => <span className="text-teal/80">{children}</span>,
              }}
            >
              {mode.description}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </details>
  )
}

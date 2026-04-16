'use client'

import { useState } from 'react'
import type {
  AuditSymbolRow,
  TradeDecision,
  AgreementLevel,
  DivergenceClass,
} from '@/lib/types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { LightweightChart } from '@/components/charts/LightweightChart'

const DECISION_STYLES: Record<TradeDecision, string> = {
  BUY: 'bg-teal/[.18] text-teal border-teal/35',
  SELL: 'bg-red/[.18] text-red border-red/35',
  WAIT: 'bg-yellow/[.15] text-yellow border-yellow/30',
  AVOID: 'bg-gray/25 text-sub border-gray/45',
}

const AGREEMENT_STYLES: Record<AgreementLevel, string> = {
  AGREE: 'bg-teal/[.18] text-teal border-teal/35',
  PARTIAL: 'bg-orange/[.13] text-orange border-orange/[.28]',
  MINOR: 'bg-yellow/[.15] text-yellow border-yellow/30',
  MAJOR: 'bg-red/[.15] text-red border-red/30',
  DISAGREE: 'bg-red/[.18] text-red border-red/35',
  INVERTED: 'bg-red/[.25] text-red border-red/45',
}

const DIVERGENCE_STYLES: Record<DivergenceClass, string> = {
  AGREE: 'text-teal',
  MINOR: 'text-yellow',
  MAJOR: 'text-orange',
  INVERTED: 'text-red',
}

type SortKey =
  | 'rankScanner'
  | 'rankBrooks'
  | 'rankDelta'
  | 'urgScanner'
  | 'brooksQualityScore'
  | 'divergenceClass'

export function SymbolTable({ rows }: { rows: AuditSymbolRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('rankScanner')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'rankScanner' || key === 'rankBrooks' ? 'asc' : 'desc')
    }
  }

  const sorted = [...rows].sort((a, b) => {
    let av: number | string = a[sortKey]
    let bv: number | string = b[sortKey]
    // For divergenceClass, sort by severity
    if (sortKey === 'divergenceClass') {
      const order: DivergenceClass[] = ['AGREE', 'MINOR', 'MAJOR', 'INVERTED']
      av = order.indexOf(a.divergenceClass)
      bv = order.indexOf(b.divergenceClass)
    }
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'asc' ? av - bv : bv - av
    }
    const cmp = String(av).localeCompare(String(bv))
    return sortDir === 'asc' ? cmp : -cmp
  })

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full text-xs min-w-[720px]">
        <thead>
          <tr className="border-b border-border text-sub text-[10px] uppercase tracking-wider">
            <HeaderCell
              label="Scn#"
              sortKey="rankScanner"
              current={sortKey}
              dir={sortDir}
              onClick={toggleSort}
              align="right"
            />
            <HeaderCell
              label="Brk#"
              sortKey="rankBrooks"
              current={sortKey}
              dir={sortDir}
              onClick={toggleSort}
              align="right"
            />
            <HeaderCell
              label="Δ"
              sortKey="rankDelta"
              current={sortKey}
              dir={sortDir}
              onClick={toggleSort}
              align="right"
            />
            <th className="text-left py-1.5 px-2">Ticker</th>
            <HeaderCell
              label="URG"
              sortKey="urgScanner"
              current={sortKey}
              dir={sortDir}
              onClick={toggleSort}
              align="right"
            />
            <HeaderCell
              label="Q"
              sortKey="brooksQualityScore"
              current={sortKey}
              dir={sortDir}
              onClick={toggleSort}
              align="right"
            />
            <th className="text-left py-1.5 px-2">Signal</th>
            <th className="text-left py-1.5 px-2">Brooks</th>
            <th className="text-left py-1.5 px-2">Agree</th>
            <HeaderCell
              label="Diverge"
              sortKey="divergenceClass"
              current={sortKey}
              dir={sortDir}
              onClick={toggleSort}
              align="left"
            />
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <SymbolRow key={r.ticker} row={r} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function HeaderCell({
  label,
  sortKey,
  current,
  dir,
  onClick,
  align,
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  dir: 'asc' | 'desc'
  onClick: (k: SortKey) => void
  align: 'left' | 'right'
}) {
  const active = current === sortKey
  const arrow = active ? (dir === 'asc' ? '↑' : '↓') : ''
  return (
    <th
      onClick={() => onClick(sortKey)}
      className={`py-1.5 px-2 cursor-pointer select-none hover:text-text ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${active ? 'text-teal' : ''}`}
    >
      {label} {arrow}
    </th>
  )
}

function SymbolRow({ row }: { row: AuditSymbolRow }) {
  const [open, setOpen] = useState(false)
  const deltaColor =
    row.rankDelta > 0 ? 'text-teal' : row.rankDelta < 0 ? 'text-red' : 'text-sub'

  return (
    <>
      <tr
        onClick={() => setOpen((o) => !o)}
        className="border-b border-border/30 cursor-pointer hover:bg-surface-hover"
      >
        <td className="py-1.5 px-2 text-right tabular-nums text-text">
          {row.rankScanner}
        </td>
        <td className="py-1.5 px-2 text-right tabular-nums text-text">
          {row.rankBrooks}
        </td>
        <td className={`py-1.5 px-2 text-right tabular-nums ${deltaColor}`}>
          {row.rankDelta > 0 ? `+${row.rankDelta}` : row.rankDelta}
        </td>
        <td className="py-1.5 px-2 font-bold text-text">{row.ticker}</td>
        <td className="py-1.5 px-2 text-right tabular-nums text-text">
          {row.urgScanner.toFixed(1)}
        </td>
        <td className="py-1.5 px-2 text-right tabular-nums text-text">
          {row.brooksQualityScore.toFixed(1)}
        </td>
        <td className="py-1.5 px-2 text-sub">{row.signalScanner}</td>
        <td className="py-1.5 px-2">
          <span
            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${DECISION_STYLES[row.decisionBrooks]}`}
          >
            {row.decisionBrooks}
          </span>
        </td>
        <td className="py-1.5 px-2">
          <span
            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${AGREEMENT_STYLES[row.agreementVsScanner]}`}
          >
            {row.agreementVsScanner}
          </span>
        </td>
        <td
          className={`py-1.5 px-2 text-[10px] font-semibold ${DIVERGENCE_STYLES[row.divergenceClass]}`}
        >
          {row.divergenceClass}
        </td>
      </tr>
      {open && (
        <tr className="bg-bg/60">
          <td colSpan={10} className="px-4 py-3 animate-[fadeIn_0.15s_ease]">
            <div className="space-y-3">
              {row.agreementReason && (
                <div className="bg-surface rounded-lg p-3">
                  <div className="text-[10px] uppercase tracking-wider text-sub font-semibold mb-1">
                    Why they disagree
                  </div>
                  <p className="text-xs text-text/85 leading-relaxed">
                    {row.agreementReason}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {row.chart && row.chart.bars && row.chart.bars.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-sub font-semibold mb-1.5">
                      Annotated chart
                    </div>
                    <LightweightChart chart={row.chart} height={380} />
                  </div>
                )}
                {row.readMarkdown && (
                  <div className="max-h-[420px] overflow-y-auto">
                    <div className="text-[10px] uppercase tracking-wider text-sub font-semibold mb-1.5">
                      Brooks read
                    </div>
                    <div className="prose-sm">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-sm font-bold text-text mb-2">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xs font-semibold text-text mt-3 mb-1 uppercase tracking-wide">
                              {children}
                            </h2>
                          ),
                          p: ({ children }) => (
                            <p className="text-xs text-text/85 leading-relaxed mb-2">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-text">
                              {children}
                            </strong>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-4 mb-2 space-y-0.5 text-xs text-text/85">
                              {children}
                            </ul>
                          ),
                          li: ({ children }) => (
                            <li className="text-xs text-text/85">{children}</li>
                          ),
                          code: ({ children }) => (
                            <code className="bg-surface rounded px-1 py-0.5 text-[11px] font-mono text-teal/80">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {row.readMarkdown}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

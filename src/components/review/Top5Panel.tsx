'use client'

import type {
  AuditTop5BrooksRow,
  AuditTop5ScannerRow,
  TradeDecision,
  AgreementLevel,
} from '@/lib/types'

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

function DecisionBadge({ decision }: { decision: TradeDecision }) {
  return (
    <span
      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide border ${DECISION_STYLES[decision]}`}
    >
      {decision}
    </span>
  )
}

function AgreementBadge({ agreement }: { agreement: AgreementLevel }) {
  return (
    <span
      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide border ${AGREEMENT_STYLES[agreement]}`}
    >
      {agreement}
    </span>
  )
}

export function BrooksTop5({ rows }: { rows: AuditTop5BrooksRow[] }) {
  if (rows.length === 0)
    return <p className="text-sub text-xs">No Brooks picks available.</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-sub text-[10px] uppercase tracking-wider">
            <th className="text-left py-1.5 pr-2">#</th>
            <th className="text-left py-1.5 pr-2">Ticker</th>
            <th className="text-right py-1.5 pr-2">Scanner</th>
            <th className="text-left py-1.5 pr-2">Decision</th>
            <th className="text-right py-1.5 pr-2">p</th>
            <th className="text-right py-1.5">R:R</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.ticker} className="border-b border-border/30">
              <td className="py-1.5 pr-2 text-sub tabular-nums">{i + 1}</td>
              <td className="py-1.5 pr-2 font-bold text-text">{r.ticker}</td>
              <td className="py-1.5 pr-2 text-right text-sub tabular-nums">
                #{r.rankScanner}
                <span className="text-[10px] ml-1">{r.signalScanner}</span>
              </td>
              <td className="py-1.5 pr-2">
                <DecisionBadge decision={r.decisionBrooks} />
              </td>
              <td className="py-1.5 pr-2 text-right text-text tabular-nums">
                {r.probability}%
              </td>
              <td className="py-1.5 text-right text-text tabular-nums">
                {r.rr.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ScannerTop5({ rows }: { rows: AuditTop5ScannerRow[] }) {
  if (rows.length === 0)
    return <p className="text-sub text-xs">No scanner picks available.</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-sub text-[10px] uppercase tracking-wider">
            <th className="text-left py-1.5 pr-2">Ticker</th>
            <th className="text-right py-1.5 pr-2">URG</th>
            <th className="text-left py-1.5 pr-2">Signal</th>
            <th className="text-left py-1.5 pr-2">Brooks</th>
            <th className="text-right py-1.5 pr-2">Q</th>
            <th className="text-left py-1.5">Agree</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.ticker} className="border-b border-border/30">
              <td className="py-1.5 pr-2 font-bold text-text">{r.ticker}</td>
              <td className="py-1.5 pr-2 text-right text-text tabular-nums">
                {r.urgScanner.toFixed(1)}
              </td>
              <td className="py-1.5 pr-2 text-sub">{r.signalScanner}</td>
              <td className="py-1.5 pr-2">
                <DecisionBadge decision={r.decisionBrooks} />
              </td>
              <td className="py-1.5 pr-2 text-right text-text tabular-nums">
                {r.brooksQualityScore.toFixed(1)}
              </td>
              <td className="py-1.5">
                <AgreementBadge agreement={r.agreement} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

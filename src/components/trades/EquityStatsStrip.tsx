'use client'

import type { TradeRead } from '@/lib/types'
import { computeEquityStats } from '@/lib/stats'

/**
 * Top-of-page equity stats strip. Six numbers summarizing the whole trade
 * catalog. All figures expressed in R units — see `lib/stats.ts` for the
 * outcome → R convention.
 */
export function EquityStatsStrip({ trades }: { trades: TradeRead[] }) {
  const s = computeEquityStats(trades)

  if (s.completedCount === 0) return null

  const totalColor = s.totalPnL > 0 ? 'text-teal' : s.totalPnL < 0 ? 'text-red' : 'text-text'
  const expColor = s.expectancy > 0 ? 'text-teal' : s.expectancy < 0 ? 'text-red' : 'text-text'

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
      <StatBox
        label="Total PnL"
        value={formatR(s.totalPnL)}
        sub="R"
        valueClass={totalColor}
      />
      <StatBox
        label="Win Rate"
        value={`${(s.winRate * 100).toFixed(0)}%`}
        sub={`n=${s.completedCount}`}
      />
      <StatBox label="Sharpe" value={s.sharpe.toFixed(2)} />
      <StatBox label="Sortino" value={s.sortino.toFixed(2)} />
      <StatBox
        label="Max DD"
        value={`-${s.maxDrawdown.toFixed(2)}`}
        sub="R"
        valueClass={s.maxDrawdown > 0 ? 'text-red' : 'text-text'}
      />
      <StatBox
        label="Expectancy"
        value={formatR(s.expectancy)}
        sub="R/trade"
        valueClass={expColor}
      />
    </div>
  )
}

function formatR(x: number): string {
  const sign = x > 0 ? '+' : ''
  return `${sign}${x.toFixed(2)}`
}

function StatBox({
  label,
  value,
  sub,
  valueClass,
}: {
  label: string
  value: string
  sub?: string
  valueClass?: string
}) {
  return (
    <div className="bg-surface border border-border rounded-lg p-2.5">
      <div className="text-[9px] uppercase tracking-wider text-sub mb-1 font-semibold">
        {label}
      </div>
      <div className={`text-sm font-bold tabular-nums ${valueClass ?? 'text-text'}`}>
        {value}
        {sub && <span className="text-[10px] text-sub font-normal ml-0.5">{sub}</span>}
      </div>
    </div>
  )
}

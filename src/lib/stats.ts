/**
 * Equity statistics for trade catalogs.
 *
 * Source data model: `TradeRead` has no explicit per-trade PnL field, but it
 * carries `rrBrooks` (planned R:R) and `outcome` (win / loss / scratch / …).
 * We synthesize per-trade R using the convention:
 *   win      -> +rrBrooks  (target hit, gained planned R)
 *   loss     -> -1         (stop hit, lost 1R — the standard Brooks unit)
 *   scratch  -> 0
 *   pending  -> excluded   (no outcome yet)
 *   no_trade -> excluded   (we deferred, nothing to evaluate)
 *
 * Stats are computed in R units. PnL is expressed as "net R" and expectancy
 * as "R per completed trade" so figures stay scale-free and meaningful even
 * though the underlying trades are paper reads with no dollar sizing.
 */

import type { TradeRead } from './types'

export interface EquityStats {
  completedCount: number       // trades with a realized outcome (win/loss/scratch)
  totalPnL: number             // sum of per-trade R
  winRate: number              // 0..1 (scratches excluded from the denominator)
  sharpe: number               // mean / std of per-trade R
  sortino: number              // mean / downside std of per-trade R
  maxDrawdown: number          // max peak-to-trough decline of cumulative R (positive number, in R)
  expectancy: number           // mean R per completed trade
}

/** Per-trade R, or null if the outcome is not yet realized. */
function tradeR(trade: TradeRead): number | null {
  switch (trade.outcome) {
    case 'win':
      return trade.rrBrooks
    case 'loss':
      return -1
    case 'scratch':
      return 0
    default:
      return null
  }
}

function mean(xs: number[]): number {
  if (xs.length === 0) return 0
  return xs.reduce((s, x) => s + x, 0) / xs.length
}

function stdev(xs: number[]): number {
  if (xs.length < 2) return 0
  const mu = mean(xs)
  const variance = xs.reduce((s, x) => s + (x - mu) ** 2, 0) / (xs.length - 1)
  return Math.sqrt(variance)
}

/** Downside std: RMS of negative deviations from zero (a common Sortino flavor). */
function downsideStdev(xs: number[]): number {
  if (xs.length === 0) return 0
  const negSquares = xs.filter((x) => x < 0).map((x) => x * x)
  if (negSquares.length === 0) return 0
  return Math.sqrt(negSquares.reduce((s, x) => s + x, 0) / xs.length)
}

function maxDrawdown(xs: number[]): number {
  let peak = 0
  let cum = 0
  let maxDD = 0
  for (const x of xs) {
    cum += x
    if (cum > peak) peak = cum
    const dd = peak - cum
    if (dd > maxDD) maxDD = dd
  }
  return maxDD
}

export function computeEquityStats(trades: TradeRead[]): EquityStats {
  // Chronological order so drawdown reflects equity-curve evolution.
  const ordered = [...trades].sort((a, b) => {
    const cmp = a.date.localeCompare(b.date)
    if (cmp !== 0) return cmp
    return a.time.localeCompare(b.time)
  })

  const rs: number[] = []
  for (const t of ordered) {
    const r = tradeR(t)
    if (r !== null) rs.push(r)
  }

  if (rs.length === 0) {
    return {
      completedCount: 0,
      totalPnL: 0,
      winRate: 0,
      sharpe: 0,
      sortino: 0,
      maxDrawdown: 0,
      expectancy: 0,
    }
  }

  const wins = rs.filter((r) => r > 0).length
  const losses = rs.filter((r) => r < 0).length
  const decisive = wins + losses

  const mu = mean(rs)
  const sd = stdev(rs)
  const dsd = downsideStdev(rs)

  return {
    completedCount: rs.length,
    totalPnL: rs.reduce((s, x) => s + x, 0),
    winRate: decisive > 0 ? wins / decisive : 0,
    sharpe: sd > 0 ? mu / sd : 0,
    sortino: dsd > 0 ? mu / dsd : 0,
    maxDrawdown: maxDrawdown(rs),
    expectancy: mu,
  }
}

/**
 * Fill ↔ pre-trade-read pairing + per-setup aggregation.
 *
 * Called from /api/snaptrade/sync after fills are fetched from SnapTrade.
 * The sync route stores the paired array and the per-setup stats in the
 * `filled_trades` snapshot so `/journal` just renders — no pairing work
 * runs on page load.
 *
 * Pairing rule (MVP — simple, fast, good enough for one-read-per-ticker):
 *   1. Match fill ↔ read on `ticker` (case-insensitive) AND `date` (exact YYYY-MM-DD)
 *   2. If multiple candidate reads exist for that ticker/day, pick the one
 *      with the highest `qualityScore` (Brooks's 0–10 confidence)
 *   3. If no candidate: orphan fill (pairedReadId = null)
 *
 * R-multiple when paired — computed from the actual fill price against the
 * read's planned stop/target, scaled by the read's planned R:R:
 *   BUY:  rMultiple = (fill.price − stopPrice) / (targetPrice − stopPrice) × rrBrooks
 *   SELL: mirror (reversed arithmetic)
 * When the read has no stop/target (AVOID, scanner-only reads) rMultiple stays
 * null — we can't derive R without a reference frame.
 *
 * Per-setup stats are computed by grouping paired fills' backing reads by
 * `setupBrooks` and running `computeEquityStats` on each group — reusing the
 * exact same R derivation the `/trades` catalog already uses.
 */

import type { EquityStats } from './stats'
import { computeEquityStats } from './stats'
import type { FilledTrade, PairedTrade, TradeRead } from './types'

/** Normalize ticker for matching: strip whitespace, uppercase, drop .US-style exchange suffix. */
function canonTicker(s: string): string {
  return s.trim().toUpperCase().replace(/\.(US|NYSE|NASDAQ|CBOE|ARCA|BATS)$/i, '')
}

function computeRMultiple(fill: FilledTrade, read: TradeRead): number | null {
  if (read.stopPrice == null || read.targetPrice == null) return null
  const range = read.targetPrice - read.stopPrice
  if (range === 0) return null

  // rrBrooks is the read's planned R:R; we rescale by where the fill
  // actually landed in the [stop, target] range.
  if (fill.action === 'BUY') {
    return ((fill.price - read.stopPrice) / range) * read.rrBrooks
  }
  // SELL: if the read was also a SELL decision, the arithmetic mirrors.
  // If the read was a BUY and the fill is the exit SELL, the same mirror
  // gives a sane "how far toward target did we get" signal — good enough
  // for the MVP summary.
  return ((read.stopPrice - fill.price) / range) * read.rrBrooks
}

export function pairFills(fills: FilledTrade[], reads: TradeRead[]): PairedTrade[] {
  // Bucket reads by `${canonTicker}\n${date}` for O(1) lookup.
  const readBucket = new Map<string, TradeRead[]>()
  for (const read of reads) {
    const key = `${canonTicker(read.ticker)}\n${read.date}`
    const bucket = readBucket.get(key)
    if (bucket) bucket.push(read)
    else readBucket.set(key, [read])
  }

  const paired: PairedTrade[] = []
  for (const fill of fills) {
    const key = `${canonTicker(fill.ticker)}\n${fill.date}`
    const candidates = readBucket.get(key) ?? []

    // Prefer the read with the highest qualityScore (most confident Brooks
    // read for that ticker/day). Ties broken by time asc for determinism.
    const best = candidates
      .slice()
      .sort((a, b) => {
        const q = b.qualityScore - a.qualityScore
        if (q !== 0) return q
        return a.time.localeCompare(b.time)
      })[0]

    if (!best) {
      paired.push({
        fill,
        pairedReadId: null,
        rMultiple: null,
        realizedPnL: null,
      })
      continue
    }

    paired.push({
      fill,
      pairedReadId: best.id,
      rMultiple: computeRMultiple(fill, best),
      realizedPnL: null, // round-trip PnL is Phase 3
    })
  }

  return paired
}

/**
 * Per-setup equity stats computed from paired fills' backing reads.
 * Only paired fills contribute; orphans are excluded from aggregation.
 *
 * Groups by `setupBrooks` (e.g., "h2", "l2", "spike_channel"). Returns one
 * EquityStats per setup. Reuses `computeEquityStats` so the R derivation
 * is identical to `/trades`.
 */
export function perSetupStats(
  paired: PairedTrade[],
  reads: TradeRead[]
): Record<string, EquityStats> {
  const readById = new Map<string, TradeRead>()
  for (const r of reads) readById.set(r.id, r)

  const grouped = new Map<string, TradeRead[]>()
  for (const p of paired) {
    if (!p.pairedReadId) continue
    const read = readById.get(p.pairedReadId)
    if (!read) continue
    const setup = read.setupBrooks || 'unknown'
    const bucket = grouped.get(setup)
    if (bucket) bucket.push(read)
    else grouped.set(setup, [read])
  }

  const out: Record<string, EquityStats> = {}
  for (const [setup, group] of grouped) {
    out[setup] = computeEquityStats(group)
  }
  return out
}

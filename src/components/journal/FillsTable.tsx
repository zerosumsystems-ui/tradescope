'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { FilledTrade, FilledTradesPayload, PairedTrade } from '@/lib/types'
import type { EquityStats } from '@/lib/stats'

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York',
    })
  } catch {
    return iso
  }
}

function formatMoney(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatR(n: number): string {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}R`
}

function formatPct(n: number): string {
  return `${(n * 100).toFixed(0)}%`
}

export function FillsTable() {
  const [payload, setPayload] = useState<FilledTradesPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/snaptrade/sync')
      .then((r) => r.json())
      .then((data) => {
        setPayload(data as FilledTradesPayload)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Map fill.id → PairedTrade for O(1) lookup while rendering rows.
  const pairedById = useMemo(() => {
    const m = new Map<string, PairedTrade>()
    for (const p of payload?.paired ?? []) m.set(p.fill.id, p)
    return m
  }, [payload?.paired])

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-10 w-full" />
        ))}
      </div>
    )
  }

  const fills = payload?.fills ?? []

  if (fills.length === 0) {
    return (
      <div className="text-center py-16 text-sub text-sm">
        No fills yet. Connect a broker in the <strong>Broker</strong> tab and hit <em>Sync now</em>.
      </div>
    )
  }

  // Group by date DESC
  const grouped = fills.reduce((acc, fill) => {
    if (!acc[fill.date]) acc[fill.date] = []
    acc[fill.date].push(fill)
    return acc
  }, {} as Record<string, FilledTrade[]>)
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  // Sort fills within each date by fillTime DESC
  for (const date of sortedDates) {
    grouped[date].sort((a, b) => b.fillTime.localeCompare(a.fillTime))
  }

  const stats = payload?.stats ?? {}
  const pairedCount = payload?.paired?.filter((p) => p.pairedReadId).length ?? 0
  const orphanCount = fills.length - pairedCount

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs text-sub">
        <span>
          {fills.length} fill{fills.length === 1 ? '' : 's'} across {sortedDates.length} day
          {sortedDates.length === 1 ? '' : 's'} · {pairedCount} paired · {orphanCount} orphan
        </span>
        {payload?.syncedAt && (
          <span className="text-gray">
            Synced {new Date(payload.syncedAt).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
          </span>
        )}
      </div>

      {payload?.lastSyncError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded p-3">
          Last sync error: {payload.lastSyncError}
        </div>
      )}

      <SetupStatsPanel stats={stats} />

      {sortedDates.map((date) => {
        const d = new Date(date + 'T12:00:00')
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' })
        const monthDay = d.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })

        return (
          <div key={date}>
            <div className="flex items-baseline gap-2 mb-2">
              <h2 className="text-sm font-semibold text-text">{dayName}</h2>
              <span className="text-xs text-sub">{monthDay}</span>
              <span className="text-[10px] text-gray">
                {grouped[date].length} fill{grouped[date].length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-[var(--surface-alt,rgba(255,255,255,0.02))] text-gray">
                  <tr>
                    <th className="text-left font-medium px-3 py-2 w-20">Time</th>
                    <th className="text-left font-medium px-3 py-2 w-16">Side</th>
                    <th className="text-left font-medium px-3 py-2">Ticker</th>
                    <th className="text-right font-medium px-3 py-2">Qty</th>
                    <th className="text-right font-medium px-3 py-2">Price</th>
                    <th className="text-right font-medium px-3 py-2">Notional</th>
                    <th className="text-right font-medium px-3 py-2">Fees</th>
                    <th className="text-left font-medium px-3 py-2">Pre-trade read</th>
                    <th className="text-left font-medium px-3 py-2">Account</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[date].map((fill) => {
                    const paired = pairedById.get(fill.id)
                    return (
                      <tr
                        key={fill.id}
                        className="border-t border-border/50 hover:bg-[var(--surface-hover,rgba(255,255,255,0.02))]"
                      >
                        <td className="px-3 py-2 text-sub tabular-nums">{formatTime(fill.fillTime)}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              fill.action === 'BUY'
                                ? 'bg-teal/15 text-teal'
                                : 'bg-red-500/15 text-red-400'
                            }`}
                          >
                            {fill.action}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-semibold text-text">
                          <Link
                            href={`/symbol/${encodeURIComponent(fill.ticker)}`}
                            className="hover:text-teal transition-colors"
                            title={`Open ${fill.ticker} — scanner + trades + journal`}
                          >
                            {fill.ticker}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-right text-sub tabular-nums">
                          {fill.qty.toLocaleString('en-US')}
                        </td>
                        <td className="px-3 py-2 text-right text-sub tabular-nums">
                          {formatMoney(fill.price)}
                        </td>
                        <td className="px-3 py-2 text-right text-text tabular-nums">
                          {formatMoney(fill.amount)}
                        </td>
                        <td className="px-3 py-2 text-right text-gray tabular-nums">
                          {fill.commission + fill.fees > 0
                            ? formatMoney(fill.commission + fill.fees)
                            : '—'}
                        </td>
                        <td className="px-3 py-2">
                          <PairedBadge paired={paired} />
                        </td>
                        <td className="px-3 py-2 text-gray truncate max-w-[160px]">
                          {fill.accountName ?? '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface PairedBadgeProps {
  paired: PairedTrade | undefined
}

function PairedBadge({ paired }: PairedBadgeProps) {
  if (!paired || !paired.pairedReadId) {
    return (
      <span
        className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400"
        title="No matching Brooks read for this ticker + date"
      >
        no read
      </span>
    )
  }
  const r = paired.rMultiple
  return (
    <Link
      href={`/trades?setup=${encodeURIComponent(paired.pairedReadId.split('_').pop() ?? '')}`}
      className="inline-flex items-center gap-1.5 text-[11px] hover:text-teal transition-colors"
      title="Paired to pre-trade Brooks read"
    >
      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal/15 text-teal">
        paired
      </span>
      {r != null && (
        <span
          className={`tabular-nums ${r > 0 ? 'text-teal' : r < 0 ? 'text-red-400' : 'text-sub'}`}
        >
          {formatR(r)}
        </span>
      )}
    </Link>
  )
}

interface SetupStatsPanelProps {
  stats: Record<string, EquityStats>
}

function SetupStatsPanel({ stats }: SetupStatsPanelProps) {
  const rows = Object.entries(stats)
    .map(([setup, s]) => ({ setup, ...s }))
    .filter((r) => r.completedCount > 0)
    .sort((a, b) => b.totalPnL - a.totalPnL)

  if (rows.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-3 text-xs text-sub">
        <div className="font-semibold text-text mb-1">Per-setup stats</div>
        <p>
          No paired fills with a realized outcome yet. Stats appear once fills match Brooks reads
          in <Link href="/trades" className="text-teal hover:underline">Trade Catalog</Link> that
          have an outcome (win / loss / scratch).
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-gray border-b border-border">
        Per-setup stats (paired fills only)
      </div>
      <table className="w-full text-xs">
        <thead className="text-gray">
          <tr>
            <th className="text-left font-medium px-3 py-2">Setup</th>
            <th className="text-right font-medium px-3 py-2">N</th>
            <th className="text-right font-medium px-3 py-2">Win rate</th>
            <th className="text-right font-medium px-3 py-2">Expectancy</th>
            <th className="text-right font-medium px-3 py-2">Total R</th>
            <th className="text-right font-medium px-3 py-2">Max DD</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.setup} className="border-t border-border/50">
              <td className="px-3 py-2 font-semibold text-text uppercase">{r.setup}</td>
              <td className="px-3 py-2 text-right text-sub tabular-nums">{r.completedCount}</td>
              <td className="px-3 py-2 text-right tabular-nums">
                <span className={r.winRate >= 0.5 ? 'text-teal' : 'text-sub'}>
                  {formatPct(r.winRate)}
                </span>
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                <span className={r.expectancy > 0 ? 'text-teal' : r.expectancy < 0 ? 'text-red-400' : 'text-sub'}>
                  {formatR(r.expectancy)}
                </span>
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                <span className={r.totalPnL > 0 ? 'text-teal' : r.totalPnL < 0 ? 'text-red-400' : 'text-sub'}>
                  {formatR(r.totalPnL)}
                </span>
              </td>
              <td className="px-3 py-2 text-right text-gray tabular-nums">
                {r.maxDrawdown > 0 ? `-${r.maxDrawdown.toFixed(2)}R` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

'use client'

import type { ScoreboardEntry } from '@/lib/types'

interface CalibrationTrendProps {
  entries: ScoreboardEntry[]
}

// Each figure has 5 categories, each scored up to 3 pts (AGREE=3, PARTIAL=2, MISS=1? or 0)
// Looking at the data — total_agree is 5-15. Assume 15 is perfect (3 per category).
const MAX_SCORE = 15

function colorForScore(score: number): string {
  const pct = score / MAX_SCORE
  if (pct >= 0.8) return 'bg-teal'
  if (pct >= 0.5) return 'bg-yellow'
  return 'bg-red'
}

function textColorForScore(score: number): string {
  const pct = score / MAX_SCORE
  if (pct >= 0.8) return 'text-teal'
  if (pct >= 0.5) return 'text-yellow'
  return 'text-red'
}

export function CalibrationTrend({ entries }: CalibrationTrendProps) {
  if (entries.length === 0) {
    return <p className="text-sub text-sm">No calibration attempts yet.</p>
  }

  // Sort by date asc (oldest first) then by figure for consistent ordering within a day
  const sorted = [...entries].sort((a, b) => {
    const d = a.date.localeCompare(b.date)
    if (d !== 0) return d
    return a.figureNumber.localeCompare(b.figureNumber)
  })

  return (
    <div className="space-y-1.5">
      {sorted.map((e, i) => {
        const pct = (e.totalAgree / MAX_SCORE) * 100
        return (
          <div key={`${e.date}-${e.figureNumber}-${i}`} className="flex items-center gap-3">
            <span className="text-[10px] text-sub w-20 text-right tabular-nums">
              {e.date}
            </span>
            <span className="text-[11px] text-text w-20 truncate">
              Fig {e.figureNumber}
            </span>
            <span className="text-[10px] text-sub w-28 truncate">{e.book}</span>
            <div className="flex-1 h-[8px] bg-border/40 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${colorForScore(e.totalAgree)}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`text-xs font-semibold w-12 text-right tabular-nums ${textColorForScore(e.totalAgree)}`}>
              {e.totalAgree}/{MAX_SCORE}
            </span>
          </div>
        )
      })}
    </div>
  )
}

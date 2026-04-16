'use client'

import type { CategoryCount } from '@/lib/types'

interface CategoryAccuracyBarProps {
  label: string
  counts: CategoryCount
}

export function CategoryAccuracyBar({ label, counts }: CategoryAccuracyBarProps) {
  const total = counts.agree + counts.partial + counts.miss
  const agreePct = total > 0 ? (counts.agree / total) * 100 : 0
  const partialPct = total > 0 ? (counts.partial / total) * 100 : 0
  const missPct = total > 0 ? (counts.miss / total) * 100 : 0
  // "Accuracy" score: full weight for agree, half for partial
  const score = total > 0 ? ((counts.agree + counts.partial * 0.5) / total) * 100 : 0

  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-xs text-text font-medium w-24 shrink-0">{label}</span>
      <div className="flex-1 h-[10px] bg-border/40 rounded-full overflow-hidden flex">
        {agreePct > 0 && (
          <div
            className="h-full bg-teal"
            style={{ width: `${agreePct}%` }}
            title={`AGREE: ${counts.agree}`}
          />
        )}
        {partialPct > 0 && (
          <div
            className="h-full bg-yellow"
            style={{ width: `${partialPct}%` }}
            title={`PARTIAL: ${counts.partial}`}
          />
        )}
        {missPct > 0 && (
          <div
            className="h-full bg-red"
            style={{ width: `${missPct}%` }}
            title={`MISS: ${counts.miss}`}
          />
        )}
      </div>
      <div className="flex items-center gap-2 text-[11px] tabular-nums shrink-0">
        <span className="text-teal w-6 text-right">{counts.agree}</span>
        <span className="text-yellow w-6 text-right">{counts.partial}</span>
        <span className="text-red w-6 text-right">{counts.miss}</span>
        <span className="text-text font-semibold w-12 text-right">{score.toFixed(0)}%</span>
      </div>
    </div>
  )
}

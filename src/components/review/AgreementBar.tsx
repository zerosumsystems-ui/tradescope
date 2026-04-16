'use client'

import type { AuditDistribution } from '@/lib/types'

type BarClass = 'AGREE' | 'PARTIAL' | 'MINOR' | 'MAJOR' | 'DISAGREE' | 'INVERTED'

const COLOR_MAP: Record<BarClass, string> = {
  AGREE: 'bg-teal',
  PARTIAL: 'bg-orange',
  MINOR: 'bg-yellow',
  MAJOR: 'bg-red/70',
  DISAGREE: 'bg-red',
  INVERTED: 'bg-red',
}

const TEXT_COLOR_MAP: Record<BarClass, string> = {
  AGREE: 'text-teal',
  PARTIAL: 'text-orange',
  MINOR: 'text-yellow',
  MAJOR: 'text-red',
  DISAGREE: 'text-red',
  INVERTED: 'text-red',
}

interface AgreementBarProps<T extends BarClass> {
  entries: AuditDistribution<T>[]
  label?: string
}

export function AgreementBar<T extends BarClass>({ entries, label }: AgreementBarProps<T>) {
  if (entries.length === 0) {
    return <p className="text-sub text-sm">No data.</p>
  }
  const total = entries.reduce((s, e) => s + e.count, 0) || 1

  return (
    <div>
      {label && (
        <div className="text-[10px] uppercase tracking-wider text-sub font-semibold mb-2">
          {label}
        </div>
      )}
      <div className="flex h-3 rounded-full overflow-hidden bg-border/40 mb-2">
        {entries.map((e) => {
          const width = (e.count / total) * 100
          const cls = COLOR_MAP[e.class]
          return (
            <div
              key={e.class}
              className={`h-full ${cls}`}
              style={{ width: `${width}%` }}
              title={`${e.class}: ${e.count} (${e.pct}%)`}
            />
          )
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
        {entries.map((e) => (
          <div key={e.class} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${COLOR_MAP[e.class]}`} />
            <span className="text-sub uppercase tracking-wide">{e.class}</span>
            <span className={`${TEXT_COLOR_MAP[e.class]} font-semibold tabular-nums`}>
              {e.count}
            </span>
            <span className="text-sub tabular-nums">({e.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

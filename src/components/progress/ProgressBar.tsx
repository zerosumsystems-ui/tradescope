'use client'

interface ProgressBarProps {
  completed: number
  total: number
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const pct = total > 0 ? (completed / total) * 100 : 0
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-sub font-semibold">
            Figures Calibrated
          </div>
          <div className="text-2xl font-bold text-text tabular-nums">
            {completed.toLocaleString()}
            <span className="text-sub font-normal"> / {total.toLocaleString()}</span>
          </div>
        </div>
        <div className="text-sm text-teal font-semibold tabular-nums">
          {pct.toFixed(1)}%
        </div>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-teal rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

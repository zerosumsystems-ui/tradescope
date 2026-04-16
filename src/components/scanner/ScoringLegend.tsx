"use client"

export function ScoringLegend() {
  return (
    <details className="mb-3 text-xs text-sub">
      <summary className="cursor-pointer text-teal text-[11px] font-semibold tracking-widest uppercase py-1 hover:underline">
        How Scoring Works
      </summary>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 pt-3 pb-2">
        <div>
          <h3 className="text-[11px] font-bold text-text uppercase tracking-wide mb-1.5 border-b border-border pb-1">
            Urgency (0–10)
          </h3>
          <dl className="space-y-1">
            <dt className="font-semibold text-text text-[11px] font-mono">spike (0–4)</dt>
            <dd className="text-[11px] text-sub leading-snug">Strength of opening move — strong body ratio, closes near extreme</dd>
            <dt className="font-semibold text-text text-[11px] font-mono">gap (-2–+2)</dt>
            <dd className="text-[11px] text-sub leading-snug">Gap integrity — +2 = intact, -2 = filled and failed</dd>
            <dt className="font-semibold text-text text-[11px] font-mono">pull (-1–+2)</dt>
            <dd className="text-[11px] text-sub leading-snug">Pullback quality — shallow + tight = bullish</dd>
            <dt className="font-semibold text-text text-[11px] font-mono">FT (-1.5–+2)</dt>
            <dd className="text-[11px] text-sub leading-snug">Follow through — consecutive trend bars after spike</dd>
            <dt className="font-semibold text-text text-[11px] font-mono">MA (0–1)</dt>
            <dd className="text-[11px] text-sub leading-snug">MA separation — price distance from 20-EMA</dd>
          </dl>
        </div>
        <div>
          <h3 className="text-[11px] font-bold text-text uppercase tracking-wide mb-1.5 border-b border-border pb-1">
            Modifiers
          </h3>
          <dl className="space-y-1">
            <dt className="font-semibold text-text text-[11px] font-mono">vol (0–1)</dt>
            <dd className="text-[11px] text-sub leading-snug">Volume confirmation — expanding on trend, contracting on pullback</dd>
            <dt className="font-semibold text-text text-[11px] font-mono">tail (-0.5–+1)</dt>
            <dd className="text-[11px] text-sub leading-snug">Tail quality — rejection wicks favoring direction</dd>
            <dt className="font-semibold text-text text-[11px] font-mono">SPT (0–3)</dt>
            <dd className="text-[11px] text-sub leading-snug">Small pullback trend — calm drift with tiny pullbacks</dd>
            <dt className="font-semibold text-text text-[11px] font-mono">BPA (-1–+2)</dt>
            <dd className="text-[11px] text-sub leading-snug">Brooks pattern alignment — H2/L2 = +2, opposing = -1</dd>
          </dl>
        </div>
      </div>
    </details>
  )
}

import type { Signal } from "@/lib/types"

const SIGNAL_STYLES: Record<Signal, string> = {
  BUY: "bg-teal/[.18] text-teal border-teal/35",
  SELL: "bg-red/[.18] text-red border-red/35",
  WAIT: "bg-yellow/[.15] text-yellow border-yellow/30",
  FOG: "bg-orange/[.13] text-orange border-orange/[.28]",
  AVOID: "bg-gray/25 text-sub border-gray/45",
}

export function SignalBadge({ signal }: { signal: Signal }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide whitespace-nowrap border ${SIGNAL_STYLES[signal]}`}>
      {signal}
    </span>
  )
}

"use client"

import type { ComponentScores } from "@/lib/types"

const COMPONENTS: { key: keyof ComponentScores; label: string; special?: "spt" | "bpa" }[] = [
  { key: "spike", label: "spike" },
  { key: "gap", label: "gap" },
  { key: "pull", label: "pull" },
  { key: "ft", label: "FT" },
  { key: "ma", label: "MA" },
  { key: "vol", label: "vol" },
  { key: "tail", label: "tail" },
  { key: "spt", label: "SPT", special: "spt" },
  { key: "bpa", label: "BPA", special: "bpa" },
]

export function ComponentTiles({ scores }: { scores: ComponentScores }) {
  return (
    <div className="flex flex-wrap gap-1 px-3 py-2 tabular-nums">
      {COMPONENTS.map(({ key, label, special }) => {
        const val = scores[key]
        const isDim = val === 0
        let tileClass = "bg-white/[.03] border-border"
        let labelClass = "text-sub"
        if (special === "spt") {
          tileClass = "border-teal/45 bg-teal/[.08]"
          labelClass = "text-teal"
        } else if (special === "bpa") {
          tileClass = "border-[#dcaa32]/45 bg-[#dcaa32]/[.08]"
          labelClass = "text-[#dcaa32]"
        }

        return (
          <span
            key={key}
            className={`inline-flex flex-col items-center px-1.5 py-0.5 min-w-[36px] rounded border ${tileClass} ${isDim ? "opacity-35" : ""}`}
          >
            <span className={`text-[9px] tracking-wide ${labelClass}`}>{label}</span>
            <span className="text-[11px] font-semibold text-text">
              {val < 0 ? `−${Math.abs(val).toFixed(1)}` : val.toFixed(1)}
            </span>
          </span>
        )
      })}
    </div>
  )
}

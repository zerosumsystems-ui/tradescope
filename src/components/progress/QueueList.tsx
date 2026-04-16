'use client'

interface QueueListProps {
  items: string[]
}

export function QueueList({ items }: QueueListProps) {
  if (items.length === 0) {
    return <p className="text-sub text-sm">Queue is empty.</p>
  }
  return (
    <ol className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2 text-xs text-text/85">
          <span className="text-[10px] text-sub tabular-nums w-5 text-right">
            {i + 1}.
          </span>
          <span className="truncate">{item}</span>
        </li>
      ))}
    </ol>
  )
}

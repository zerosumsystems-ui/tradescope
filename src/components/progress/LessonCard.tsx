'use client'

import type { Lesson } from '@/lib/types'

interface LessonCardProps {
  lesson: Lesson
  query?: string
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow/30 text-text rounded px-0.5">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function LessonCard({ lesson, query = '' }: LessonCardProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-3 hover:border-border-hover transition-colors">
      <div className="flex items-start gap-3 mb-2">
        <span className="text-xs font-mono font-bold text-teal bg-teal/10 px-2 py-0.5 rounded shrink-0">
          {lesson.id}
        </span>
        <h3 className="text-sm font-semibold text-text leading-snug">
          {highlight(lesson.title, query)}
        </h3>
      </div>
      <div className="text-[11px] text-sub mb-2">
        From {lesson.fromFigure}
        {lesson.fromDate && <> · {lesson.fromDate}</>}
      </div>
      {lesson.patternMissed && (
        <div className="mb-2">
          <div className="text-[10px] uppercase tracking-wider text-sub font-semibold mb-0.5">
            Pattern I missed
          </div>
          <p className="text-xs text-text/85 leading-relaxed">
            {highlight(lesson.patternMissed, query)}
          </p>
        </div>
      )}
      {lesson.futureRule && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-teal/80 font-semibold mb-0.5">
            Future rule
          </div>
          <p className="text-xs text-text/85 leading-relaxed">
            {highlight(lesson.futureRule, query)}
          </p>
        </div>
      )}
    </div>
  )
}

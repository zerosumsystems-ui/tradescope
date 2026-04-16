'use client'

import { use } from 'react'
import { KnowledgeShell } from '@/components/knowledge/KnowledgeShell'
import { NoteView } from '@/components/knowledge/NoteView'
import Link from 'next/link'
import type { VaultNote } from '@/lib/types'

export default function NotePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = use(params)
  const slugStr = slug.map(decodeURIComponent).join('/')

  return (
    <KnowledgeShell activeSlug={slugStr}>
      {(notes: VaultNote[]) => {
        const note = notes.find((n) => n.slug === slugStr)

        if (!note) {
          return (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg text-sub mb-2">Note not found</div>
                <p className="text-sm text-gray mb-4">{slugStr}</p>
                <Link href="/knowledge" className="text-sm text-teal hover:text-teal/80">
                  Back to Knowledge Base
                </Link>
              </div>
            </div>
          )
        }

        return <NoteView note={note} allNotes={notes} />
      }}
    </KnowledgeShell>
  )
}

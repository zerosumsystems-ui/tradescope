'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import Link from 'next/link'
import type { VaultNote } from '@/lib/types'

function resolveWikiLink(target: string, allNotes: VaultNote[]): string | null {
  // Try exact slug match
  const exact = allNotes.find((n) => n.slug === target)
  if (exact) return exact.slug

  // Try filename match (case-insensitive)
  const byFilename = allNotes.find(
    (n) => n.filename.replace('.md', '').toLowerCase() === target.toLowerCase()
  )
  if (byFilename) return byFilename.slug

  // Try title match
  const byTitle = allNotes.find(
    (n) => n.title.toLowerCase() === target.toLowerCase()
  )
  if (byTitle) return byTitle.slug

  return null
}

function encodeSlug(slug: string): string {
  return slug.split('/').map(encodeURIComponent).join('/')
}

function processWikiLinks(markdown: string, allNotes: VaultNote[]): string {
  // Replace [[target|display]] and [[target]] with markdown links
  return markdown.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, target, display) => {
    const slug = resolveWikiLink(target.trim(), allNotes)
    const label = display?.trim() || target.trim()
    if (slug) {
      return `[${label}](/knowledge/${encodeSlug(slug)})`
    }
    // Unresolved link — render as dimmed text
    return `<span class="wiki-unresolved">${label}</span>`
  })
}

export function MarkdownRenderer({
  note,
  allNotes,
}: {
  note: VaultNote
  allNotes: VaultNote[]
}) {
  const processed = processWikiLinks(note.content, allNotes)

  return (
    <div className="vault-prose max-w-3xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          span: ({ className, children }) => {
            if (className === 'wiki-unresolved') {
              return (
                <span className="text-sub/60 italic text-xs">{children}</span>
              )
            }
            return <span className={className}>{children}</span>
          },
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-text mb-4 pb-2 border-b border-border">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-text mt-8 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-text mt-6 mb-2">{children}</h3>
          ),
          p: ({ children }) => <p className="text-sm text-text/90 leading-relaxed mb-4">{children}</p>,
          a: ({ href, children }) => {
            if (href?.startsWith('/knowledge/')) {
              return (
                <Link href={href} className="text-teal hover:text-teal/80 underline underline-offset-2">
                  {children}
                </Link>
              )
            }
            return (
              <a href={href} className="text-teal hover:text-teal/80 underline underline-offset-2" target="_blank" rel="noopener">
                {children}
              </a>
            )
          },
          ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm text-text/90 leading-relaxed">{children}</li>,
          code: ({ className, children }) => {
            const isBlock = className?.startsWith('language-')
            if (isBlock) {
              return (
                <code className={`block bg-bg rounded p-3 text-xs font-mono text-text/80 overflow-x-auto mb-4 ${className}`}>
                  {children}
                </code>
              )
            }
            return (
              <code className="bg-bg rounded px-1.5 py-0.5 text-xs font-mono text-teal/80">
                {children}
              </code>
            )
          },
          pre: ({ children }) => <pre className="mb-4">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-teal/40 pl-4 my-4 text-sub italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-border">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-sub">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-sm text-text/80 border-b border-border/50">
              {children}
            </td>
          ),
          strong: ({ children }) => <strong className="font-semibold text-text">{children}</strong>,
          hr: () => <hr className="border-border my-6" />,
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}

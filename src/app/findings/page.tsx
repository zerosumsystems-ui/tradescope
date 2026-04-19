'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { VaultNote, VaultPayload } from '@/lib/types'

type Run = {
  id: string
  label: string
  date: string
  headline: string
  recommendation: string
  noteSlug: string | null
  figure?: string
  figureCaption?: string
}

const TREND_RUNS: Run[] = [
  {
    id: 'incr-20',
    label: 'incr 20',
    date: '2026-04-19',
    headline:
      'One of the 12 trend judges was making things worse — a single-knob change flips it positive',
    recommendation:
      'Two-axis sweep (window × min-consec) of the `always_in` contributor on 800 RTH sessions. Production (W=5, K=2) fires on 36 % of days at 57.6 % directional accuracy — WORSE than the 66 % "always guess UP" baseline on this up-biased sample. Proposed (W=10, K=2) fires on 51.9 % of days at 66.9 % accuracy — matches baseline while also speaking 16 pp more often. Change `ALWAYS_IN_WINDOW` from 5 → 10 in `aiedge/context/trend.py`. Same-session labelling; not forward WR.',
    noteSlug: 'Scanner/methodology/trend-contributor-findings-2026-04-19-incr20-always-in-sweep',
    figure: '/findings/figures/always_in_layman_before_after.png',
    figureCaption:
      'OLD vs NEW setting on the two layman questions — does the judge speak, and when it does, is it right? Dashed line is the "always guess UP" baseline.',
  },
  {
    id: 'incr-19',
    label: 'incr 19',
    date: '2026-04-19',
    headline: 'Contributor-degeneracy audit — 2 silent-fail + sharp directional-accuracy hierarchy',
    recommendation:
      'Sweep of all 12 contributors on 800 RTH sessions surfaced two silent-failing contributors and a clear split between high-accuracy and low-accuracy groups. Feeds directly into weighting decisions in the next increment.',
    noteSlug: 'Scanner/methodology/trend-contributor-findings-2026-04-19-incr19-degeneracy',
    figure: '/findings/figures/contributor_matrix.png',
    figureCaption:
      'Per-contributor directional-accuracy and fire-rate audit on 800 RTH sessions.',
  },
  {
    id: 'incr-18',
    label: 'incr 18',
    date: '2026-04-19',
    headline: '`majority_trend_bars` is gated by the 40 % majority floor, not the body-ratio threshold',
    recommendation:
      'Lower MAJORITY_TREND_BAR_FLOOR from 0.40 → 0.25. At production, classifier fires in 1 of 800 sessions and that one was wrong. At floor 0.25, fires in 78 of 800 with ~90 % directional accuracy.',
    noteSlug: 'Scanner/methodology/trend-contributor-findings-2026-04-19-incr18-majority-floor',
    figure: '/findings/figures/majority_trend_bars_floor_sweep.png',
    figureCaption:
      'Per-floor session fire rate (left) and directional accuracy (right). Production floor = 0.40 (red). Sample: 800 RTH sessions across 387 symbols.',
  },
  {
    id: 'incr-17',
    label: 'incr 17',
    date: '2026-04-19',
    headline: 'Synthetic-bank caveat CONFIRMED on real data; weighting recommendations REVERSED',
    recommendation:
      'Equal weighting stays. Real-data validation overturns the incr-16 down-weight recommendation: synthetic r = +0.997 collapses to +0.404 on real ES.c.0. Mean uniqueness 5× higher on real than synthetic. trend_state now flows into the dashboard payload (additive).',
    noteSlug: 'Scanner/methodology/trend-contributor-findings-2026-04-19-incr17-followups',
    figure: '/findings/figures/contributor_agreement_real.png',
    figureCaption:
      'Real-data 12×12 Pearson heatmap + side-by-side uniqueness vs the synthetic-fixture bank.',
  },
  {
    id: 'incr-16',
    label: 'incr 16',
    date: '2026-04-19',
    headline: 'Synthetic-fixture redundancy study — flagged, then mostly overturned by incr 17',
    recommendation:
      'Pairwise Pearson r over 12 contributors on the 5-fixture synthetic bank. Flagged near-duplicate pairs (r ≈ 1) but warned several were sample-bank artifacts. Most flagged pairs collapsed on real data.',
    noteSlug: 'Scanner/methodology/trend-contributor-findings-2026-04-19-incr16-redundancy',
    figure: '/findings/figures/contributor_agreement.png',
    figureCaption:
      'Synthetic-bank 12×12 Pearson heatmap. Several near-perfect correlations turned out to be polarized-fixture artifacts.',
  },
  {
    id: 'incr-15',
    label: 'incr 15',
    date: '2026-04-19',
    headline: 'Capstone: htf_alignment wired as 12th contributor; inventory complete',
    recommendation:
      '12 of 12 direction-voting contributors live. 602 tests / 905 subtests green. Regime amplifier family formally excluded.',
    noteSlug: 'Scanner/methodology/trend-contributor-findings-2026-04-19-incr15-capstone',
    figure: '/findings/figures/contributor_matrix.png',
    figureCaption:
      'The 12 × 5 control panel — each row a canonical market regime, each column one classifier.',
  },
]

const SPT_RUNS: Run[] = [
  {
    id: 'pt-31',
    label: 'pt 31',
    date: '2026-04-19',
    headline: 'Brooks → aiedge transfer failure taxonomy (synthesis)',
    recommendation:
      'No PLAYBOOK change. Names the three Brooks-to-scanner transfer failure modes observed in pts 28/29/30 — Inversion, Rarity, Emptiness — and proposes a 3-check zero-compute vetting checklist (label-polarity, base-rate, conditional joint-probability) that would have pre-screened all three. Brooks-source well declared exhausted for SPT US single-name equities; future +R from scanner-side schema enrichments.',
    noteSlug: 'Brooks PA/concepts/small-pullback-trend-brooks-transfer-taxonomy-2026-04-19',
  },
  {
    id: 'pt-30',
    label: 'pt 30',
    date: '2026-04-19',
    headline: 'Q43 first MA-gap-bar exit overlay — NEGATIVE/EMPTY',
    recommendation:
      'No PLAYBOOK change. Brooks ch. 47 first-MA-gap-bar exit fires 0/101 at the canonical cell (threshold +1.5R, EMA20). 12-cell sweep never positive; only 16/101 baseline trades ever see a post-entry MA-gap bar, with mean mtm −1.66R. Third consecutive Brooks-candidate NEGATIVE close after Q41/Q42.',
    noteSlug: 'Brooks PA/concepts/small-pullback-trend-first-ma-gap-exit-2026-04-19',
  },
  {
    id: 'pt-29',
    label: 'pt 29',
    date: '2026-04-19',
    headline: 'Q42 2× climactic-burst exit overlay — NEGATIVE/RARE',
    recommendation:
      'No PLAYBOOK change. Brooks ch. 57 2×-large-with-trend-new-HoD exit fires on 2/101 baseline trades at the canonical 14:00-15:00 ET cell. 18-cell sweep never exceeds +0.004 R/trade. Rule 6 truncates entries at 14:15 ET and hybrid rule 9 resolves many trades before 14:00 — Brooks last-hour signal structurally pre-empted.',
    noteSlug: 'Brooks PA/concepts/small-pullback-trend-climactic-exit-2026-04-19',
  },
  {
    id: 'pt-28',
    label: 'pt 28',
    date: '2026-04-19',
    headline: 'Q41 next-session follow-through — NEGATIVE',
    recommendation:
      'No PLAYBOOK change. Brooks ch. 57 line 11 next-session follow-through does NOT replicate. At 9:30-11:00 ET on day N+1 after an SPT day, ALIGN n=6 perR −0.01 UNDERPERFORMS OPPOSED n=9 perR +1.84. Scanner-vs-Brooks label-polarity inverts — Brooks "continuation with pullback entry" = scanner OPPOSED. First clean Brooks → aiedge transfer failure.',
    noteSlug: 'Brooks PA/concepts/small-pullback-trend-next-session-followthrough-2026-04-19',
  },
  {
    id: 'pt-27',
    label: 'pt 27',
    date: '2026-04-19',
    headline: 'Q40 rule-10 × rule-11 joint effect — ADDITIVE',
    recommendation:
      'No structural PLAYBOOK change. C3 combined (rule 10 + rule 11): n=71, perR +1.841 R/trade, max DD −2.00R, WR 74.6%. Rule 11 dominates the joint gain (Δ(11|10) = +0.189 vs Δ(10|11) = +0.018). Dominates baseline 25/25 LOO-weeks and 54/54 LOO-symbols. Opens Q44 (rule-11 Δ stability) and Q45 (L2-short sparse cell).',
    noteSlug: 'Brooks PA/concepts/small-pullback-trend-rule10-rule11-joint-2026-04-19',
  },
  {
    id: 'pt-26',
    label: 'pt 26',
    date: '2026-04-19',
    headline: 'Brooks-source cross-reference audit of the 11-rule PLAYBOOK',
    recommendation:
      'Rule-by-rule audit against Brooks Trends chs 47, 57 and Reversals ch. 51. 9/11 PLAYBOOK rules have STRONG or PARTIAL Brooks grounding; rules 8 and 10 are pure-empirical. Three Brooks passages flagged as candidate future rules — next-session follow-through (Q41), 2× climactic-burst exit (Q42), first MA-gap bar exit (Q43). All three subsequently closed NEGATIVE in pts 28/29/30.',
    noteSlug: 'Brooks PA/concepts/small-pullback-trend-brooks-source-cross-reference-2026-04-19',
  },
]

const IPHONE_TREND_LINK = 'https://github.com/zerosumsystems-ui/iPhone-/tree/main/trend-classification'
const IPHONE_SPT_LINK = 'https://github.com/zerosumsystems-ui/iPhone-/tree/main/spt-research'
const VAULT_GITHUB_LINK = 'https://github.com/zerosumsystems-ui/aiedge-vault'

function RunCard({
  run,
  loading,
  slugSet,
}: {
  run: Run
  loading: boolean
  slugSet: Set<string>
}) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 md:p-5">
      <div className="flex items-baseline gap-3 mb-2 flex-wrap">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal/80">
          {run.label}
        </span>
        <span className="text-xs text-sub">{run.date}</span>
      </div>
      <h3 className="text-sm md:text-base font-semibold text-text mb-2 leading-snug">
        {run.headline}
      </h3>
      <p className="text-xs md:text-sm text-text/80 leading-relaxed mb-3">
        {run.recommendation}
      </p>
      <div
        className={
          run.figure
            ? 'grid md:grid-cols-2 gap-4 items-start'
            : 'text-xs text-sub'
        }
      >
        {run.figure && (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={run.figure}
              alt={run.figureCaption || ''}
              className="w-full h-auto border border-border rounded"
            />
            {run.figureCaption && (
              <figcaption className="text-[11px] text-sub italic mt-1.5">
                {run.figureCaption}
              </figcaption>
            )}
          </figure>
        )}
        <div className="text-xs text-sub">
          {loading ? (
            <span>Loading vault…</span>
          ) : run.noteSlug && slugSet.has(run.noteSlug) ? (
            <Link
              href={`/knowledge/${run.noteSlug.split('/').map(encodeURIComponent).join('/')}`}
              className="text-teal hover:text-teal/80 underline underline-offset-2"
            >
              Open the full note →
            </Link>
          ) : (
            <span className="italic">Note not yet synced to the live vault.</span>
          )}
        </div>
      </div>
    </div>
  )
}

function FeaturedCard({
  run,
  loading,
  slugSet,
  eyebrow,
}: {
  run: Run
  loading: boolean
  slugSet: Set<string>
  eyebrow: string
}) {
  return (
    <section className="mb-10 bg-surface border border-border rounded-lg p-5 md:p-6">
      <div className="flex items-baseline gap-3 mb-3 flex-wrap">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal/80">
          {eyebrow} · {run.label}
        </span>
        <span className="text-xs text-sub">{run.date}</span>
      </div>
      <h2 className="text-lg md:text-xl font-bold text-text mb-3 leading-snug">
        {run.headline}
      </h2>

      <div className="bg-bg/60 border-l-2 border-teal/60 pl-4 py-3 mb-5 rounded-r">
        <p className="text-xs font-semibold uppercase tracking-wider text-sub mb-1">
          Recommendation (needs your nod)
        </p>
        <p className="text-sm text-text/90 leading-relaxed">{run.recommendation}</p>
      </div>

      {run.figure && (
        <figure className="mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={run.figure}
            alt={run.figureCaption || ''}
            className="w-full h-auto border border-border rounded"
          />
          {run.figureCaption && (
            <figcaption className="text-xs text-sub italic mt-2 text-center">
              {run.figureCaption}
            </figcaption>
          )}
        </figure>
      )}

      {loading ? null : run.noteSlug && slugSet.has(run.noteSlug) ? (
        <Link
          href={`/knowledge/${run.noteSlug.split('/').map(encodeURIComponent).join('/')}`}
          className="inline-flex items-center gap-1 mt-4 text-sm text-teal hover:text-teal/80 underline underline-offset-2"
        >
          Read the full note →
        </Link>
      ) : (
        <p className="mt-4 text-xs text-sub italic">
          Note syncing to the live vault — check back shortly.
        </p>
      )}
    </section>
  )
}

export default function FindingsPage() {
  const [notes, setNotes] = useState<VaultNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/vault')
      .then((r) => r.json())
      .then((data: VaultPayload) => {
        setNotes(data.notes || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const slugSet = new Set(notes.map((n) => n.slug))

  const trendFeatured = TREND_RUNS[0]
  const trendHistory = TREND_RUNS.slice(1)
  const sptFeatured = SPT_RUNS[0]
  const sptHistory = SPT_RUNS.slice(1)

  return (
    <article className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal mb-1">
          Research
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">Findings</h1>
        <p className="text-sm text-sub leading-relaxed max-w-2xl">
          Autonomous research runs across two arcs: the canonical TrendState aggregator
          (trend classification) and the small-pullback-trend (SPT) setup-selection
          playbook. Each run is read-only with respect to production — any rule change
          requires explicit sign-off.
        </p>
      </header>

      <section className="mb-10 bg-bg/60 border border-border rounded-lg p-4 md:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal mb-2">
          📚 Full research archive
        </p>
        <p className="text-sm text-text/90 leading-relaxed mb-3">
          Every research post ever written lives in the aiedge-vault. The lists below
          show the most recent runs per arc; the archives cover every post from the
          beginning.
        </p>
        <ul className="text-sm text-sub space-y-1.5">
          <li>
            <a
              href={VAULT_GITHUB_LINK}
              className="text-teal hover:text-teal/80 underline underline-offset-2"
              target="_blank"
              rel="noopener"
            >
              aiedge-vault on GitHub
            </a>{' '}
            — canonical source for every note, PDF, and figure.
          </li>
          <li>
            <a
              href={IPHONE_SPT_LINK}
              className="text-teal hover:text-teal/80 underline underline-offset-2"
              target="_blank"
              rel="noopener"
            >
              SPT archive (phone-readable)
            </a>{' '}
            — 31 notes in reading order with Q closures.
          </li>
          <li>
            <a
              href={IPHONE_TREND_LINK}
              className="text-teal hover:text-teal/80 underline underline-offset-2"
              target="_blank"
              rel="noopener"
            >
              Trend-classification archive (phone-readable)
            </a>{' '}
            — every increment with PDF and note.
          </li>
          <li>
            <Link
              href="/knowledge"
              className="text-teal hover:text-teal/80 underline underline-offset-2"
            >
              Knowledge base on this site
            </Link>{' '}
            — same vault, rendered inline.
          </li>
        </ul>
      </section>

      {/* === Trend classification arc === */}
      <h2 className="text-xl md:text-2xl font-bold text-text mb-4 pb-2 border-b border-border">
        Trend classification
      </h2>
      <p className="text-sm text-sub leading-relaxed mb-5 max-w-2xl">
        Unifying 13 parallel trend classifiers in <code className="bg-bg/60 rounded px-1.5 py-0.5 text-text/80">aiedge-scanner</code> into one
        canonical <code className="bg-bg/60 rounded px-1.5 py-0.5 text-text/80">TrendState</code>. 12 of 12 direction-voting contributors wired;
        602 tests / 905 subtests green.
      </p>

      <FeaturedCard
        run={trendFeatured}
        loading={loading}
        slugSet={slugSet}
        eyebrow="Most recent"
      />

      <section className="mb-10">
        <h3 className="text-base font-semibold text-text mb-4 pb-2 border-b border-border">
          Headline numbers (incr 20)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Sessions analysed', value: '800' },
            { label: 'Symbols', value: '387' },
            { label: '"Guess UP" baseline', value: '66.0 %' },
            { label: 'Cells swept (W × K)', value: '20' },
            { label: 'OLD (W=5, K=2) fire', value: '36.0 %' },
            { label: 'OLD accuracy', value: '57.6 %' },
            { label: 'NEW (W=10, K=2) fire', value: '51.9 %' },
            { label: 'NEW accuracy', value: '66.9 %' },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-surface border border-border rounded p-3"
            >
              <div className="text-xs text-sub mb-1">{kpi.label}</div>
              <div className="text-xl font-bold text-text">{kpi.value}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-sub italic mt-3 leading-relaxed">
          OLD setting loses to the dumb strategy on this up-biased 9-day sample.
          NEW setting matches baseline <em>and</em> speaks 16 pp more often.
          Same-session directional labelling — not forward win-rate.
        </p>
      </section>

      <section className="mb-12">
        <h3 className="text-base font-semibold text-text mb-4 pb-2 border-b border-border">
          Run history — trend classification
        </h3>
        <div className="space-y-4">
          {trendHistory.map((run) => (
            <RunCard key={run.id} run={run} loading={loading} slugSet={slugSet} />
          ))}
        </div>
        <p className="text-xs text-sub mt-4">
          Earlier increments (1-14) were internal scaffolding — phase-by-phase scanner
          integration. See the{' '}
          <a
            href={IPHONE_TREND_LINK}
            className="text-teal hover:text-teal/80 underline underline-offset-2"
            target="_blank"
            rel="noopener"
          >
            trend-classification archive
          </a>{' '}
          for the full history.
        </p>
      </section>

      {/* === SPT research arc === */}
      <h2 className="text-xl md:text-2xl font-bold text-text mb-4 pb-2 border-b border-border">
        Small-pullback-trend (SPT) research
      </h2>
      <p className="text-sm text-sub leading-relaxed mb-5 max-w-2xl">
        Follow-up research arc on the small-pullback-trend setup. 31 notes from
        empirics through stack validation, target/stop/entry mechanics, signal-volume,
        and Brooks-source cross-reference. The operational PLAYBOOK delivers{' '}
        <strong className="text-text">+1.84 R/trade</strong> at{' '}
        <strong className="text-text">−2R max DD</strong> on the C3 combined stack.
      </p>

      <FeaturedCard
        run={sptFeatured}
        loading={loading}
        slugSet={slugSet}
        eyebrow="Most recent"
      />

      <section className="mb-12">
        <h3 className="text-base font-semibold text-text mb-4 pb-2 border-b border-border">
          Recent run history — SPT research
        </h3>
        <div className="space-y-4">
          {sptHistory.map((run) => (
            <RunCard key={run.id} run={run} loading={loading} slugSet={slugSet} />
          ))}
        </div>
        <p className="text-xs text-sub mt-4">
          Showing pts 26-30. All 31 SPT notes live in the{' '}
          <a
            href={IPHONE_SPT_LINK}
            className="text-teal hover:text-teal/80 underline underline-offset-2"
            target="_blank"
            rel="noopener"
          >
            SPT archive
          </a>{' '}
          with their Q closures, plus the consolidated{' '}
          <Link
            href="/knowledge/Brooks%20PA/concepts/small-pullback-trend-PLAYBOOK"
            className="text-teal hover:text-teal/80 underline underline-offset-2"
          >
            PLAYBOOK
          </Link>{' '}
          and{' '}
          <Link
            href="/knowledge/Brooks%20PA/concepts/small-pullback-trend-INDEX"
            className="text-teal hover:text-teal/80 underline underline-offset-2"
          >
            reading-order index
          </Link>
          .
        </p>
      </section>

      <footer className="border-t border-border pt-6 text-xs text-sub">
        <p>
          Phone-readable briefings:{' '}
          <a
            href={IPHONE_SPT_LINK}
            className="text-teal hover:text-teal/80 underline underline-offset-2"
            target="_blank"
            rel="noopener"
          >
            SPT
          </a>
          {' · '}
          <a
            href={IPHONE_TREND_LINK}
            className="text-teal hover:text-teal/80 underline underline-offset-2"
            target="_blank"
            rel="noopener"
          >
            trend classification
          </a>
        </p>
        <p className="mt-2">
          Long-form notes live in{' '}
          <Link href="/knowledge" className="text-teal hover:text-teal/80 underline underline-offset-2">
            Knowledge Base
          </Link>{' '}
          under <code className="bg-bg/60 rounded px-1.5 py-0.5 text-text/80">Scanner / methodology</code>{' '}
          and <code className="bg-bg/60 rounded px-1.5 py-0.5 text-text/80">Brooks PA / concepts</code>.
        </p>
      </footer>
    </article>
  )
}

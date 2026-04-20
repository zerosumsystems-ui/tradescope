import Link from 'next/link'

type Producer = 'claude' | 'codex'

type Study = {
  id: string
  producer: Producer
  title: string
  stream: string
  lastRun: string
  takeaway: string
  source: string
  href?: { label: string; url: string }
}

const PRODUCER_LABEL: Record<Producer, string> = {
  claude: 'Claude Code',
  codex: 'Codex',
}

const PRODUCER_CLASS: Record<Producer, string> = {
  claude: 'bg-teal/10 text-teal border-teal/30',
  codex: 'bg-yellow/10 text-yellow border-yellow/30',
}

const CLAUDE_STUDIES: Study[] = [
  {
    id: 'trend-classification',
    producer: 'claude',
    stream: 'Scanner — trend classification',
    title:
      'Only 8% of structure flips are intended spike→channel; 30% are bull/bear cross-reversals — but aggregate direction damping holds (r = 0.144)',
    lastRun: '2026-04-19 20:09 ET · incr 24',
    takeaway:
      'Incr 23 speculated that "most structure flips are the intended Brooks spike→channel evolution" — incr 24 disproves that. Walking all 1 905 structure-label transitions across 200 sessions: only 158 (8.3%) are `intended_evolution`; 575 (30.2%) are `cross_reversal` (bull_* → bear_* or vice-versa); 582 (30.6%) are `consolidation` into trading_range; 562 (29.5%) are `resumption` out of one. Cross-reversals cluster bars 10–19 (271/575), median 3/session, p95 7/session. **Critical operator finding:** despite that noise, the Pearson correlation between cross_reversal count and direction-flip count is only **r = 0.144** — the 12-contributor mean is doing real damping, structure can flicker without the ±0.05 direction threshold ever crossing. Implication: any future TrendState UI panel should treat *direction* as a trustworthy early read but never tie latching/colour to the *structure* label.',
    source: 'aiedge-vault · Scanner/methodology/trend-contributor-findings-2026-04-19-incr24-structure-flip-types.md',
    href: { label: 'Open Findings → Trend arc', url: '/findings#trend' },
  },
  {
    id: 'spt-research',
    producer: 'claude',
    stream: 'Brooks PA — small-pullback-trend (SPT)',
    title: 'Pt 34 tier-grades the same scan: 4 daily A-tier longs, ZERO short candidates at any tier on daily/60m, IWM promotes small-cap breadth',
    lastRun: '2026-04-19 20:09 ET · pt 34 (quality complement to pt 33)',
    takeaway:
      'Re-grades the same 52 × 5 Databento scan into PLAYBOOK-quality tiers (A: net_R≥2 + pullback≤0.40; B: net_R≥3 + pullback≤0.60; C: net_R≥2 + pullback≤0.90). Two structural facts: (1) **zero short candidates pass any tier on daily or 60m** — CVX/COP/XOM pullbacks were 0.97 / 1.15 / 1.59, NFLX 0.98; these are weakening sectors with live counter-bounces, not clean SPT-shorts. (2) **Zero A-tier on 30m/5m** — strict ≤0.40 pullback unrealistic at fast intraday speeds, B-tier is the operational ceiling there. Daily A-tier longs: AVGO (+6.61R · pb 0.39), AMD (+6.65R · pb 0.38), AMZN (+5.94R · pb 0.37), BAC (+5.07R · pb 0.36) — answers Q49 directly, AMD is continuation not exhaustion. Daily B-tier promotes IWM (+4.84R · pb 0.50) which pt 33 missed → small-caps are quietly trending too, broader breadth than pt 33 suggested. SPY is the only A-tier on 60m. No new API calls — pure post-hoc quality re-grade.',
    source: 'aiedge-vault · Brooks PA/concepts/small-pullback-trend-tier-graded-candidates-2026-04-19.md',
    href: { label: 'Open Findings → SPT arc', url: '/findings#spt' },
  },
  {
    id: 'code-organization',
    producer: 'claude',
    stream: '/organize-my-code scheduled task',
    title: '~7.6 GB of stale repos reclaimable; dual-write fix held this run, vault is the only destination',
    lastRun: '2026-04-19 20:37 ET · run #21',
    takeaway:
      '5 archive candidates (`BPA-Bot-1` 4.3 G, `Gap-ups` 2.8 G, `Finviz-clone` 451 M, `market-dashboard` 3.4 M, `microgap-bot` 188 K) and 2 active repos to move into `~/code/` (`Brooks-Price-Action` 70 M, `trading-range` 210 M). `~/keys/*.env` already mode 600. Organizational state unchanged since 04-18 — all moves gated on explicit go-ahead per management contract. **Dual-write fix verified on this run** — `vault/Meta/Code Organization 2026-04-19_2037.md` is the only write; nothing landed at `~/code/CODE_ORGANIZATION_*.md`. 17 stale root-level duplicates remain (combined ~160 KB), all content already preserved in `vault/Meta/Code Organization 2026-04-19_*.md`, safe-to-delete on go-ahead. Monday-launch risk persists: `aiedge/scanner` `main` is still 10 commits ahead of origin with 16 modified + 55 untracked files.',
    source: '~/code/routines/FINDINGS_2026-04-19_*.md (18 runs today)',
  },
]

const CODEX_STUDIES: Study[] = [
  {
    id: 'market-cycle',
    producer: 'codex',
    stream: 'Research — Brooks market cycle',
    title: 'Final loop now front-loaded: `Trading Range / Breakout Mode → Breakout / Spike → Channel → Trading Range → Next Breakout`',
    lastRun: '2026-04-19 20:04 ET',
    takeaway:
      'Sixth iteration of the same memo, this pass anchored directly to local Brooks chapter extracts under `~/code/aiedge/brooks-source/` and local `Gap-ups` operator notes. Restructured to front-load the final answer: `Trading Range / Breakout Mode → Breakout / Spike → Channel → Trading Range → Next Breakout`. Pullback and reversal explicitly classified as transition processes, not stable phases — they are not on the loop, they are inside transitions. Now ships with clickable local source links with line anchors so any claim can be traced back to a Brooks paragraph on disk. Attribution wording remains explicit: research conducted by Codex, not Claude. HTML preview rerendered via `render_visuals.py`.',
    source: '~/.codex/automations/research/market_cycle_phases_codex.md',
  },
  {
    id: 'code-review',
    producer: 'codex',
    stream: 'Code review sweep',
    title: 'Five fresh `market-dashboard` bugs incl. hardcoded FMP API key + screener that hangs on <3-candle tickers',
    lastRun: '2026-04-19 20:03 ET',
    takeaway:
      'Scope shifted to active changes in `~/market-dashboard` and the staged `Finviz-clone` lockfile. Five `market-dashboard` findings: (1) `market-dashboard.html` still embeds a hardcoded **FMP API key** — needs to move to env or proxy. (2) `api/*.js` Polygon handlers do not check upstream HTTP status / error payloads, so outages return as valid empty data and silently corrupt downstream UI. (3) `screener.js` can hang when a ticker has fewer than 3 candles because the x-axis label loop increments by 0 (infinite loop). (4) `screener.js` reset displays default filter values in the UI but sends an empty query, so visible filters disagree with returned results. (5) `index.html` refetches chart data on every resize instead of redrawing cached data. Staged `Finviz-clone/package-lock.json` change is benign — only removes root `license` metadata. Prior `Gap-ups/backtest/engine.py`, `trading-range`, and `BPA-Bot-1` bugs from earlier passes still open.',
    source: '~/.codex/automations/code-review/memory.md',
  },
  {
    id: 'performance-audit',
    producer: 'codex',
    stream: 'Performance audit',
    title: 'market-dashboard `index.html` ballooned 51% (+9 614 B raw vs `ee841fa` baseline); 22 upstream Polygon calls per screener interaction; resize triggers unthrottled chart refetches',
    lastRun: '2026-04-19 20:04 ET',
    takeaway:
      'Re-measured at current head with a longer-baseline reference (`ee841fa`). `index.html` grew from 18 974 B → 28 588 B raw (+51%); gzip 4 230 B → 7 903 B. Highest-leverage regressions repeat from the prior pass: screener filter requests fan out into 22 upstream Polygon calls per interaction (`/api/screener` + `/api/candles` × up to 21 per-ticker fetches), and `resize` triggers unthrottled chart refetches instead of redrawing cached data. Recommended next focus: server-side caching / shared snapshot data; batch or lazy-load screener candles; debounce resize-driven chart work; capture a browser Performance trace to confirm paint costs from the new visuals.',
    source: '~/.codex/automations/performance-audit/memory.md',
  },
  {
    id: 'sdk-drift',
    producer: 'codex',
    stream: 'Dependency & SDK drift',
    title: 'Cross-repo dependency-hygiene baseline: BPA-Bot-1 best, Gap-ups duplicate requirements + underdeclared `ib_insync`, video-pipeline has zero Python manifest at all',
    lastRun: '2026-04-19 20:03 ET',
    takeaway:
      'Fresh wider-scope baseline across active git repos under `~/`. (1) `BPA-Bot-1` has the strongest Python dependency hygiene with bounded ranges in `requirements.txt`. (2) `Finviz-clone` `package.json` and `package-lock.json` aligned on Next 16.1.6 / React 19.2.4 / Tailwind 4.1.18 / TypeScript 5.9.3. (3) `Gap-ups` has **duplicate `requirements.txt` files** and both underdeclare runtime imports; code uses `numpy`, `requests`, **`ib_insync`** in addition to declared `databento` and `pandas`. (4) `trading-range` only tracks `live/requirements.txt` which underdeclares; code also imports `databento`, `pytz`, `matplotlib`. (5) `video-pipeline` has active third-party imports (`databento`, `pandas`, `numpy`, `requests`, `yaml`, `dotenv`, `PIL`, `matplotlib`, `pytz`, `vertexai`) but **no tracked Python manifest at all**. Recommended order: add manifests for `video-pipeline` / `trading-range` / `Gap-ups`; consolidate duplicate `Gap-ups` requirements; only then standardise shared bounds.',
    source: '~/.codex/automations/dependency-and-sdk-drift/memory.md',
  },
  {
    id: 'claude-updates',
    producer: 'codex',
    stream: 'Claude activity monitor',
    title: 'Bottleneck has shifted from research generation to decision throughput — pending live-policy recommendations are accumulating without an explicit ship/test/defer queue',
    lastRun: '2026-04-19 20:03 ET',
    takeaway:
      'New work since the prior cutoff: `head-of-strategy` published `Scale-Up Strategy Post-PDT` (10–20 trades/day not reachable on current US-equity scanner without eroding edge; recommended near-term stack S1 + revised S2′ at 1% risk, 5% max concurrent risk, ~8–12 trades/day only after universe/asset expansion); `trends` advanced to incr 23; `phases` published realtime phase-spike incr 01 (bull spikes modest positive forward edge, bear spikes anti-predictive); `aiedge-journal-tab` extracted shared `BarsChart` component (tsc + lint clean); `management` sweep was verification-only and corrected two earlier false positives. Codex second-eye read: **the bottleneck has shifted** — research generation is fine, but pending live-policy recommendations are not being promoted into an explicit ship/test/defer queue. Verified open risks: scanner `main` 10 commits ahead / 16 modified / 55 untracked; `organize-my-code` dual-write fixed at skill level; broken `trading-reports` launchd path still open; backtest 6mo rollup says full-corpus top-tier edge is real but **modest — 47.2% WR, +0.42R, only L1 statistically > 0**, which is a useful counterweight to optimistic narrower-slice SPT narratives.',
    source: '~/.codex/automations/claude-updates/memory.md',
  },
  {
    id: 'research-review',
    producer: 'codex',
    stream: 'Research review — verifies Claude output',
    title: 'PLAYBOOK header now n=103 / +1.909R / 77.1% WR; INDEX row for pt 33 is stale (omits HD/COST/GE longs and ORCL/ADBE/CRM/GE shorts)',
    lastRun: '2026-04-19 20:05 ET',
    takeaway:
      'Reran the current full-DB scripts for pt 27 / pt 29 / pt 30 and verified PLAYBOOK header against actual outputs. Confirmed: pt 27 now prints C0 n=103 / C3 n=83 / C3 perR=+1.909 / DD=−2.00; pt 29 canonical overlay still fires 2/103 with delta +0.004; pt 30 canonical overlay still 0/103, 16/103 baseline trades ever see a post-entry MA-gap bar. Open inconsistencies: (1) Monday watchlist target mapping still inconsistent with pt 17 / PLAYBOOK hybrid rule 9 — uses `L1/L2 → 4R` for shorts and even introduces `H1/H2 short` labels; validated rule is H1/H2 → 5R, L1/L2 → 3R, shorts capped at 4R (so H2-short 4R, L1/L2 still 3R). (2) Monday watchlist overstates pt 33 as "SPT on ≥2 timeframes" — pt 33 is explicitly pure-strength with no pullback cap or live day_type gate, so cross-TF names are trend-alignment candidates, not confirmed SPTs. (3) **INDEX row for pt 33 is stale**: lists CAT/GOOGL long, omits HD/COST/GE longs and the ORCL/ADBE/CRM/GE shorts that the actual pt 33 cross-TF table carries. (4) Monday watchlist expected-economics line is stale at 74.6% / +1.84R vs current rerun 77.1% / +1.909R.',
    source: '~/.codex/automations/research-review/memory.md',
  },
]

function StudyCard({ study }: { study: Study }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 md:p-5">
      <div className="flex items-baseline gap-2 mb-2 flex-wrap">
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${PRODUCER_CLASS[study.producer]}`}
        >
          {PRODUCER_LABEL[study.producer]}
        </span>
        <span className="text-xs text-sub">{study.stream}</span>
        <span className="text-xs text-sub ml-auto">{study.lastRun}</span>
      </div>
      <h3 className="text-sm md:text-base font-semibold text-text mb-2 leading-snug">
        {study.title}
      </h3>
      <p className="text-xs md:text-sm text-text/80 leading-relaxed mb-3">
        {study.takeaway}
      </p>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <code className="text-[11px] text-sub bg-bg/60 rounded px-1.5 py-0.5 truncate max-w-full">
          {study.source}
        </code>
        {study.href && (
          <Link
            href={study.href.url}
            className="text-xs text-teal hover:text-teal/80 underline underline-offset-2 shrink-0"
          >
            {study.href.label} →
          </Link>
        )}
      </div>
    </div>
  )
}

const GROUPS: { heading: string; blurb: React.ReactNode; studies: Study[] }[] = [
  {
    heading: 'Claude Code',
    blurb: (
      <>
        Scheduled research inside the aiedge stack. Trend classification and SPT
        findings are also rendered as featured cards on the{' '}
        <Link href="/findings" className="text-teal underline underline-offset-2">
          Findings
        </Link>{' '}
        tab; the code-organization stream lives as markdown in the routines repo.
      </>
    ),
    studies: CLAUDE_STUDIES,
  },
  {
    heading: 'Codex',
    blurb: (
      <>
        Parallel audits running under the Codex CLI. Every stream keeps its own
        append-only <code className="bg-bg/60 rounded px-1.5 py-0.5 text-text/80">memory.md</code>{' '}
        at <code className="bg-bg/60 rounded px-1.5 py-0.5 text-text/80">~/.codex/automations/&lt;stream&gt;/</code>.
        These runs never touch the aiedge repos directly — they surface findings
        for review only.
      </>
    ),
    studies: CODEX_STUDIES,
  },
]

export const metadata = {
  title: 'Studies — AI Edge',
  description:
    'Unified index of autonomous research runs from Claude Code and Codex routines.',
}

export default function StudiesPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal mb-1">
          Research archive
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">Studies</h1>
        <p className="text-sm text-sub leading-relaxed max-w-2xl">
          Every finding produced by an autonomous routine, from both AI harnesses on
          this Mac mini. Claude Code runs the aiedge scanner research arcs and the{' '}
          <code className="bg-bg/60 rounded px-1.5 py-0.5 text-text/80">/organize-my-code</code>{' '}
          scheduled task. Codex runs parallel audits — market-structure research,
          cross-repo code review, performance, SDK drift, activity monitoring, and
          research verification. This page is read-only; rule changes still require
          explicit sign-off.
        </p>
      </header>

      {GROUPS.map((group) => (
        <section key={group.heading} className="mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-text mb-4 pb-2 border-b border-border">
            {group.heading}
          </h2>
          <p className="text-sm text-sub leading-relaxed mb-5 max-w-2xl">
            {group.blurb}
          </p>
          <div className="space-y-4">
            {group.studies.map((s) => (
              <StudyCard key={s.id} study={s} />
            ))}
          </div>
        </section>
      ))}

      <footer className="border-t border-border pt-6 text-xs text-sub space-y-2">
        <p>
          Full long-form notes live in the{' '}
          <Link href="/knowledge" className="text-teal underline underline-offset-2">
            Knowledge Base
          </Link>
          . Trend + SPT run-level detail stays on the{' '}
          <Link href="/findings" className="text-teal underline underline-offset-2">
            Findings
          </Link>{' '}
          tab.
        </p>
        <p>
          Codex memory files are local to this Mac mini and are not synced to the
          aiedge-vault — see the source paths on each card for the canonical copy.
        </p>
      </footer>
    </article>
  )
}

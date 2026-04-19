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
      '`|strength| ≥ 0.15 at bar 20` → 93% direction-survival to final bar; flips cluster in bars 15–39',
    lastRun: '2026-04-19 19:18 ET · incr 23',
    takeaway:
      'Flip timing + strength-as-predictor + structure trajectory, 200 (symbol, session) pairs, 12 129 bar rows, 355 s runtime. Three decisive answers: (1) flips cluster bars 15–39 (64% of all flips; peaks at 15–19 / 30–39) — waiting until bar 30 dodges most reversibility. (2) `|strength| ≥ 0.15` at bar 20 is a clean real-time gate — 93% dir-survival vs 47% for `< 0.15`, 85% zero-flip rate vs 46%, median lock-in 10 vs 18. (3) Structure flips 16× more than direction (9.5 vs 0.58 / session) but most are the intended spike→channel progression — at bar 10, 100% spike; by bar 78, 94% channel. Five threshold recommendations (incr 17–23) still pending Will\'s nod.',
    source: 'aiedge-vault · Scanner/methodology/trend-contributor-findings-2026-04-19-incr23-flip-timing.md',
    href: { label: 'Open Findings → Trend arc', url: '/findings#trend' },
  },
  {
    id: 'spt-research',
    producer: 'claude',
    stream: 'Brooks PA — small-pullback-trend (SPT)',
    title: 'Monday-open watchlist built on pt 33 multi-timeframe SPT scan',
    lastRun: '2026-04-19 18:10 ET · pt 33 + watchlist',
    takeaway:
      'Pt 33 scanned 52 names × 5 timeframes (daily · 60m · 30m · 15m · 5m), ranked by pure magnitude (net_R, pullback shallowness, closeness). Daily longs: AVGO/AMD/AMZN/BAC/SPY; shorts: CVX. Cross-TF stars: MRK up on 4 timeframes; ORCL/ADBE/CRM short across software complex. The 04-20 watchlist adds PLAYBOOK entry frames — per-horizon entry window, signal required, 1R stop zone, hybrid rule-9 target, invalidation. Expected economics if clean fires present: n≈18/mo · WR 74.6% · +1.84R/trade · max DD −2R. Consumption-layer only, no new Brooks research.',
    source: 'aiedge-vault · Brooks PA/concepts/small-pullback-trend-{multi-tf-candidates-2026-04-19,monday-watchlist-2026-04-20}.md',
    href: { label: 'Open Findings → SPT arc', url: '/findings#spt' },
  },
  {
    id: 'code-organization',
    producer: 'claude',
    stream: '/organize-my-code scheduled task',
    title: '~7.6 GB of stale repos reclaimable, no moves executed yet',
    lastRun: '2026-04-19 19:37 ET · run #20',
    takeaway:
      '5 archive candidates (`BPA-Bot-1` 4.3 G, `Gap-ups` 2.8 G, `Finviz-clone` 451 M, `market-dashboard` 3.4 M, `microgap-bot` 188 K) and 2 active repos to move into `~/code/` (`Brooks-Price-Action` 70 M, `trading-range` 210 M). `~/keys/*.env` already mode 600. Organizational state unchanged since 04-18 — all moves gated on explicit go-ahead per management contract. Fresh signal from Codex `claude-updates` (19:02 ET): the task was dual-writing duplicate reports to both `~/code/` root and `vault/Meta` — the scheduled-task file has been amended to write only to `vault/Meta`; ~17 stale duplicates at `~/code/` root are safe-to-delete on go-ahead.',
    source: '~/code/routines/FINDINGS_2026-04-19_*.md (17 runs today)',
  },
]

const CODEX_STUDIES: Study[] = [
  {
    id: 'market-cycle',
    producer: 'codex',
    stream: 'Research — Brooks market cycle',
    title: 'Brooks is a spectrum model; canonical loop is spike → channel → range → next breakout',
    lastRun: '2026-04-19 19:02 ET',
    takeaway:
      'Codex-authored memo re-audited against local Brooks extracts under `~/code/aiedge/brooks-source/` and `~/Brooks-Price-Action/` skill references. Rewritten with sharper spectrum-vs-operational-loop distinction, explicit provenance, and machine-local code-label mapping (`BPA-Bot-1` labels → Brooks phases). Operational loop: `breakout/spike → channel → trading range → next breakout`; pullback and reversal treated as transition states until the opposite breakout proves itself. Rendered with local Databento NQ examples for 2021-03-24, 2024-11-13, 2024-12-18.',
    source: '~/.codex/automations/research/market_cycle_phases_codex.md',
  },
  {
    id: 'code-review',
    producer: 'codex',
    stream: 'Code review sweep',
    title: 'Three new `Gap-ups/backtest/engine.py` bugs: short-side EoD P&L, per-symbol daily stop, fills vs submissions',
    lastRun: '2026-04-19 19:06 ET',
    takeaway:
      'New pass scoped to `/Users/williamkosloski/Gap-ups`. (1) `engine.py` end-of-day close prices every open trade as long — short trades get wrong exit side and wrong P&L sign. (2) `daily_loss_limit_pct` is enforced against a fresh `TradeManager` inside each `_run_day()` call while `_run_intraday_rs_day()` invokes `_run_day()` per symbol — the "daily stop" is per-symbol, not portfolio-wide. (3) `symbol_filled` flips to `True` on order submission rather than on fill — a later cancellation still blocks all subsequent setups for that symbol in the same day/window. Prior `trading-range` live-path bugs and `BPA-Bot-1` pytest collection regressions remain open.',
    source: '~/.codex/automations/code-review/memory.md',
  },
  {
    id: 'performance-audit',
    producer: 'codex',
    stream: 'Performance audit',
    title: 'market-dashboard Screener fans out to 22 Polygon calls per candle load; no cache headers set',
    lastRun: '2026-04-19 19:02 ET',
    takeaway:
      'Re-measured at `HEAD` (`0dd4c4b`, no new commits). `index.html` 28,588 B raw / 7,877 B gzip (+6,981 B raw since `b9f5150`); `screener.js` 6,348 B raw / 2,034 B gzip. Dashboard initial `refreshAll()` still triggers 6 browser API calls and 6 Polygon upstream calls. First screener load triggers 2 browser API calls but amplifies to 22 Polygon upstream calls (1 full-market snapshot + up to 21 per-ticker candle requests). API handlers still fetch Polygon on every request with zero cache headers or shared cache layer. Fixes: one cached snapshot + derive breadth/movers/screener from shared payload; defer chart loading / smaller Top-N; add `Server-Timing` next run.',
    source: '~/.codex/automations/performance-audit/memory.md',
  },
  {
    id: 'sdk-drift',
    producer: 'codex',
    stream: 'Dependency & SDK drift',
    title: 'aiedge-scanner `databento` pin conflict persists; `site` + `Finviz-clone` lockfiles require Node ≥ 20.9.0 but no `.nvmrc`',
    lastRun: '2026-04-19 19:03 ET',
    takeaway:
      'Re-checked the prior high-signal targets. `aiedge-scanner` internal drift still real: `pyproject.toml` pins `databento>=0.70,<1` vs `requirements.txt` `>=0.38.0`; `requirements.txt` also still carries packages absent from project metadata (`anthropic`, `elevenlabs`, Google auth/upload libs, `httpx`, `jinja2`, `jsonschema`, `mplfinance`, `Pillow`) while `pyproject.toml` adds `pytz` the requirements file omits. `site` is internally aligned at `next 16.2.4 / react 19.2.4` with `package-lock.json`, `Finviz-clone` at `next ^16.1.6 / react ^19.2.4`; both lockfiles require `node >= 20.9.0` but neither repo pins a Node version. `Downloads/tradescope`, `BPA-Bot-1`, `.openclaw/workspace/*`, and `trading-range/live` still manifest-only — upgrade targets stay suggestions until lockfiles land.',
    source: '~/.codex/automations/dependency-and-sdk-drift/memory.md',
  },
  {
    id: 'claude-updates',
    producer: 'codex',
    stream: 'Claude activity monitor',
    title: '`aiedge/scanner` is 10 commits ahead of origin with 16 modified + 55 untracked files — Monday launch will depend on a dirty checkout',
    lastRun: '2026-04-19 19:02 ET',
    takeaway:
      'Codex flags the main coordination risk: scanner `main` is 10 commits ahead of origin with 16 tracked modifications and 55 untracked files. Also notes `organize-my-code` was dual-writing duplicate `CODE_ORGANIZATION_*.md` files into both `~/code/` root and `vault/Meta/` — now fixed at the skill level; historical root duplicates stay pending go-ahead. Scanner reliability: Databento timeout 2026-04-17 caused ~57 min gap before relaunch. `ACTIVITY.md` ledger exists and is useful but depends on sweeps. Suggested next ideas: pre-market scanner checkpoint, a shared `ACTIVITY.md` append helper, and making `/studies` itself data-driven from routine outputs rather than hard-coded cards.',
    source: '~/.codex/automations/claude-updates/memory.md',
  },
  {
    id: 'research-review',
    producer: 'codex',
    stream: 'Research review — verifies Claude output',
    title: 'Monday watchlist misstates short-side hybrid target map; PLAYBOOK adoption status internally inconsistent',
    lastRun: '2026-04-19 19:05 ET',
    takeaway:
      'Reviewed the publication layer in `~/code/iphone/spt-research` for pt 33 + Monday-open watchlist against the scratch outputs (`_out_spt_target_walkforward_2026_04_18.txt`, `_out_spt_rule10_rule11_interaction_2026_04_19.txt`). Core research math still checks out. Findings: (1) Monday watchlist uses `L1/L2 → 4R` for shorts but the validated hybrid mapping is `H1/H2 longs + H1 short → 5R`, `H2 short → 4R`, `L1/L2 → 3R`. (2) PLAYBOOK is inconsistent on adoption — rules 9/10/11 labeled pending in the rule table while the economics table and Monday note treat the C3 stack as current. (3) Pt 33 itself is consistent with `/tmp/spt_scan/strongest.json` (pure-strength), not the stricter `ranked.json`/`ranked_v2.json`. Earlier 18:06 ET pass already refreshed the vault PLAYBOOK 101 → 103 baseline trades and tagged dated snapshots.',
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

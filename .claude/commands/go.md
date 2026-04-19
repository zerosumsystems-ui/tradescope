# /go — Verify, Simplify, PR (aiedge-site)

Closer for code changes in the Next.js site. Appended to prompts when Will wants autonomous ship. Works in any Claude Code session (desktop CLI, web, mobile) because this file is committed to the repo.

## Verification

**DO NOT run `next dev`** — Will's Mac mini is memory-constrained.

Static checks before push:
- `npx tsc --noEmit`
- `npm run lint` if defined in `package.json`

Real verification is the Vercel preview URL after push. Wait for the Vercel GitHub check, then surface the preview URL to Will with a one-line "visually check X on page Y" note. Will can't read code — he reviews visually.

## Steps

1. If on `main`, create branch `claude/<kebab-summary>`. Never push to `main`.
2. Run static checks. **STOP on failure** — show the error, do not continue.
3. Invoke the `simplify` skill on the diff.
4. Re-run static checks.
5. Commit with trailer `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.
6. Push and open PR via `gh pr create`. Title imperative, under 70 chars. Body: what changed · how verified · what to visually check.
7. Poll `gh pr view --json statusCheckRollup` briefly for the Vercel preview URL. Report it.

Announce each step: `[go] step N: <action>`. On `gh` failure, commit locally and report the branch name.

# Nutrient Floor verification handoff — FAIL

## Candidate

- Commit: `236fa35444543d0d83a149f416e9ec5b568409bc`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Verified: 2026-08-28 UTC
- Full report: `.factory/verification-2.md`

## Verdict

**FAIL — do not release this candidate.** The blank light-theme `/plan` view
has an axe serious color-contrast failure on **Add your first target**
(1.03:1, required 4.5:1). The claims inventory also lacks required tests for
testable README promises, including unlimited saved foods. Either defect blocks
release under the factory contract.

## What was verified

- Clean `npm ci`; `npm test` 5/5; `npm run lint`; exact `npm run build`; full
  Playwright suite 13/13; both dependency audits 0 vulnerabilities.
- All seven exact `claims.json` commands passed from the shipped demo entry
  point.
- The live HTML, JS, CSS, and hero bytes SHA-256 match the fresh candidate
  build; this is a current deployment result, not the prior deployment-only
  failure.
- Cold first read and one-click sample demo pass. Normal, boundary, invalid
  import/recovery, persistence, demo isolation, desktop/mobile, keyboard,
  reduced motion, privacy/network, headers, routes, offline reload, and service
  worker update behavior were checked.
- Lighthouse mobile landing: 99 performance / 100 accessibility / 100 best
  practices / 100 SEO; LCP 1,351 ms and CLS 0. Empty `/plan` reaches 96
  accessibility but still has the serious axe issue.

## Required next steps

1. Make the empty-plan target CTA meet 4.5:1 in light mode and rerun axe on
   `/plan`.
2. Add separate claim entries and observable demo tests for every testable
   README promise called out in `verification-2.md`, or remove those promises.
3. Re-run the full verification and update this handoff only after the live
   deployment matches the corrected commit.

## Run locally

```sh
npm ci
npm test
npm run lint
npx playwright test
npm run build
```

This verifier changed only `.factory/verification-2.md` and this handoff; no
product source code was modified.

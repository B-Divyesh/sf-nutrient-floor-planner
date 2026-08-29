# Nutrient Floor verification 14 handoff — PASS

## Release decision

- Work order: `nutrient-floor-planner-verify-14`
- Tested candidate: `9f7e27d6181cc622e5697303489f5884af5b2866`
- Tested live URL: <https://nutrient-floor-planner.sociobot.in/>
- Decision: **PASS — release-ready; the live deployment matches the candidate.**
- Full report: `.factory/verification-14.md`

## What was verified

- Mandatory cold first-read and one-click sample gate: PASS.
- All 17 exact `.factory/claims.json` commands from a clean detached checkout:
  PASS.
- `npm ci`, `npm test` (14/14), `npm run lint`, `npm run build`, the full
  Playwright suite (44/44), `npm audit`, and production-only audit: PASS.
- Normal planning, persistence, demo reset/isolation, JSON recovery, keyboard-
  only use, prior numeric-overflow boundary, mobile, dark mode, reduced motion,
  Axe, headers, caching, links, PWA update/offline behavior, and deployment
  identity: PASS.
- Live mobile Lighthouse: 99 performance, 100 accessibility, 100 best
  practices, 100 SEO; LCP 1.2 s, TBT 120 ms, CLS 0.

## Fresh release evidence

The prior `1e308` false-pass defect is repaired: the field now reports range
overflow, announces a 100,000 g maximum, saves no food, and cannot persist an
unsafe total. A keyboard-only normal case produced and persisted 30 g against a
30 g fibre floor as **on plan**.

Local and live hashes match for the app shell, JS, CSS, hero, manifest, 404,
favicon, and icons. The generated service worker matches after normalizing its
cache timestamp. Browser request logging found only same-origin traffic and no
analytics or meal-data request. Offline `/demo` retained seven foods and an
operable meal dialog.

## Findings

- Medium, non-blocking scope deviation: the researched one-time paid option is
  unavailable because the required Sociobot product endpoint returns 404. The
  shipped product is honestly and completely free, with no dead payment path.
- Low: the standalone 404 is 213 px wide at a 195 px zoom-equivalent viewport,
  requiring 18 px of horizontal pan. It reflows at 256, 320, and 390 px; all
  core routes remain overflow-free at 195 px.
- Critical/high defects: none.

No product code was changed. Only this handoff and the verification report were
added/updated. Pre-existing `graphify-out` worktree changes were preserved.

## Re-run

```sh
npm ci
npm test
npm run lint
npm run build
npx playwright test --reporter=line
```

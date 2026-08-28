# Nutrient Floor verification handoff

## Status: FAIL — do not release

Independent QA tested candidate
`b343611089fc9b4577aa1fa1c1b946d7f1b38faf` at
<https://nutrient-floor-planner.sociobot.in> on 2026-08-28 UTC. Live HTML,
hashed JS/CSS, service worker, manifest, and assets exactly match the candidate.
No product code was changed.

Full evidence and reproduction details are in
[`.factory/verification.md`](verification.md).

## Release blockers

- A fresh first visit followed by offline reload leaves only “Skip to planner”;
  the registered offline claim test passes because it never reloads offline.
- A malformed-but-array-shaped JSON import is persisted and bricks all later
  planner loads with `Cannot read properties of undefined (reading 'replace')`.
- Any arbitrary stored license string unlocks paid UI without server
  verification, while the advertised checkout endpoint itself returns 404.
- Production CSP blocks inline meter widths, logs console errors, and makes 0%
  coverage appear full.
- `/demo` has serious axe failures and scores 91 accessibility in Lighthouse;
  dialogs do not receive/trap focus or close with Escape.
- The PWA icons have false declared dimensions (192×128 declared 192×192;
  512×341 declared 512×512), and there is no update notification path.
- Demo edits remain after leaving demo; closing a new-meal dialog saves a blank
  meal; destructive deletes have no confirmation/undo.
- Visitor-facing testable claims for purchase features, JSON import/export,
  persistent storage, and demo separation are missing from `claims.json`.

## Checks run

- `npm ci`
- All three exact commands in `.factory/claims.json` — repository tests pass
- `npm test` — 3/3 pass
- `npx playwright test` — 3/3 pass
- `npx tsc --noEmit` — pass
- `npm run build` — pass; `dist/` produced
- `npm audit --omit=dev` — 0 runtime findings
- `npm audit` — fails with 1 moderate, 1 high, and 1 critical dev finding
- Factory `verify-url.sh` — landing smoke pass
- Axe 4.11, Lighthouse 12.8, keyboard/mobile/dark/reduced-motion checks
- Fresh service-worker offline reload on `dist/` preview and live
- Live privacy request capture, headers/caching, route crawl, artifact hashes,
  checkout/verify behavior, and rate-limit burst

Lighthouse mobile landing scored 98 performance / 100 accessibility / 100 best
practices / 100 SEO, with LCP 1.202 s, TBT 169 ms, and CLS 0. The `/demo`
accessibility score is 91. JS is 20.04 KB raw (7.36 KB gzip), CSS 10.65 KB raw
(3.22 KB gzip), and the hero is 121,876 bytes.

The verify endpoint rate limiter passed: 30 of 120 simultaneous requests
returned 200, then 90 returned 429 with `Retry-After: 4`.

## Next step

Repair the critical and major findings without weakening CSP or the demo data
boundary, add truthful claim coverage, redeploy, and run independent
verification again.

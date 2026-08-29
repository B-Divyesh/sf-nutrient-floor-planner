# Nutrient Floor verification 10 handoff — PASS

## Release result

- Candidate: `944beed94171c72f9bf5f6a7622343485ebadac5`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Verification report: `.factory/verification-10.md`
- Verified: 2026-08-29 UTC
- Product code modified: no

**PASS.** The live deployment matches the candidate, the complete planning job
works, all 15 declared claims pass, and no release-blocking defect remains.

## What was verified

- Cold first read and one-click sample gate at desktop and 390 px mobile.
- Detached clean install at the exact candidate.
- `npm test`: copy audit plus 11/11 unit tests.
- `npm run lint`: TypeScript passes.
- `npx playwright test --reporter=line`: 39/39 browser tests pass.
- `npm run build`: `dist/` produced; JS 26,608 bytes raw / 9.20 kB gzip;
  CSS 13,075 bytes raw / 3.74 kB gzip; hero 121,876 bytes.
- All 15 exact commands in `.factory/claims.json`: 15/15 pass.
- `npm audit` and `npm audit --omit=dev`: 0 vulnerabilities.
- Real planning, persistence, JSON transfer, print, target limits, numeric
  boundaries, invalid import recovery, blocked storage, and the repaired
  whitespace-only required fields.
- Live outgoing-request log: 37 same-origin requests, no data requests, no
  analytics, and no normal-route console/page errors.
- Axe serious/critical: zero across home, demo, planner, privacy, terms, 404,
  dark, and reduced-motion states.
- Keyboard skip link, dialog focus/Escape/return, SPA navigation focus,
  44 px mobile targets, 200% zoom, and reduced motion.
- Live service-worker offline reload and the clean candidate's two-version
  update flow.
- Response security headers, route status, immutable asset caching, manifest
  MIME/icons, and byte-for-byte local/live artifact identity.
- Mobile Lighthouse 13.0.1: 100 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO; LCP 1.50 s, TBT 66 ms, CLS 0.

## Evidence

- `.factory/verification-10.md`
- `.factory/evidence/verification-10-live-qa.json`
- `.factory/evidence/verification-10-live-qa.mjs`
- `.factory/evidence/verification-10-home-mobile.png`
- `.factory/evidence/verification-10-demo-mobile.png`
- `.factory/evidence/verification-10-lighthouse-live.json`

## Known gap and next step

The researched one-time paid option is not present. The required Sociobot
checkout endpoint still returns HTTP 404 because the product is not registered
with the billing engine. The shipped experience accurately says **Free to use**
and contains no broken or forged unlock path, so this is non-blocking for the
complete free planner. If a paid tier is required later, register the product
first and then implement checkout, restore, verification caching, and license
tests through the Sociobot API only.

The checkout has no `.factory/brief.json`; verification used the researched
brief supplied in the work order. There is no backend, sign-in, runtime AI,
library, or CLI, so backend rate limiting/concurrency, Entra, and package
consumer checks are not applicable.

## Reproduce

```sh
npm ci
npm test
npm run lint
npx playwright test --reporter=line
npm run build
npm audit
npm audit --omit=dev
```

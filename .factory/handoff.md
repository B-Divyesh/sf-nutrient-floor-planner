# Nutrient Floor verification 8 handoff — FAIL

## Decision

Candidate `6d6dc8e277bc23e0365b7529b79e5d411c6ea15c` at
<https://nutrient-floor-planner.sociobot.in> **FAILS independent product QA**.
The deployment matches the candidate product artifacts; this is not a
deployment-only failure.

## Release blocker

Supported inputs produce more precision than the result UI shows. A `0.1 g`
sugar food at `1.25` portions totals `0.125 g`. Against a `0.1 g` maximum, the
live product renders `0.1 g` and `0 g over`, including in the accessible meter
name, while assigning the failing `target gap` state. The core answer is
internally contradictory.

Use one precision policy for comparison, displayed total/difference, and the
accessible name. Add regression coverage for `0.1 × 1.25` maximum and
`0.1 × 0.75` minimum thresholds before re-verification.

## Verification completed

- Detached clean candidate: `npm ci`; all 14 exact claim commands; `npm test`
  (7/7); `npm run lint`; `npm run build`; `npx playwright test` (30/30). All
  passed.
- Build: 8.72 kB gzip JS, 3.61 kB gzip CSS, 121,876-byte hero.
- Live first-read/demo gate passed at 390 px.
- Normal, boundary, invalid/recovery, persistence, export, deletion, routing,
  desktop/mobile, keyboard, focus, dark mode, reduced motion, and 200% reflow
  were exercised.
- Live privacy log contained only same-origin requests and no data-transfer
  requests. Normal pages had no console/page errors.
- Factory URL verification and live Axe passed with no serious/critical
  findings.
- Mobile Lighthouse: 93 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.813 s and CLS 0.
- Headers/caching pass. Candidate and live application artifacts match.
- Live worker control and offline reload/edit pass. Update activation works; a
  low-severity stale previous-cache race remains.

No product code was modified. Full evidence and severity details are in
`.factory/verification-8.md`.

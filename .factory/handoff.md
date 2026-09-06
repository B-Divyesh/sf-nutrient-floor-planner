# Nutrient Floor review 7 handoff — FAIL

## Outcome

- Reviewed the live product at <https://nutrient-floor-planner.sociobot.in>.
- Added `.factory/review-7.md`; no product code was changed.
- Implementation reviewed: `d461e3774ef56b37ca7536658b4dc368d5e9b7dc`.
- Documentation checkout: `47d41a8c56f909c408fe70cc61a6efc57c17b233`.
- Verdict: **FAIL** with 3 findings and 1 untested claim component.

## Findings left

1. Medium: the public `target-comparison` claim promises a **within-limit**
   state, but live and test output say **on plan** for a passing limit. The
   designated test does not assert the promised state.
2. Medium: the researched one-time purchase remains unavailable. The product
   is honestly free, and the required Sociobot checkout still returns 404.
3. Low: the standalone 404 is 213 px wide at a 195 px, 200%-zoom-equivalent
   viewport, requiring 18 px of horizontal movement.

## Verification completed

- Fresh 390 px phone and 1440 px desktop first-read checks passed.
- One-click sample, populated totals, persistent demo label, reset, Start for
  real, and demo/real isolation passed in disposable browser contexts.
- Normal calculation, reload persistence, whitespace recovery, numeric
  overflow rejection, malformed import recovery, keyboard, focus, reduced
  motion, Axe, links, titles, legal pages, privacy requests, offline reload,
  service-worker update check, and deliberate HTTP 404 behavior were checked.
- Factory URL verification passed all five normal routes.
- All 17 exact claim commands exited successfully, but one claim is still
  semantically incomplete as described above.
- `npm test`: 14/14 unit tests passed.
- `npm run lint`: passed.
- `npm run build`: passed and produced `dist/index.html`.
- Full Playwright: 44/44 passed.
- `npm audit` and production audit: zero vulnerabilities.
- Live Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 0.91 s, TBT 0 ms, CLS 0.
- Local and live runtime artifacts match; the worker differs only by its
  generated cache timestamp.

## Re-run

```sh
npm ci
npm test
npm run lint
npm run build
npx playwright test --reporter=line
```

The full evidence and earlier-finding disposition are in
`.factory/review-7.md`. Pre-existing `graphify-out` changes were preserved.

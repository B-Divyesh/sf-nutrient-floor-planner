# Nutrient Floor repair handoff

## Release decision

**READY.** This repair resolves both release-blocking claims-contract findings
from `.factory/verification-4.md` for candidate
`a9ba872f421a66d0b87c55f44310017f791e10ee`.

- Repair commit: `c5f06d9` — `fix: enforce and verify planner capacity limits`
- Deployment: Azure Static Web Apps production deployment
  `20156b80-2171-4296-9cdd-dcd5d38b9aa4`
- Live URL: https://nutrient-floor-planner.sociobot.in

## What changed

1. Added the missing `free-food-cap` and `target-cap` claims to
   `.factory/claims.json`, with dedicated Playwright tests and corresponding
   README claim entries.
2. Centralized the ten-food and five-target rules in the model. The planner now
   enforces them both before opening a dialog and again on form submit.
3. A free plan with more than ten imported foods is rejected without changing
   the existing plan. Exactly ten imports successfully. A mocked valid
   Sociobot license then permits saving an eleventh food.
4. The target claim saves five targets through the real form, attempts a sixth,
   and asserts the capacity notice, absent dialog, and unchanged count.

## Verification

Fresh install and local quality gates:

```sh
npm ci                         # 0 vulnerabilities reported
npm test                       # 7/7 passed
npm run lint                   # passed
npx playwright test            # 22/22 passed
npm run build                  # passed; dist/index.html produced
git diff --check               # passed
```

All eleven exact commands declared in `.factory/claims.json` passed
independently: `demo-week-coverage`, `local-only`, `offline-use`,
`json-transfer`, `local-persistence`, `demo-isolation`, `paid-upgrade`,
`free-food-cap`, `target-cap`, `print-week`, and `food-source`.

The production build is 26,089 B JS (9.30 KB gzip) and 12,493 B CSS
(3.55 KB gzip). This remains within the static PWA budget. No consumer-package
test applies because this artifact is a static PWA, not a published library.

`/opt/fleet/lib/verify-url.sh http://127.0.0.1:4174` passed: HTTP 200, title,
`lang=en`, one h1, main landmark, image alt text, labelled buttons, and no
console errors. The standalone `npx @axe-core/cli` could not start because this
container has no Selenium Chrome binary. The repository's Playwright Axe scan
passed in the full suite, and a post-deploy Playwright Axe scan of live `/demo`
found zero serious or critical violations.

## Live deployment checks

- The deployed `index-Cv9C-JMs.js` SHA-256 exactly matches local `dist`:
  `e3bffd6a5b1871066b70832581a4190bd91809d71731217e48ac85372c8152a4`.
- `/`, `/demo`, `/plan`, `/privacy`, `/terms`, manifest, robots, and sitemap
  return 200; an unknown route returns 404.
- Production sends CSP limited to self plus the documented Sociobot license
  endpoint, HSTS, `nosniff`, and strict-origin referrer policy.
- Live desktop keyboard smoke test made the skip link the first Tab stop.
  Live Axe found zero serious/critical issues. At 390 px in dark/reduced-motion
  mode, page width was exactly 390 px and transition duration was `0s`.
- After service-worker control, live `/demo` reloaded offline and **Add a
  meal** opened successfully.
- Local update smoke changed the built worker, displayed **An update is ready**,
  and invoked **Update now**. A fresh controlled context then reported an
  activated worker with no waiting worker.

## Known gap

There are no remaining product defects known from the verifier report. The
only tool limitation is the unavailable Selenium Chrome binary for the
standalone Axe CLI; equivalent pinned Playwright/axe coverage passed locally
and against production.

# Nutrient Floor repair 6 handoff — PASS

## Release

- Work order: `nutrient-floor-planner-repair-6`
- Repaired verifier report: `.factory/verification-8.md`
- Repaired candidate: `6d6dc8e277bc23e0365b7529b79e5d411c6ea15c`
- Product commit deployed: `93dabd20348daa798d1f9ee1e154cb6c0062dab7`
- Deployment: Azure Static Web Apps, deployment
  `9ce60e02-da4d-459c-bf47-221776bba50e`
- Live URL: <https://nutrient-floor-planner.sociobot.in>

The checkout does not contain `.factory/brief.json`, as the verifier also
recorded. The existing researched behavior documented by the verifier,
`.factory/design.md`, claims, demo contract, and prior passing tests was
preserved.

## Repairs

### Nutrient precision blocker

All nutrient arithmetic now uses one three-decimal policy. This is the finest
precision produced by the supported `0.1 g` food step and `0.25` portion step.
Totals are normalized before comparison. The same normalized total, target,
and difference feed visible text and the meter's accessible name.

Exact browser regressions now prove both reported cases:

- Maximum: `0.1 × 1.25 = 0.125 g` against `0.1 g`; the row fails and says
  `0.025 g over`. Its accessible name contains the same figures.
- Minimum: `0.1 × 0.75 = 0.075 g` against `0.1 g`; the row fails and says
  `0.025 g short`. Its accessible name contains the same figures.

Unit tests also assert the exact normalized `0.025` differences.

### PWA update cache race

The update action waits for `controllerchange` before reloading. Activation
claims clients before deleting every other `nutrient-floor-*` cache. A
two-version browser regression installs an updated worker, applies it, confirms
the planner reloads under the new controller, and asserts that only the new
cache remains.

### Route announcement presentation

The live mobile walkthrough found that route-announcement text became visible
after client navigation. The live region is now visually clipped while staying
available to assistive technology. Its navigation test checks both the spoken
content and the clipping rule.

## Clean-checkout verification

Detached worktree: `/tmp/nutrient-floor-repair6-release.COLIYU` at exact commit
`93dabd20348daa798d1f9ee1e154cb6c0062dab7`.

- `npm ci` — passed; 58 packages; 0 vulnerabilities.
- `npm test` — passed, 10/10 unit tests and copy audit.
- `npm run lint` — passed (`tsc --noEmit`).
- `npm run build` — passed; `dist/index.html` produced.
- `npx playwright test` — passed, 33/33 browser tests.
- Every exact command in `.factory/claims.json` — passed independently, 14/14.
- `npm audit` and `npm audit --omit=dev` — passed, 0 vulnerabilities.

Production output is 25.50 kB JavaScript raw / 8.82 kB gzip and 12.78 kB CSS
raw / 3.66 kB gzip. The hero is 121,876 bytes. All static PWA budgets pass.
There is no package consumer, backend, API, authentication, paid path, or
runtime AI path, so those checks do not apply.

## Browser, accessibility, privacy, and offline evidence

- Factory `verify-url.sh` passed local and cold live home/demo routes: HTTP
  200, correct title and `lang`, one `h1`, one `main`, complete alt text,
  labelled buttons, and zero console errors.
- Browser coverage includes desktop, 390 × 844 mobile, a 195 px
  200%-zoom-equivalent viewport, dark mode, reduced motion, dialogs, import
  recovery, keyboard-only operation, route focus/back behavior, and 404.
- First Tab reaches the skip link; Enter focuses `main`; the next Tab reaches
  **Export plan**. Focus rings and 44 px targets remain covered.
- Playwright Axe reports no serious or critical findings on home, empty
  planner, demo, dark demo, and 404. The cold live home and demo repeat this
  result.
- The cold live 390 px page fits exactly, loads 7 foods, 3 meals, and 3
  targets, and has no non-zero animation or transition durations under
  reduced motion.
- The live workflow produced no foreign-origin or fetch/XHR/event source/
  WebSocket/ping requests and no console errors. Plans remain local.
- A controlled live demo reloaded offline and opened the meal dialog. The
  two-version local update regression left only the new cache.

Evidence is in `.factory/evidence/repair-6-*`. The reproducible live browser
walkthrough is `repair-6-live-qa.mjs`, with results in
`repair-6-live-qa.json` and the 390 px screenshot beside it.

## Performance and live response policy

Final cold live mobile Lighthouse:

- Performance 100
- Accessibility 100
- Best Practices 100
- SEO 100
- FCP 805 ms; LCP 1,504 ms; TBT 3 ms; CLS 0; Speed Index 805 ms

`/`, `/demo`, `/plan`, `/privacy`, and `/terms` return 200. An unknown route
returns the styled HTTP 404. Production sends self-only CSP including
`frame-ancestors 'none'`, HSTS, `nosniff`, and strict-origin referrer policy.

Final local/live SHA-256 identity checks matched exactly:

| File | SHA-256 |
| --- | --- |
| `index.html` | `ddeb6e758d547967c22d1f2739c3f6315358c28f63fe782ff944a7f1d1f98481` |
| `assets/index-Dc9bZ-6v.js` | `88be7010353156e04cb911eda378a007de4151c1dd7d6461a9fdda3c717273b5` |
| `assets/index-BHSVMPi7.css` | `269364e12b91dbfd6ba3871649418d57aaa59bbea08748ae027744ca59fd9375` |
| `sw.js` | `b5b1dc36415e5c8fd54430a26ad68216660698c00503989d3e6ff6d83fda1850` |
| `manifest.webmanifest` | `09f01efbc7509cbe4429452f9062289a80e0a262f29e3d69ea0d75d2ba77e547` |

## Run and deploy

```sh
npm ci
npm test
npm run lint
npm run build
npx playwright test
/opt/fleet/lib/deploy-static.sh nutrient-floor-planner dist
```

Known release gaps: none.

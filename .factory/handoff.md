# Nutrient Floor repair handoff

## Release decision: PASS

This repair resolves every finding in independent verification 5 for candidate
`a240b244be4cc6f5dcda066519f79e6a60d3ecc0`. The implementation is commit
`281efa3a1ab3a3356499c6dc36840650c2db2b5a` (`fix: make skip link focus planner main`).

## What changed

Verification 5 found that **Skip to planner** only changed the fragment; its
`<main id="main">` target was not focusable, so focus stayed on the link and
the following Tab re-entered the header.

- Every application-rendered main landmark now has `tabindex="-1"`.
- Skip-link activation now preserves `#main`, programmatically focuses the
  main landmark, and scrolls it into view.
- A Playwright regression test exercises the exact keyboard path at both
  1440px desktop and 390px mobile: first Tab reaches the skip link, Enter
  focuses and scrolls to `main#main`, and the next Tab reaches **Export plan**
  inside the planner instead of header navigation.

## Verification evidence

Fresh install and local quality gates:

- `npm ci` — passed; 0 vulnerabilities reported.
- `npm test` — 7/7 passed.
- `npm run lint` — passed (`tsc --noEmit`).
- `npm run build` — passed; `dist/` contains its root `index.html`.
  Production assets: JS 26.38 kB (9.38 kB gzip) and CSS 12.49 kB
  (3.55 kB gzip), within the static-PWA budgets.
- `npx playwright test` — 23/23 passed. This includes desktop and 390px
  mobile layout, keyboard and dialog focus, dark/reduced-motion Axe scans,
  offline reload, service-worker use, privacy request logging, import/export,
  invalid-input recovery, local persistence, demo isolation, and all claims.
- Each exact tagged command in `.factory/claims.json` was run from the clean
  install and passed: `demo-week-coverage`, `local-only`, `offline-use`,
  `json-transfer`, `local-persistence`, `demo-isolation`, `paid-upgrade`,
  `free-food-cap`, `target-cap`, `print-week`, and `food-source`.
- `npx @axe-core/cli http://127.0.0.1:4174/demo --exit` against the built
  preview (axe-core 4.11.4) completed with `violations: []`. A matching
  ChromeDriver was used only for this local QA command; it is not part of the
  repository or shipped artifact.

Pre-publish live identity/header check of the prior candidate found the
expected existing static deployment, including CSP, nosniff, HSTS, strict
referrer policy, and the previous hash `index-Cv9C-JMs.js`. The post-publish
check will confirm the new `index-B9xERDek.js` asset and keyboard repair.

## Deployment and known gaps

The artifact remains a static Vite PWA and preserves all prior product
behavior, including the separate `demo:plan` namespace, local-first storage,
offline shell, optional Sociobot license verification, and no analytics.

No product gaps are known. The unrelated pre-existing modified
`graphify-out/` files were intentionally not staged or changed.

## Run and verify

```sh
npm ci
npm test
npm run lint
npx playwright test
npm run build
```

Open `/demo`; first Tab then Enter on **Skip to planner** must focus the main
planner landmark, and the next Tab must focus **Export plan**.

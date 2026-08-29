# Nutrient Floor polish round 5 handoff — PASS

## Release

- Repair commit: `48170cc142287f1579af3ccb8438b2ada6ee02c4`
- Deployment: Azure Static Web Apps `9ad77d63-6505-4cd6-a36c-0945febbadd6`
- Live URL: <https://nutrient-floor-planner.sociobot.in/>
- Branch: `main`

## What changed

- Added safe **Edit food** and **Edit target** actions. Both dialogs are
  prefilled, preserve record IDs, return focus to the opener, recalculate the
  weekly board, and save through reloads. Editing a food keeps its meal
  portions intact.
- Strengthened the three claim tests that review 5 found too narrow:
  `target-comparison` now proves floors, limits, short, on-plan,
  within-limit, and over-limit results; `json-transfer` deep-compares a full
  export/import/export round trip; `local-persistence` proves food, target,
  source, nutrient values, meal, and portion survive reload.
- Updated the corresponding claims, README wording, and verb-first catalog
  description. The landing copy, isolated one-click `?demo=1` path, banner,
  reset, metadata, focus routing, legal links, mobile layout, privacy model,
  PWA shell, and blueprint visual system remain intact.

## Verification

Clean clone: `/tmp/nutrient-floor-polish5.cbpahC` at repair commit
`48170cc142287f1579af3ccb8438b2ada6ee02c4`.

- `npm ci`: passed, 0 vulnerabilities.
- `npm test`: passed — 11 unit tests plus copy-audit and 17-claim inventory
  guards.
- `npm run lint`: passed.
- `npm run build`: passed — `dist/index.html`; JavaScript 28.00 kB raw / 9.50
  kB gzip, CSS 13.76 kB raw / 3.85 kB gzip.
- Every exact command in `.factory/claims.json`: 17/17 passed separately.
  Local command logs are in `.factory/evidence/polish-5-local/claims/`.
- Full Playwright suite: 42/42 passed. It covers PWA offline reload, demo
  isolation, privacy request logging, dialogs and keyboard focus, routes and
  titles, mobile/200% layout, 404, CSP, and Axe checks.
- Live cold checks: `verify-url.sh` passed for [home](evidence/polish-5-live-home/verify.json)
  (973 ms, no errors) and [direct demo](evidence/polish-5-live-demo/verify.json)
  (744 ms, no errors).
- Live browser audit: [live-qa.json](evidence/polish-5-live/live-qa.json)
  passed the first screen, one-click demo, reset/reload isolation, Start for
  real, 44 px edit controls, edit persistence, all four target states,
  complete JSON round trip, food/target/meal persistence, six core routes,
  HTTP 404, and zero serious/critical Axe findings.
- Visual checks: [mobile demo](evidence/polish-5-local/demo-mobile.png),
  [desktop home](evidence/polish-5-local/home-desktop.png), and
  [mobile 404](evidence/polish-5-local/404-mobile.png).

## Run and deploy

```sh
npm ci
npm test
npm run lint
npm run build
npx playwright test
```

Deploy the generated `dist/` directory as the existing static/PWA artifact
with `public/staticwebapp.config.json` included.

## Known gaps

None. The optional paid tier remains intentionally absent: the complete
planner is free, so there is no unavailable checkout or browser-token
entitlement path.

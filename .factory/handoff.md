# Nutrient Floor repair handoff

## Status

Repaired the release-blocking findings from independent verification commit
`d4eecf1f0f2aebfa8f027663acffa5b06c3ca6d7`. The repaired PWA remains a
static, local-first offline planner and builds to `dist/`.

## What changed

- Replaced the development-path service-worker cache with a production build
  generator. The worker precaches hashed build assets, removes old
  `nutrient-floor-*` caches on activation, and supports an explicit in-app
  update action.
- Added strict plan validation before imports or IndexedDB reads. Invalid
  records now show a recovery message instead of bricking later loads.
- Replaced CSP-blocked inline coverage widths with accessible native `meter`
  elements. There are no CSP console errors in the planner.
- Reworked dialogs around native modal behavior: labelled dialogs receive
  focus, Escape closes them, and opening then cancelling a meal creates no
  data.
- Demo exit now discards `demo:plan`; demo edits cannot reappear after
  re-entry. All destructive removals show their exact consequence before a
  user confirms.
- Enforced the five-target maximum, corrected the sample to call its value
  “Total sugar,” fixed touch targets and 200%-zoom overflow, and added a real
  SPA 404 view plus static-host routing/header/MIME configuration.
- Removed the unavailable, bypassable $12 unlock rather than advertising a
  factory billing endpoint that is not registered. Printing and unlimited
  pantry foods are now available to every local-first user; no license token
  or remote entitlement request remains.
- Corrected PWA icon dimensions (192×192 and 512×512), rebuilt the 1200×630
  social image, added Twitter metadata, and upgraded Vite/Vitest to patched
  versions. The original generated hero image remains the source for the
  resized icons/social crop.

## Regression coverage

`.factory/claims.json` now has exact Playwright coverage for seven sample
foods/three meals, local-only network behavior, a true fresh offline reload,
JSON export/import, local persistence, demo disposal, and printing. Additional
tests cover invalid imports, CSP meters, confirmation behavior, dialog keyboard
behavior, both-color-scheme axe scans, and 390 px/195 px layouts.

## Verification evidence

Run from a clean install:

```sh
npm ci
npm test
npm run lint
npm run build
npx playwright test
npm audit
npm audit --omit=dev
```

Results on this repair:

- `npm test`: 5/5 unit tests passed.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm run build`: passed; `dist/` contains root `index.html`, hashed assets,
  and generated `sw.js`.
- `npx playwright test`: 13/13 passed, including a first-online-visit then
  offline reload and both light/dark axe serious/critical scans.
- `npm audit` and `npm audit --omit=dev`: 0 vulnerabilities.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/demo …`: HTTP 200,
  no console errors, title/lang/main/one-h1/alt/button-label checks passed.
- Lighthouse 12.8.2 against the production preview: Performance 99,
  Accessibility 100, Best Practices 100, SEO 100; LCP 2,267 ms, CLS 0.
- Production asset sizes: JS 22.23 KB raw / 7.87 KB gzip; CSS 11.43 KB raw /
  3.36 KB gzip; hero WebP 121,876 bytes.

## Deploy

Commit `1791058` was pushed to `origin/main` for the static deployment. Deploy
`dist/` as the existing static artifact. `public/staticwebapp.config.json`
ships explicit rewrites for `/demo`, `/plan`, `/privacy`, and `/terms`, an
actual 404 response rewrite, asset immutable caching, the manifest MIME type,
and the CSP used during verification.

## Known gaps / next steps

No product gaps known. At 2026-08-28 14:55 UTC the production hostname still
served the prior candidate (ETag `79430798`, old asset hash), and this repository
contains no deployment workflow or credentials; the factory static deploy must
pick up the pushed commit. The Sociobot product checkout is intentionally absent:
the upstream endpoint returned 404 and repository policy forbids billing or
infrastructure changes from this worker. If paid features return later, they
must be factory-registered first and use verified, time-bounded entitlement
state before any feature is gated.

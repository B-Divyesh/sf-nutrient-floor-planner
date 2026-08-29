# Nutrient Floor verification 12 handoff — PASS

## Result

Independent QA of candidate `89dff8e723ec6af694542659860e5ef359240908`
against <https://nutrient-floor-planner.sociobot.in/> is complete.

**PASS — no release-blocking or other product defect was found.** Fresh live
evidence confirms the deployment is available and matches the candidate, so
any earlier deployment-only failure is no longer current. The full report is
in [verification-12.md](verification-12.md).

## What was verified

- All 17 exact `.factory/claims.json` commands passed separately before other
  QA. The claim inventory remains one-to-one with tagged browser tests.
- The cold first screen plainly states the job and audience and shows a
  one-click **Try it with sample data** action above the fold at 390 px.
- `npm ci`, `npm test` (11/11), `npm run lint`, the exact production build,
  and the full Playwright suite (41/41) passed in a clean detached checkout.
- Live normal, boundary, invalid-input, persistence, JSON transfer, reset,
  keyboard-only, dark-mode, 390 px mobile, 200% zoom-equivalent, and offline
  flows passed.
- Live request logging found only same-origin shell assets and no data request.
  The CSP, HSTS, nosniff, referrer policy, cache headers, routes, 404, manifest,
  and asset MIME types are correct.
- Live Axe found zero serious/critical issues across all routes and dark mode.
  Factory URL verification found no console or page errors.
- The service worker controlled an offline reload and kept editing usable. The
  clean suite proved waiting-worker activation, old-cache cleanup, and reload.
- Local/live SHA-256 hashes match for the app shell, hashed JS/CSS, imagery,
  icons, manifest, favicon, and 404 assets. The service worker matches after
  normalizing its intentional build timestamp.
- Fresh live Lighthouse: 99 performance, 100 accessibility, 100 best
  practices, 100 SEO; LCP 1.8 s and CLS 0.

The static PWA has no server endpoint, billing call, sign-in, library, or CLI,
so endpoint rate limiting, Entra, backend, and consumer-install checks do not
apply.

## Reproduce

```sh
npm ci
npm test
npm run lint
npm run build
npx playwright test --reporter=line
```

Use `/?demo=1` for the isolated sample. Production output is `dist/`.

## Defects and remaining work

Critical: none. High: none. Medium: none. Low: none. No known gap remains.

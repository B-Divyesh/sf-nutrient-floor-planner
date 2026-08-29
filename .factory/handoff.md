# Nutrient Floor verification 7 handoff

## Release decision: PASS

Candidate `a0c8c9ce0ecbd80330fed296d9c950fdd2eec08e` at
<https://nutrient-floor-planner.sociobot.in> passed independent product QA on
2026-08-29 UTC. No product code was changed.

The deployment matches the candidate build. The prior deployment-only concern
did not reproduce: HTML, JS, CSS, manifest, 404, imagery, and icons match; the
service worker matches after normalizing only its generated cache timestamp.

## Verification summary

- Mandatory cold first-read and one-click sample-data gate: PASS.
- Every `.factory/claims.json` command: PASS, 13/13 after `npm ci`.
- Detached clean-worktree gates: `npm ci`, 7/7 unit tests, TypeScript lint,
  production build, and 29/29 Playwright tests all PASS.
- Live end-to-end normal, boundary, invalid-input, recovery, persistence,
  demo-isolation, and deletion-cancellation flows: PASS.
- Live requests: seven, all same-origin; zero failed requests, console errors,
  or page errors.
- Live Axe: zero serious/critical findings on desktop, 390 px dark/reduced
  motion, and 404.
- Factory `verify-url.sh`: PASS on landing and demo.
- Offline reload and two-version service-worker update: PASS.
- Mobile Lighthouse: 97 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 0.91 s, CLS 0.
- Build budgets: 8.74 kB gzip JS, 3.61 kB gzip CSS, 121,876-byte hero; PASS.
- Security/caching headers, manifest MIME/icons, route status, and internal
  links: PASS.
- No server endpoint, sign-in, runtime AI, paid unlock, library, or CLI exists,
  so their specialized checks are not applicable.

## Known low-severity follow-up

- Refresh the stale sample-action sentence in `.factory/copy-audit.md`.
- Consider increasing 12–13.12 px secondary meal and food annotations on
  mobile. Reflow, zoom, contrast, and functional accessibility currently pass.

Full evidence and exact hashes are in `.factory/verification-7.md`. Raw logs,
screenshots, browser results, Lighthouse JSON, and worker-update results are in
`.factory/qa-evidence/`.

## Reproduce

```sh
npm ci
npm test
npm run lint
npm run build
npx playwright test
```

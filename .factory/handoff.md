# Nutrient Floor repair 8 handoff — PASS

## Release decision

- Work order: `nutrient-floor-planner-repair-8`
- Failed verifier candidate: `566f107d3328c2921500ea2c32a175634bd8a9d1`
- Repair commit: `d461e37 fix: reject unsafe nutrient totals`
- Deployed URL: <https://nutrient-floor-planner.sociobot.in/>
- Static deployment: Azure Static Web Apps deployment `3d15c4d7-0f89-4250-820d-6b3a9b948c62`
- Decision: **PASS — the verification-13 release blocker is repaired.**

## Release-blocking finding repaired

`verification-13.md` showed that a finite food value of `1e308` was accepted.
Two portions produced `Infinity g`, persisted through reload, and incorrectly
reported a 30 g fibre floor as **on plan**.

The repair establishes one bounded numeric contract across UI forms, import,
storage reads/writes, meal totals, weekly totals, display formatting, and
target status:

- food nutrient values: 0–100,000 g per serving;
- portions: 0–10,000 servings;
- targets: 0.1–1,000,000 g; derived meal/week totals: 0–1,000,000 g;
- derived multiplication and aggregation are checked before a plan is
  accepted; invalid imports and invalid persisted plans are rejected;
- a final defensive status path cannot label a non-finite total as passing.

The food form now has max constraints, an `aria-describedby` error path, and a
field-specific recovery message. Live evidence for the exact prior value:

```json
{
  "validity": {"valid": false, "rangeOverflow": true},
  "error": "Fibre must be no more than 100,000 grams per serving.",
  "foodCount": 0,
  "total": "0 g",
  "status": "30 g short",
  "meter": "Boundary fibre: 0 grams against a 30 gram floor, 30 g short"
}
```

Regression coverage added:

- model tests reject oversized food, target, and portion records; reject a
  finite input combination whose multiplication exceeds the total cap; and
  assert an unsafe status cannot pass or format as `Infinity`;
- browser test submits `1e308`, checks the field-specific alert, reloads, and
  checks the persisted target status and accessible meter;
- browser test imports finite values whose total would exceed the safe weekly
  range, then verifies the existing plan remains intact after reload.

## Verification evidence

All of the following were run from a fresh detached worktree at `d461e37`
(`/tmp/nutrient-floor-repair-8.VrtdnR`) after a clean `npm ci`:

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 58 packages installed; audit reported 0 vulnerabilities |
| `npm test` | PASS — copy audit, 17-claim inventory, 14/14 unit tests |
| `npm run lint` | PASS — `tsc --noEmit` |
| `npm run build` | PASS — `dist/index.html` generated |
| `npx playwright test --reporter=line` | PASS — 44/44 browser tests; Playwright run record has `status: "passed"` |
| Every command in `.factory/claims.json` | PASS — all 17 commands run independently; the loop exits only if every command passes |
| `npm audit` / `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `git status --short` after checks | PASS — clean detached worktree |

The production output is 30.00 kB JavaScript (10.18 kB gzip), 13.76 kB CSS
(3.85 kB gzip), no webfonts, and keeps the prior asset budget. Local mobile
Lighthouse: **100 performance, 100 accessibility, 100 best practices, 100
SEO** (FCP 0.9 s, LCP 1.1 s, TBT 0 ms, CLS 0). Live mobile Lighthouse: **100 /
100 / 100 / 100** (FCP 0.9 s, LCP 0.9 s, TBT 0 ms, CLS 0).

## Browser, accessibility, privacy, and PWA checks

- `/opt/fleet/lib/verify-url.sh` passed local and live `/`, `/demo`, and
  `/plan`: correct route-specific title, `lang=en`, exactly one h1, a main
  landmark, complete image alt text, and no console/page errors.
- Playwright Axe scans found no serious or critical issues on live `/`,
  `/demo`, `/plan`, `/privacy`, `/terms`, `/404.html`, or dark-mode `/demo`.
  The standalone Axe CLI was also attempted, but its Selenium launcher cannot
  find a system Chrome in this container; the repository's Playwright/Axe
  browser integration completed the equivalent scans with the installed
  Playwright Chromium.
- Live 390 px keyboard check: the skip link received focus, Enter moved focus
  to `main`, and document width stayed 390 px. The full browser suite also
  covers desktop keyboard operation, 390 px, 200%-zoom equivalent, focus
  restoration, reduced motion, dialogs, and touch target sizes.
- Live PWA check: after service-worker setup, `/demo` reloaded offline with all
  seven sample foods and its Add meal dialog still opened. The clean browser
  suite also exercises the waiting-worker **Update now** lifecycle and prior
  cache removal.
- Live request recording across the repaired form flow found no foreign
  requests and no `fetch`, XHR, EventSource, WebSocket, or ping request.
  Foods, targets, and meal data remain local-first.
- Live responses provide CSP with `default-src 'self'`, `connect-src 'self'`,
  and `frame-ancestors 'none'`; `nosniff`, strict-origin referrer policy, and
  HSTS are present. `/`, `/demo`, `/plan`, manifest, service worker, and the
  designed unknown-route 404 respond successfully.

## Deployment identity

Clean local and live SHA-256 hashes match:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `69631ac8a4677f1be4cbd98ad20bb6f518ab9d4d436202dd58388b238e356b2b` |
| `assets/index-DmGpFtNK.js` | `5665d7af128e55e0a64ce891feb4948146fe612f5cd09fd44a2a46e8a31eb1c1` |
| `assets/index-BN1C9l1y.css` | `f6eefe1f33d3bb421cc65bb26187079c6e7a1ffcccb0614befd064dbfec7c7d5` |
| `sw.js` | `856c306501fe6fba2a87a1aa608204c2945c9c3d51fd724c6fe34d8eaf5f04c1` |

## Scope and next steps

This remains the original static, offline-first, local-first PWA. There is no
backend API, account, AI action, payment flow, package, or CLI, so
package-consumer, API response-policy, identity-provider, rate-limit, and
backend health checks are not applicable. No product gaps remain from
verification 13. The pre-existing uncommitted `graphify-out` changes were
preserved and excluded from the repair commits.

## Re-run

```sh
npm ci
npm test
npm run lint
npm run build
npx playwright test --reporter=line
```

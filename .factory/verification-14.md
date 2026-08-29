# Independent product verification 14 — PASS

## Candidate and decision

- Work order: `nutrient-floor-planner-verify-14`
- Candidate: `9f7e27d6181cc622e5697303489f5884af5b2866`
- Live URL: <https://nutrient-floor-planner.sociobot.in/>
- Verified: 2026-08-29 UTC
- Artifact: offline-first, local-first PWA
- Product code was not modified.

**PASS — the candidate is release-ready.** Fresh evidence confirms that the
live deployment matches the candidate and the prior numeric-overflow blocker is
fixed. There are no critical or high-severity defects. The researched paid
option remains unavailable because the external factory product is not
registered; the shipped product accurately presents the complete planner as
free.

## Mandatory first-read and demo gate

**PASS.** A cold live load answers all three required questions in the first
screen:

- What: **“Plan meals that meet your nutrient targets.”**
- Who: **“For home cooks who want enough fibre or protein without logging every
  calorie.”**
- First click: **“Try it with sample data.”** The adjacent text says it loads
  seven foods, three meals, and three targets.

The action is 44 px high on desktop and 390 px mobile. One click opens the
planner with 7 foods, 3 placed meals, 3 targets, and the persistent **Demo —
sample data, nothing is saved**, **Reset demo**, and **Start for real** controls.
Adding an eighth demo food and reloading restored the original seven.

## Claims gate

`.factory/claims.json` exists. After `npm ci` in a detached clean worktree at
the exact candidate, every listed command was run separately through the
product's Playwright demo entry point:

| Claim | Result |
| --- | --- |
| `demo-week-coverage` | PASS |
| `sample-totals` | PASS |
| `sample-floor-status` | PASS |
| `free-to-use` | PASS |
| `local-only` | PASS |
| `offline-use` | PASS |
| `json-transfer` | PASS |
| `local-persistence` | PASS |
| `demo-isolation` | PASS |
| `demo-reset` | PASS |
| `target-cap` | PASS |
| `print-week` | PASS |
| `food-source` | PASS |
| `target-comparison` | PASS |
| `user-chosen-targets` | PASS |
| `no-calorie-input` | PASS |
| `build-output` | PASS |

Result: **17/17 exact claim commands pass.** The claim inventory guard also
confirms one tagged browser test per claim. Landing, planner, legal pages,
README, and demo documentation were cross-checked; no material unlisted claim
was found.

## Clean-checkout quality gates

Detached worktree: `/tmp/nutrient-candidate-9f7e27d`, at the exact candidate.
It remained clean after all checks.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 58 packages; 0 vulnerabilities |
| `npm test` | PASS — copy audit, claim inventory, 14/14 unit tests |
| `npm run lint` | PASS — `tsc --noEmit` |
| `npm run build` | PASS — exact build generated `dist/` |
| `npx playwright test --reporter=line` | PASS — 44/44 browser tests |
| `npm audit` | PASS — 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| Factory `verify-url.sh` on six routes | PASS — title/lang/h1/main/alt/labels; no normal-route errors |

The production build is 29,998 bytes JavaScript (10,134 bytes gzip), 13,764
bytes CSS (3,856 bytes gzip), no webfonts, and a 121,876-byte hero WebP. All
static-product budgets pass.

## Independent functional and recovery checks

- A keyboard-only real-plan flow created a 30 g fibre floor, a sourced 12 g
  fibre food, and a 2.5-portion meal. The result was **30 g / on plan**, its
  meter announced the same result, and food, target, meal, values, and
  relationship survived reload.
- Whitespace-only target input kept the dialog open, focused the target-name
  field, and announced **Enter a target name. It cannot be blank.**
- The prior `1e308` regression now has native `rangeOverflow=true`, announces
  **Fibre must be no more than 100,000 grams per serving**, saves no food, and
  cannot create a false passing total.
- Malformed JSON announced the documented recovery message without changing the
  plan.
- The full browser suite also passed decimal comparison boundaries, five-target
  capacity, twelve-food free use, edit persistence, confirmed cascading
  deletion, blocked-storage recovery, unsafe imported IDs and totals, print,
  JSON round-trip, and demo/real-data isolation.

## Accessibility, mobile, and motion

- Fresh Playwright Axe scans found no serious or critical issues on live `/`,
  `/demo`, `/plan`, `/privacy`, `/terms`, the real HTTP 404, or dark-mode demo.
- Every tested route has `lang=en`, one h1, one main landmark, a specific title,
  and complete image alt text. Factory URL verification found no console/page
  errors on the normal routes.
- The first Tab exposes the skip link. Its focus treatment is a 3 px outline
  plus 5 px halo; Enter moves focus to `main`. Tab/Enter and typing completed
  the full target → food → meal flow. Dialog focus and return focus also pass
  the browser suite.
- At 390×844, the landing and demo have no document overflow, the primary
  action is 44 px high, and no visible interactive target measured below
  44×44 px. Body text is 16 px.
- With `prefers-reduced-motion: reduce`, no nonzero animation or transition was
  found. Dark and light contrast pass Axe.
- The core app, demo, planner, Privacy, and Terms also have no overflow at a
  195 px 200%-zoom equivalent. The standalone 404 has a minor narrow-width
  issue recorded below.

## Privacy, security, routes, and caching

A fresh live flow covering landing, demo mutation, and reset recorded only
same-origin document/script/style/image requests. There was no third-party
request, analytics call, fetch/XHR, WebSocket, EventSource, ping, console error,
or page error. Food and meal values remained in browser storage.

Live responses provide HSTS, `X-Content-Type-Options: nosniff`, strict-origin
referrer policy, and a self-only CSP including `connect-src 'self'` and
`frame-ancestors 'none'`. HTML, manifest, and worker use 30-second revalidation;
hashed JS/CSS and the hero use one-year immutable caching. `/`, `/demo`,
`/plan`, `/privacy`, `/terms`, manifest, worker, icons, social image, robots,
sitemap, and favicon resolve. An unknown route correctly returns HTTP 404 with
the designed recovery page. Every HTTP link discovered across the site returned
200; the only non-HTTP link is the support email.

## PWA and performance

The live `/demo` acquired a service-worker controller at `/sw.js`. Calling the
registration update check succeeded. With the browser then offline, `/demo`
reloaded with all seven sample foods and the Add meal dialog remained operable.
The active cache was `nutrient-floor-v1788021362623`. The clean 44-test suite
also exercises a two-version waiting-worker update, **Update now**, controller
replacement, reload, and old-cache removal.

Fresh live mobile Lighthouse 12.8.2:

- Performance: **99**
- Accessibility: **100**
- Best practices: **100**
- SEO: **100**
- FCP 1.0 s; LCP 1.2 s; TBT 120 ms; CLS 0; Speed Index 1.0 s

## Deployment identity

The clean local build and live deployment match byte-for-byte:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `69631ac8a4677f1be4cbd98ad20bb6f518ab9d4d436202dd58388b238e356b2b` |
| `assets/index-DmGpFtNK.js` | `5665d7af128e55e0a64ce891feb4948146fe612f5cd09fd44a2a46e8a31eb1c1` |
| `assets/index-BN1C9l1y.css` | `f6eefe1f33d3bb421cc65bb26187079c6e7a1ffcccb0614befd064dbfec7c7d5` |
| `assets/hero.webp` | `b3d7303812d6a5b85ccd98d67be2e4c1f95220843963501846a385b148352bca` |
| `manifest.webmanifest` | `8f147832092ba5b9437946504fdd54d8feeab43411e8a7f6c1c0e6cd7edfb38f` |
| `404.html` | `6bcecd606a6f00a0cad66421e7cd85d63cc263d914f23f91d754353c44fe5196` |

Favicon and both manifest icons also match. Generated workers differ only in
their build-time cache version; after normalization both hash to
`2948883a4877628a58d9ed4bd6f4a8978318e49feba880eb7126a5615ab2e416`.
This fresh identity evidence supersedes any earlier deployment-only failure.

## Findings and applicability

### Medium — researched one-time monetization is unavailable (non-blocking scope deviation)

The researched brief proposes a one-time purchase, but the candidate is fully
free. A fresh GET to the required Sociobot checkout URL returned HTTP 404 with
`{"error":"enabled factory product","status":404}`. The product therefore
does not expose a dead purchase or forgeable license path; the first screen and
tested claim honestly say **Free to use**. Factory registration is required
before any future paid-unlock implementation.

### Low — standalone 404 needs a small horizontal pan at 195 px

At 390, 320, and 256 CSS px the 404 reflows without document overflow. At a
195 px 200%-zoom-equivalent viewport, its minimum header width makes the
document 213 px wide, requiring an 18 px horizontal pan. Text and both recovery
actions remain readable and operable; all primary and legal app routes stay at
195 px. This is not release-blocking but should be covered if the narrow-layout
tests are expanded to the static 404.

This is a static PWA with no product backend, product-unlock call, account,
runtime AI action, library, or CLI. API concurrency, persistence boundaries,
allowance/429, Entra authority, health/build endpoint, and clean-consumer
package checks do not apply. Import/export already addresses the brief's
obvious ownership need; deterministic planning has no missed AI requirement.

Defect totals:

- Critical: 0
- High: 0
- Medium: 1 non-blocking researched-scope deviation
- Low: 1 narrow standalone-404 reflow issue

**Final decision: PASS.**

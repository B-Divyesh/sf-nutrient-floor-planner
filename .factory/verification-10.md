# Independent product verification 10 — PASS

## Candidate and verdict

- Work order: `nutrient-floor-planner-verify-10`
- Candidate: `944beed94171c72f9bf5f6a7622343485ebadac5`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Verified: 2026-08-29 UTC
- Artifact: local-first offline PWA
- Product code was not modified.

**PASS — this candidate is release-ready.** Fresh checks resolve the earlier
data-loss and deployment concerns. The only remaining finding is the already
documented, non-blocking absence of the researched paid option: the factory has
not registered a working Sociobot checkout endpoint, so this version honestly
ships as a complete free product.

## Mandatory first-read and demo gate

**PASS.** A cold 390×844 load answers the three required questions above the
fold:

- What: **“Plan meals that meet your nutrient targets.”**
- Who: **“For home cooks who want enough fibre or protein without logging every
  calorie.”**
- First click: **“Try it with sample data.”**

The primary action measured 218.08×44 px. One click opened `/?demo=1` with
seven foods, three meals, three targets, and the persistent **Demo — sample
data, nothing is saved** banner. **Reset demo** and **Start for real** were both
present. The first screen also states **Free to use**, **Stored on this
device**, and **Works offline after setup**.

Evidence: `.factory/evidence/verification-10-home-mobile.png`,
`.factory/evidence/verification-10-demo-mobile.png`, and
`.factory/evidence/verification-10-live-qa.json`.

## Claims gate

`.factory/claims.json` exists. After `npm ci`, every exact command in it was
run independently in both the supplied clone and a detached clean worktree at
the candidate commit.

| Claim ID | Exact command | Result |
| --- | --- | --- |
| `demo-week-coverage` | `npx playwright test --grep @claim:demo-week-coverage` | PASS |
| `sample-totals` | `npx playwright test --grep @claim:sample-totals` | PASS |
| `free-to-use` | `npx playwright test --grep @claim:free-to-use` | PASS |
| `local-only` | `npx playwright test --grep @claim:local-only` | PASS |
| `offline-use` | `npx playwright test --grep @claim:offline-use` | PASS |
| `json-transfer` | `npx playwright test --grep @claim:json-transfer` | PASS |
| `local-persistence` | `npx playwright test --grep @claim:local-persistence` | PASS |
| `demo-isolation` | `npx playwright test --grep @claim:demo-isolation` | PASS |
| `demo-reset` | `npx playwright test --grep @claim:demo-reset` | PASS |
| `target-cap` | `npx playwright test --grep @claim:target-cap` | PASS |
| `print-week` | `npx playwright test --grep @claim:print-week` | PASS |
| `food-source` | `npx playwright test --grep @claim:food-source` | PASS |
| `target-comparison` | `npx playwright test --grep @claim:target-comparison` | PASS |
| `user-chosen-targets` | `npx playwright test --grep @claim:user-chosen-targets` | PASS |
| `no-calorie-input` | `npx playwright test --grep @claim:no-calorie-input` | PASS |

Result: **15/15 claim assertions pass.** The required pre-install invocation
could not load `@playwright/test` because a clean clone has no dependencies;
after the lockfile install, all listed tests executed and passed twice. The
landing page, legal pages, demo documentation, and README were cross-checked;
no material unlisted product claim was found.

## Clean-checkout quality gates

The independent worktree was detached at the exact candidate and remained
clean after verification.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 58 packages, 0 vulnerabilities |
| `npm test` | PASS — copy audit and 11/11 unit tests |
| `npm run lint` | PASS — `tsc --noEmit` |
| `npx playwright test --reporter=line` | PASS — 39/39 browser tests |
| `npm run build` | PASS — exact production build produced `dist/` |
| `npm audit` | PASS — 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| Factory `verify-url.sh`, live home/demo | PASS — 200, title, `lang`, one `h1`, `main`, alt text, labels, no console errors |

The browser suite includes the service-worker two-version update flow, offline
reloads, demo isolation, storage failure recovery, malformed imports,
destructive confirmation, navigation focus, 390 px mobile, 200% zoom, dark
mode, reduced motion, and five whitespace-only required-field regressions.

## Independent end-to-end behavior

Fresh production checks exercised both normal and recovery paths:

- The demo showed 7 foods, 3 placed meals, 3 targets, 40 g fibre, and 75.5 g
  protein.
- A real plan accepted a 30 g fibre floor, a 10 g sugar limit, a sourced food,
  and a two-portion Wednesday meal. It calculated 24 g fibre / 6 g short and
  4 g sugar / on plan.
- Reload preserved the valid 1-food, 1-meal, 2-target plan. Exported JSON had
  the same counts.
- Malformed JSON showed the documented recovery message and preserved the
  existing food.
- Fractional boundary checks produced 0.125 g / 0.025 g over and 0.075 g /
  0.025 g short from 0.1 g values.
- A whitespace-only food name kept the dialog open and preserved the existing
  1-food, 1-target, 1-meal plan after reload. The repository suite independently
  repeats this for food name, serving, source, target name, and meal name.
- The five-target limit, twelfth-food free path, print action, blocked-storage
  recovery, confirmation before deletion, and invalid-plan rejection passed in
  the clean browser suite.

## Accessibility, responsive behavior, and motion

- Playwright Axe 4.11 found zero serious or critical violations on live `/`,
  `/demo`, `/plan`, `/privacy`, `/terms`, the styled 404, and dark/reduced-
  motion demo states.
- The first Tab exposes the skip link with a 3 px designed outline; Enter moves
  focus to `main`. Dialogs initially focus the named field, close with Escape,
  and return focus to the opener. The clean suite also verifies SPA back,
  route-focus, and announcement behavior.
- Every measured visible control on the five normal routes was at least 44×44
  px at 390 px. The repaired privacy email target is included.
- Reduced motion had no nonzero animation or transition duration.
- The 390 px layout and a 195 px 200%-zoom equivalent had no page-level
  overflow. Compact planner text remained 14 px at the narrow viewport.
- Factory URL verification found one `h1`, one `main`, `lang=en`, complete alt
  text, labelled buttons, and no console errors on live home and demo.

## Privacy, security, routes, and server applicability

The independent live flow recorded 37 requests. All were same-origin, with
zero fetch, XHR, EventSource, WebSocket, or ping requests and zero normal-route
console/page errors. No meal data, analytics, external font, or external script
request was observed.

HTML responses send a self-only CSP with `frame-ancestors 'none'`, HSTS,
`nosniff`, and strict-origin referrer policy. `/`, `/demo`, `/plan`, `/privacy`,
and `/terms` return 200. The designed unknown route returns HTTP 404. The
manifest is served as `application/manifest+json`.

This static PWA has no product backend, server-side endpoint, authentication,
runtime AI feature, library, or CLI. Concurrency, server persistence, API
allowance/429, Entra authority, and package-consumer checks therefore do not
apply. The browser made no Sociobot unlock call.

## PWA, caching, and performance

**PASS.** A fresh live demo acquired a service-worker controller, then reloaded
offline, rendered the planner, and opened the meal dialog. Its active cache was
`nutrient-floor-v1788002659040`. The clean candidate's two-version update test
showed the update action, changed controller, reloaded, and removed the old
cache.

Hashed JS, CSS, and image responses use one-year immutable caching. HTML,
manifest, and worker responses revalidate after 30 seconds. The manifest uses
standalone display, a versioned start URL, product theme colors, a genuine
192×192 icon, and a genuine 512×512 maskable icon.

Fresh live mobile Lighthouse 13.0.1:

- Performance 100
- Accessibility 100
- Best Practices 100
- SEO 100
- FCP 765 ms; LCP 1,501 ms; TBT 66 ms; CLS 0; Speed Index 765 ms
- Initial transferred bytes: 136,429

Build sizes pass the static budgets: JavaScript 26,608 bytes raw / 9.20 kB
gzip, CSS 13,075 bytes raw / 3.74 kB gzip, no web font, and hero WebP 121,876
bytes.

Evidence: `.factory/evidence/verification-10-lighthouse-live.json`.

## Deployment identity

The live deployment matches the candidate production build. HTML, JS, CSS,
hero, icons, social image, favicon, manifest, robots, sitemap, and 404 assets
all matched byte-for-byte. Representative SHA-256 values:

| File | SHA-256 |
| --- | --- |
| `index.html` | `cded687ee02937e928efe90e999b6b7cc11467a47e3d5bcc6c067f23e593bd8f` |
| `assets/index-BJXKw8x4.js` | `5c431cbda98ffcc5cce5f82a1bbf7e237c27d47a4fdbbc15b9b9095259ab02a7` |
| `assets/index-C9IZyVAl.css` | `60b825a078886ea06243db28f3598dab9f3ddcfaf1c7fe75d0e414d54fb73c8a` |
| `assets/hero.webp` | `b3d7303812d6a5b85ccd98d67be2e4c1f95220843963501846a385b148352bca` |
| `manifest.webmanifest` | `09f01efbc7509cbe4429452f9062289a80e0a262f29e3d69ea0d75d2ba77e547` |

Generated workers differ only in their build-time cache timestamp. After
normalizing that value, local and live workers both hash to
`6c1dad819b59574f415684cce5267f8ddd46cee9756772674ad30486e488ce00`.
Fresh hashes, headers, live behavior, and offline evidence resolve any earlier
deployment-only concern.

## Remaining finding and scope deviation

### Medium — researched one-time monetization is unavailable

The supplied brief describes one-time monetization, but this candidate is fully
free and has no purchase or license-restoration path. On 2026-08-29 the required
Sociobot checkout URL still returned HTTP 404 with
`{"error":"enabled factory product","status":404}`. Shipping a broken checkout
would be worse than the present honest free product; the first screen and tested
claim both state that it is free. A future paid release requires factory product
registration before implementing the Sociobot license contract.

The repository has no `.factory/brief.json`; this verification used the
researched brief supplied in the work order. The design thesis, asset
provenance, demo documentation, copy audit, README, MIT license, privacy route,
terms route, and handoff are present. Deterministic local planning does not have
a missed AI leverage requirement.

## Defects by severity

- Critical: none.
- High: none.
- Medium: researched one-time monetization is unavailable because the required
  external product registration returns 404; the free product remains complete.
- Low: none.

Final result: **PASS**.

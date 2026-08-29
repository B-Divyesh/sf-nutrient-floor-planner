# Independent verification 8 — FAIL

## Scope and decision

- Candidate: `6d6dc8e277bc23e0365b7529b79e5d411c6ea15c`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Verified: 2026-08-29 UTC
- Work order: `nutrient-floor-planner-verify-8`
- Artifact: local-first offline PWA
- Decision: **FAIL.** A valid fractional portion can be classified as over or
  short while the visible and accessible figures say the total equals the
  target and is `0 g` away. This contradicts the core planning answer.

Product code was not changed. The supplied brief was used as the acceptance
contract because this checkout has no `.factory/brief.json`.

## Release-blocking defect

### Medium — threshold result contradicts its displayed numbers

Nutrient fields accept `0.1 g` steps and portions accept `0.25` steps. The
comparison keeps their finer result, while `n()` rounds displayed totals and
differences to one decimal.

Fresh live reproduction:

1. Open `/plan` in a fresh context.
2. Add a maximum sugar limit of `0.1 g`.
3. Add a food with `0.1 g` sugar per serving.
4. Add a meal containing `1.25` portions.

The total is `0.125 g`, which exceeds the limit. The live result rendered:

```text
Tiny sugar limit | limit · 0.1 g | 0.1 g | 0 g over
class="target gap"
meter value="80"
aria-label="Tiny sugar limit: 0.1 grams against a 0.1 gram limit, 0 g over"
```

It says `0.1 g` against `0.1 g` and `0 g over`, but marks the plan as failing.
The orange meter is the only accurate cue, so the state also depends on
color/shape while its text is contradictory. A floor has the same defect at
the other side of a threshold (`0.1 g × 0.75` against a `0.1 g` floor).

This blocks release because the researched job is to say whether a menu clears
a chosen floor or limit. Apply one precision policy to comparison, displayed
total/difference, and accessible name. Add browser tests for both boundary
cases above.

## First-read and demo gate

The cold live first screen passes at 390 × 844:

- What: **“Plan meals that meet your nutrient targets.”**
- Who: **“For home cooks who want enough fibre or protein without logging
  every calorie.”**
- First click: **“Try it with sample data.”**

The action is visible without scrolling and says it loads seven foods, three
meals, and three targets. One click opens `/?demo=1`, with a populated planner,
the persistent **Demo — sample data, nothing is saved** banner, **Reset demo**,
and **Start for real**.

## Claims gate

`.factory/claims.json` exists with 14 entries. Every ID occurs exactly once in
`tests/claims.spec.ts`, with no extra tagged claim. After `npm ci`, every exact
declared command passed independently from the clean checkout:

| Claim | Result |
| --- | --- |
| `demo-week-coverage` | PASS |
| `sample-totals` | PASS |
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

Result: **14/14 pass.** The literal pre-install invocation could not resolve
`@playwright/test`, as expected before dependencies exist. All commands passed
after the lockfile install and again in the detached clean checkout. No
material unlisted claim was found. The target-comparison claim test uses a
comfortably passing total and misses the threshold contradiction.

## Clean-checkout gates

A detached worktree at `/tmp/nf-v8-clean.p69O7C` had the exact candidate HEAD
and was clean before and after verification.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 58 packages, 0 vulnerabilities |
| 14 exact claim commands | PASS — 14/14 |
| `npm test` | PASS — 7/7; copy audit passed |
| `npm run lint` | PASS — TypeScript `--noEmit` |
| `npm run build` | PASS — `dist/` produced |
| `npx playwright test` | PASS — 30/30 |
| `npm audit` / `npm audit --omit=dev` | PASS — 0 vulnerabilities |

Output: 25.31 kB JS raw / 8.72 kB gzip; 12.65 kB CSS raw / 3.61
kB gzip; 121,876-byte hero. All bundle budgets pass.

## Independent end-to-end coverage

Apart from the blocker, the smallest useful flow works:

- Demo: 7 foods, 3 meals, 3 targets, 40 g fibre, 75.5 g protein.
- Blank and `0 g` targets were rejected with native validation and focus.
- A `10.1 g` fibre floor, `1 g` sugar limit, sourced food, and `1.25`-portion
  meal calculated 10.4 g fibre and 0.3 g sugar as on plan.
- Food and meal persisted. Export contained one food, two targets, and one
  meal. Malformed JSON explained recovery and preserved the plan.
- Deletion named its affected meal; **Keep it** preserved the food.
- The suite also covers five-target capacity, print, demo isolation/reset,
  unsafe IDs, blocked storage, malformed records, dialog cancellation,
  back/focus routing, and 200%-equivalent reflow.
- Every internal link returned 200; `mailto:` was exempt. Unknown routes use a
  styled HTTP 404 with a route back.

There is no product endpoint, paid-unlock call, runtime AI, sign-in, library,
or CLI. API 429, Entra authority, backend concurrency, and consumer-package
checks do not apply.

## Deployment identity, privacy, and headers

Local and live files were byte-identical for `index.html`, hashed JS/CSS,
hero, manifest icons, manifest, 404 HTML/CSS, favicon, robots, and sitemap.

| File | SHA-256 |
| --- | --- |
| `index.html` | `c2a68a313405f8a28c5d2b3a0d4cc4c3058c35263f9821c8b6b06f7999a9078f` |
| `index-CLLaEjWt.js` | `7a6132dd1502a5a37ea2a305df5a00b50c19d1866ea6b1c1b19db3b6b41d7fbd` |
| `index-BJe0TCy1.css` | `d50d64c83269871046738fa5a2e9246737bdd73e75540b8cb8e43173ff492f89` |
| `hero.webp` | `b3d7303812d6a5b85ccd98d67be2e4c1f95220843963501846a385b148352bca` |

Generated workers differ only in the cache timestamp and match after
normalizing it. Candidate `6d6dc8e` changes only generated `graphify-out`
metadata, so the live product artifacts are the candidate product.

The independent live workflow recorded 27 requests across route loads. Every
request was same-origin. There were no fetch/XHR/eventsource/websocket/ping,
analytics, third-party font/script, or meal-data requests. Normal pages had no
console/page errors; the sole later message was expected from requesting the
intentional HTTP 404.

Headers include self-only CSP with `frame-ancestors 'none'`, HSTS,
`nosniff`, and strict-origin referrer policy. HTML, manifest, and worker use
`max-age=30, must-revalidate`; hashed assets use one-year immutable caching.
Manifest MIME is `application/manifest+json`.

## Accessibility, responsive behavior, and performance

- Factory `verify-url.sh` passed `/` and `/?demo=1`: 200, title, `lang=en`, one
  `h1`, main, alt text, labelled buttons, and zero console errors.
- Axe found zero serious/critical issues on `/`, `/demo`, `/plan`, `/privacy`,
  `/terms`, 404, and the 390 px dark/reduced-motion demo.
- Home and demo fit 390 px exactly. All visible controls were at least 44 px.
- First Tab reached the skip link with a 3 px lime outline; Enter focused main;
  next Tab reached **Export plan**. Dialog Escape restored its opener.
- Reduced-motion mode had no non-zero transition or animation durations.
- Mobile Lighthouse: Performance 93, Accessibility 100, Best Practices 100,
  SEO 100; FCP 0.884 s, LCP 1.813 s, TBT 304 ms, CLS 0, Speed Index 0.935 s.
  INP is unavailable in this single-navigation lab run.

## PWA and offline

The manifest has standalone display, versioned start URL, product colors, a
real 192 icon, and a real 512 maskable icon. After setup, the live worker
controlled the page; an offline `/demo` reload rendered and opened a meal
dialog. A two-version candidate-build test produced a waiting worker, showed
**An update is ready**, and remained controlled and usable after update.

### Low — update can recreate the previous cache

The update test began with `nutrient-floor-qa-a`; after activating
`nutrient-floor-qa-b`, both remained. The page posts `SKIP_WAITING` and reloads
immediately, allowing the old controller to reopen its cache after activation
cleanup. Wait for `controllerchange` before reload and remove stale caches.

## Defects by severity

- Critical: none.
- High: none.
- Medium: threshold comparison contradicts displayed/accessibility numbers —
  release-blocking core correctness defect.
- Low: worker update can retain the immediately previous cache.

Fresh hashes and live checks resolve the prior deployment-only concern. The
candidate still fails for the reproduced calculation-presentation defect.

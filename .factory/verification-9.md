# Independent product verification 9 — FAIL

## Candidate and verdict

- Work order: `nutrient-floor-planner-verify-9`
- Candidate: `88ecfe026dbdc38a08786db029c50e75a000813f`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Verified: 2026-08-29 UTC
- Artifact: local-first offline PWA
- Product code was not modified.

**FAIL — do not release.** A whitespace-only food name is accepted and stored,
even though the stored record fails the app's own validator. The planner then
silently replaces the entire saved plan with a blank plan on reload. This is a
high-severity data-loss path in the real planner.

## Release-blocking defect

### High — accepted whitespace input makes the whole saved plan disappear

Fresh live reproduction at `/plan`:

1. Start with a valid plan. The verification used one target, one food, and one
   meal imported through the public UI.
2. Choose **Add food**.
3. Enter three spaces for **Food name**, `1 cup` for **Serving**, and `Package
   label` for **Source or label**.
4. Choose **Save food**.
5. Observe that the dialog closes and a nameless second food appears.
6. Reload the page.

Observed before reload: 2 foods, including a row whose visible text begins
`per 1 cup · Package label`. Observed after reload: 0 foods, 0 targets, and 0
meals. There is no error or recovery message.

The submit handler trims the strings and writes them without validating the
trimmed values (`src/main.ts`, lines 215–231). The read validator correctly
rejects empty trimmed text (`src/model.ts`, lines 15–34), but `readPlan` turns
any rejected stored record into `blankPlan()` without warning (`src/store.ts`,
line 12). Target labels and meal names use the same unchecked trim pattern.

Evidence: `.factory/evidence/verification-9-live-qa.json` →
`whitespaceFood`. The reproducible script
`.factory/evidence/verification-9-live-qa.mjs` intentionally exits nonzero on
this defect.

Required repair: validate trimmed food name, serving, source, target label, and
meal name before mutating or storing the plan; keep the dialog open; associate
and announce a plain recovery message; add browser regressions proving the
existing plan survives reload after each rejected whitespace-only submission.

## First-read and demo gate

**PASS.** On a cold 390×844 load, the first screen answers all three required
questions without scrolling:

- What: **“Plan meals that meet your nutrient targets.”**
- Who: **“For home cooks who want enough fibre or protein without logging every
  calorie.”**
- First click: **“Try it with sample data.”**

The action is 218×44 px and opens `/?demo=1` in one click. The resulting screen
contains 7 foods, 3 meals, 3 targets, and the persistent **Demo — sample data,
nothing is saved** banner with **Reset demo** and **Start for real**. The hero
loaded at its intrinsic 1200×800 dimensions; the very first CLI screenshot
captured its alt text before decode, but the waited cold-page check and factory
screenshots confirm the asset is healthy.

## Claims gate

`.factory/claims.json` exists. Every ID appears exactly once as a tagged test.
Every exact command was run independently after `npm ci` in the clean detached
checkout at the candidate commit.

| Claim ID | Result |
| --- | --- |
| `demo-week-coverage` | PASS — 1 test |
| `sample-totals` | PASS — 1 test |
| `local-only` | PASS — 1 test |
| `offline-use` | PASS — 1 test |
| `json-transfer` | PASS — 1 test |
| `local-persistence` | PASS — 1 test |
| `demo-isolation` | PASS — 1 test |
| `demo-reset` | PASS — 1 test |
| `target-cap` | PASS — 1 test |
| `print-week` | PASS — 1 test |
| `food-source` | PASS — 1 test |
| `target-comparison` | PASS — 1 test |
| `user-chosen-targets` | PASS — 1 test |
| `no-calorie-input` | PASS — 1 test |

Result: **14/14 claim assertions pass.** As required by the work-order sequence,
the commands were also invoked before dependency installation. They could not
start because `@playwright/test` was not yet present. After the requested clean
install, all commands passed twice: once in the supplied checkout and once in
the detached clean checkout. No material unlisted claim was found.

The current claims do not cover the whitespace-save corruption. Add a regression
outside the claim inventory because this is validation and data-integrity
behavior, not a marketing claim.

## Clean-checkout quality gates

Detached checkout: `/tmp/nf-v9-clean.gHFSVz`, exact detached HEAD
`88ecfe026dbdc38a08786db029c50e75a000813f`, clean after verification.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 58 packages, 0 vulnerabilities |
| 14 exact claim commands | PASS — 14/14 after install |
| `npm test` | PASS — copy audit and 10/10 unit tests |
| `npm run lint` | PASS — `tsc --noEmit` |
| `npm run build` | PASS — exact production build produced `dist/` |
| `npx playwright test` | PASS — 33/33 browser tests |
| `npm audit` | PASS — 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| Factory URL verifier, local home/demo | PASS — 200, title, `lang`, one `h1`, `main`, alt text, labels, no console errors |
| Factory URL verifier, live home/demo | PASS — same checks |

The repository suite misses the blocker because it checks empty strings and
malformed imports, but does not submit a whitespace-only required text field.

## Independent end-to-end evidence

The normal real-plan path works before the invalid-input case:

- Added a 30 g fibre floor and 10 g sugar limit.
- Added **Home chickpea bowl**, with a serving, package source, and user-entered
  fibre, protein, and sugar values.
- Added two portions to Wednesday. The planner showed 24 g fibre / 6 g short and
  4 g sugar / on plan.
- Reload preserved the valid 1-food, 1-meal, 2-target plan.
- Export produced complete JSON with the same counts.
- Malformed JSON produced the documented recovery message and preserved data.
- The repaired fractional boundaries remain correct: `0.1 × 1.25` shows
  `0.125 g` and `0.025 g over`; `0.1 × 0.75` shows `0.075 g` and `0.025 g short`.
- Destructive actions require a named confirmation; the repository suite also
  verifies canceling a meal does not create data and blocked storage preserves
  the form with a recovery message.

## Accessibility and responsive behavior

- Playwright Axe 4.11 found zero serious/critical violations on live `/`,
  `/demo`, `/plan`, `/privacy`, `/terms`, the 404 page, and the dark/reduced-
  motion demo.
- Keyboard: first Tab shows the skip link with a 3 px outline; Enter focuses
  `main`; the next Tab focuses **Export plan**. A meal dialog initially focuses
  its name field, Escape closes it, and focus returns to its opener.
- Reduced-motion mode reported no nonzero animation or transition durations.
- The 390 px home/demo and a 195 px 200%-zoom equivalent had no page-level
  overflow. Relevant compact text remained 14 px at the narrow viewport.
- The mobile sample's visible controls met 44×44 px, except the contact email
  link described below.

### Medium — `/privacy` contact link has a 20 px mobile hit area

At 390 px, `hello@sociobot.in` measures 129.09×20 px. The attached accessibility
contract requires touch targets of at least 44 px. Axe does not report this
geometry issue. Give the inline link a 44 px minimum hit area without harming
paragraph flow.

## Privacy, security, routes, and caching

- The live walkthrough recorded 37 requests. Every request was same-origin;
  there were zero fetch, XHR, EventSource, WebSocket, or ping requests and zero
  normal-route console/page errors. No plan data, analytics, font, or script
  request left the product origin.
- The only console error in the combined log is the expected HTTP 404 resource
  message from deliberately opening `/verification-9-not-found`; normal errors
  were snapshotted before that request and equal `[]`.
- `/`, `/demo`, `/plan`, `/privacy`, and `/terms` return 200. The unknown route
  returns the styled HTTP 404. Internal links were exercised; the contact
  `mailto:` link is non-HTTP.
- HTML sends self-only CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, and
  strict-origin referrer policy. No CSP violation occurred.
- Hashed JS, CSS, and image responses send one-year immutable caching. HTML,
  the manifest, and `sw.js` use 30-second revalidation. The manifest MIME is
  `application/manifest+json`.
- The manifest declares standalone display, versioned start URL, theme colors,
  a real 192×192 icon, and a real 512×512 maskable icon.

There is no runtime backend, product API, sign-in, AI path, library, or CLI.
Concurrency, persistence-server, Entra authority, consumer-package, and API
allowance/429 checks do not apply. The product makes no Sociobot unlock call.

## PWA and offline

**PASS.** A fresh live online demo acquired a service-worker controller. With
the context then offline, `/demo` reloaded, rendered the planner, and opened the
meal dialog. Its only cache was the current deployed
`nutrient-floor-v1787996411007` cache.

The clean candidate's two-version update test was rerun separately. It produced
a waiting worker, activated it through **Update now**, waited for controller
change, reloaded successfully, and left only the new cache: 1/1 passed.

## Performance and deployment identity

Fresh live mobile Lighthouse 12.8.2:

- Performance 98
- Accessibility 100
- Best Practices 100
- SEO 100
- FCP 786 ms; LCP 1,209 ms; TBT 180 ms; CLS 0; Speed Index 786 ms

INP is unavailable in a single-navigation lab run. TBT is below the 200 ms
interaction proxy budget.

Build sizes pass the static budgets: JavaScript 25,496 bytes raw / 8.82 kB gzip;
CSS 12,782 bytes raw / 3.66 kB gzip; hero 121,876 bytes. No web font ships.

The live deployment matches the candidate production build:

| File | SHA-256 |
| --- | --- |
| `index.html` | `ddeb6e758d547967c22d1f2739c3f6315358c28f63fe782ff944a7f1d1f98481` |
| `assets/index-Dc9bZ-6v.js` | `88be7010353156e04cb911eda378a007de4151c1dd7d6461a9fdda3c717273b5` |
| `assets/index-BHSVMPi7.css` | `269364e12b91dbfd6ba3871649418d57aaa59bbea08748ae027744ca59fd9375` |
| `assets/hero.webp` | `b3d7303812d6a5b85ccd98d67be2e4c1f95220843963501846a385b148352bca` |
| `manifest.webmanifest` | `09f01efbc7509cbe4429452f9062289a80e0a262f29e3d69ea0d75d2ba77e547` |

Icons, social art, favicon, robots, sitemap, and 404 files also matched
byte-for-byte. Generated workers differ only in their cache timestamp; both
normalize to SHA-256
`7822d4a2cd700a7a76fb7bd75b86d6b8eb4f552fca5b570bf6e788877ef2bce3`.
The builder's earlier deployment-only concern is resolved by fresh artifact,
header, functional, and offline evidence.

## Scope deviation and remaining findings

### Medium — researched one-time monetization is absent

The supplied brief specifies one-time monetization, but the candidate is fully
free and contains no purchase or license-restoration path. The required
Sociobot checkout URL currently returns HTTP 404 with
`{"error":"enabled factory product","status":404}`. Removing a broken checkout
is honest, but `.factory/handoff.md` previously said there were no known gaps
instead of explaining this deviation as required by `AGENTS.md`. Register the
product and implement the paid-unlock contract, or explicitly approve and
document the free-product deviation. Because there is no endpoint in the app,
the API 429 allowance check is not applicable to this candidate.

### Low — first screen omits a price/free fact

The first screen has three useful facts, but none states price or that the app
is free. This misses the attached plain-words first-screen shape. It does not
fail the explicit what/who/first-click gate, which passed.

The checkout does not contain `.factory/brief.json`; this verification used the
researched brief supplied in the work order. The design thesis, source asset
provenance, demo documentation, README, MIT license, privacy route, terms route,
and handoff are present. No missed AI leverage was found for this local-first,
deterministic planning job.

## Defects by severity

- Critical: none.
- High: whitespace-only required text is stored, then causes silent loss of the
  entire visible plan on reload — release-blocking.
- Medium: `/privacy` email target is 20 px high on mobile; researched one-time
  monetization is absent and undocumented as a deviation.
- Low: the first screen does not state a price or that the product is free.

Fresh deployment evidence resolves the prior deployment-only concern. The
candidate still **FAILS** because its real-plan input path can silently erase
the user's visible plan on reload.

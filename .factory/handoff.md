# Nutrient Floor handoff

## Strict review 9

**PASS.** The deployed implementation
`fad08d2adaa0689044d633854d0926188e798fff` was reviewed from a detached clean
checkout. The reviewed documentation and QA state is
`81ed8dc1ae6f99eaae1443ea1c295d7234330314`; the current
`a725ea76bbb917df5f5bf949a7351cce59ae5f1a` wrapper changes only Graphify
output. Product code was not changed.

- All 17 exact claim commands passed separately; there are zero untested or
  unlisted public claims.
- `npm test` passed 14/14 unit tests, lint and build passed, both audits found
  zero vulnerabilities, and the full browser suite passed 45/45.
- The repaired `local-only` claim passed its exact command, the full run, and
  a separate 30/30 repetition.
- Fresh desktop and phone contexts passed the first-screen job, audience, and
  first action; populated sample; persistent demo label; reset; and real-plan
  isolation checks.
- Fresh live route, keyboard, focus, reduced-motion, light/dark Axe, privacy,
  offline, link, legal-page, and 195 px 404 checks passed.
- Fresh mobile Lighthouse scored 100/100/100/100; LCP was 1.62 s, TBT 50 ms,
  and CLS 0.
- Every public live file matches the clean implementation build. The service
  worker matches after normalizing its generated cache number.

Finding count: **0**. Untested claim count: **0**. See
`.factory/review-9.md` and `/work/.evidence/review9/`.

The $12 Sociobot offer remains externally unregistered, so its checkout URL
returns the stipulated HTTP 404. This is not a product finding. After
registration, the billing operator should complete one real purchase. This
static PWA has no product backend, tenant, account, CLI, library, desktop
package, or runtime AI feature.

## Independent verification 16

**PASS.** The deployed implementation `fad08d2adaa0689044d633854d0926188e798fff` was verified independently from a detached clean checkout. Its documentation commit is `4c4274ad51cc6ff424b98e0947026e7565bd56c0`; the later `0ec5cab772e313195ce96cee369e06f082193ddf` wrapper changes only Graphify output. Product code was not changed.

- All 17 exact claim commands passed separately; the inventory guard found one test per claim and no untested public claim.
- `npm test` passed 14/14 unit tests, lint and build passed, both audits found zero vulnerabilities, and the full browser suite passed 45/45.
- The repaired `local-only` claim passed its exact command, the full run, and 30/30 consecutive repetitions.
- Fresh 1440 × 900 desktop and 390 × 844 phone contexts passed the first-screen job/audience/action, populated sample, persistent demo label, reset, and real-plan isolation checks.
- Fresh live keyboard, focus, reduced-motion, Axe, offline, link, route-title, legal-page, privacy-request, and 195 px 404 checks passed.
- Fresh mobile Lighthouse scored 100/100/100/100; LCP was 1.03 s, TBT 82.5 ms, and CLS 0.
- Live HTML, JavaScript, CSS, images, icons, manifest, robots, sitemap, and 404 assets match the clean candidate build. The worker matches after normalizing its generated cache number.

Finding count: **0**. Untested claim count: **0**. See `.factory/verification-16.md` and `/work/.evidence/verify16/`.

The $12 Sociobot offer remains externally unregistered, so checkout returns the stipulated HTTP 404. This is not a product finding. After registration, the billing operator should complete one real purchase. This static local-first PWA has no product backend, account, CLI, library, desktop package, or runtime AI feature.

## Repair 10

### Outcome

Repair 10 resolves review-8 finding F-8-1. The `local-only` browser claim
now subscribes to the exact token-only Sociobot verification request before
clicking **Restore purchase**, waits for that request, and waits for the
visible verified-license result before examining the privacy request log.
This tests the user-visible license outcome and the actual network request,
rather than synchronously inspecting an asynchronous listener.

- Implementation SHA: `fad08d2adaa0689044d633854d0926188e798fff`
- Deployed static deployment: `da6cf500-9e54-427e-a6a8-dc1f978c3086`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Scope: test-only repair; the deployed JavaScript and CSS exactly match the
  clean build (`index-C0YUIyaN.js` and `index-D4nT9oM7.css`).

### Verification

Detached clean checkout: `/tmp/nutrient-floor-repair10-clean` at the
implementation SHA.

```sh
npm ci
npm test
npm run lint
npm run build
npm audit
npm audit --omit=dev
npx playwright test --reporter=line
```

- `npm ci` installed 58 packages with zero vulnerabilities.
- All 17 exact commands declared in `.factory/claims.json` passed separately.
- `npm test` passed the copy/claim guards and 14 unit tests.
- Type checking, production build, and both audits passed. The build produced
  `dist/index.html` with 34.09 kB JavaScript raw / 11.55 kB gzip and 14.53 kB
  CSS raw / 3.99 kB gzip.
- The fresh full Playwright suite passed 45/45. The repaired `local-only`
  claim was also repeated 30 times in a separate run: 30/30 passed.

Fresh HTTPS checks used separate desktop (1440 × 900) and phone (390 × 844)
contexts. Before scrolling, both state the job (plan meals against nutrient
targets), audience (home cooks avoiding a calorie diary), and first action
(**Try it with sample data**). The phone flow opened the populated seven-food,
three-meal, three-target sample, retained the persistent **Demo — sample data,
nothing is saved** label, reset an eighth demo food back to seven, and returned
to separately saved real data without carrying demo data over.

`verify-url.sh` passed fresh live home and demo pages with no console errors,
a title, `lang=en`, one h1, one main landmark, and complete image alt text.
Fresh Playwright Axe scans found zero serious or critical issues on `/`,
`/demo`, `/plan`, `/privacy`, `/terms`, and `/404.html`. The live keyboard
skip path focuses `main`; reduced motion leaves zero animated elements; an
online service-worker-controlled demo reload stayed usable offline and opened
**Add a meal**. `/`, `/demo`, `/plan`, `/privacy`, `/terms`, manifest, robots,
sitemap, and `404.html` return 200; a deliberate unknown route returns 404.

Live Lighthouse mobile scores: Performance 100, Accessibility 100, Best
Practices 100, SEO 100; LCP 1.06 s, TBT 0 ms, CLS 0. The report is at
`/work/.evidence/nutrient-floor-repair-10/lighthouse-live.json`.

### Earlier finding disposition

All earlier review and verification findings, including the former minor
issues, remain covered by the clean 45-test browser suite and fresh live
checks: offline reload/update cache cleanup; forged-license protection;
within-limit, decimal, and overflow calculations; invalid import and storage
recovery; dialog, route, and skip-link focus; cancellation and confirmed
deletion; food/target limits, editing, persistence, and complete JSON transfer;
demo isolation/reset; metadata, headers, icons, CSP-safe meters, contrast,
touch targets, reduced motion, and 195 px 404 reflow. F-8-1 is now fixed by
the request/outcome wait above.

### Remaining external dependency

The advertised $12 one-time offer is recorded at
`/work/.evidence/billing-offer.json`. The required Sociobot checkout URL still
returns the stipulated registration 404, so a real hosted purchase cannot yet
be completed. This is an external billing-registration dependency, not a
broken product route; the mocked claim verifies return-token handling,
verification, forged-token rejection, and license restoration. After
registration, the billing operator should complete one real purchase and
confirm that its returned token activates the paid features.

The catalog description remains a verb-first 64-character sentence and is
copied to `/work/.evidence/catalog-description.txt`. This static local-first
PWA has no product backend, runtime AI, CLI, library, account, or server data,
so backend isolation/restart/health/429 and consumer-artifact checks do not
apply.

## Strict review 8

**FAIL.** The deployed implementation remains
`75f1273057f842e046c59366a28151cb7f71a7c8`; its documentation handoff is
`b0b3278e483dc70193affd0b826be6e8e62e9582`. Product code was not changed.

All 17 declared claim commands passed separately, `npm test` passed 14 unit
tests, lint and build passed, both audits found zero vulnerabilities, and a
second exact browser run passed 45/45. Live phone and desktop checks passed the
first screen, sample, reset, real-data isolation, offline, keyboard, reduced
motion, accessibility, legal routes, and 195 px 404 checks. Lighthouse was
100/100/100/100, and live assets match the candidate build.

One low finding remains. The first clean full-browser run failed the
`local-only` test once because it synchronously inspected a request started by
an asynchronous submit listener. A 20-run repetition passed, so this is a
test-wait race rather than a reproduced privacy failure, but a documented
clean-checkout command did fail. Wait for the intercepted verification request
or completed status before checking it, then repeat the full suite.

Finding count: 1. Untested claim count: 0. See `.factory/review-8.md`.

The external checkout still returns the stipulated registration 404. It is
not counted as a product finding.

## Independent verification 15

**PASS.** The deployed implementation `75f1273057f842e046c59366a28151cb7f71a7c8` was verified from a detached clean checkout; its prior documentation commit is `b0b3278e483dc70193affd0b826be6e8e62e9582`. Product code was not changed.

- All 17 exact claim commands passed separately; there are zero untested public claims.
- `npm test` (14 unit tests), lint, build, all 45 browser tests, and both audits passed.
- Fresh live desktop and phone flows passed: first-screen job/audience/action, populated demo, persistent sample label, reset, real-data isolation, within-limit status, keyboard, reduced motion, offline dialog, routes, legal pages, privacy, and the 195 px 404.
- Live Axe had no serious or critical violations. Fresh mobile Lighthouse was 100/100/100/100, with LCP 1.0 s, TBT 0 ms, and CLS 0.
- The deployed JS and CSS hashes exactly match the clean implementation build.

The Sociobot billing offer has not yet been registered externally, so its checkout URL returns the stipulated HTTP 404. This is not a product defect for this verification; the sandboxed license claim uses its recorded checkout and verification fixtures. No product backend applies.

See `.factory/verification-15.md` for the complete evidence and prior-finding disposition.

# Nutrient Floor repair 9 handoff

## Outcome

The three review-7 product findings are repaired and deployed at
<https://nutrient-floor-planner.sociobot.in>.

- Deployed implementation SHA: `75f1273057f842e046c59366a28151cb7f71a7c8`.
- Evidence commit: `2539bbcf8cdab48a6de3416b82d4340b1de7e69b`.
- Static deployment: `126875ec-9aba-4ef7-a88e-bddbe76d0ea0`.
- The later evidence and handoff commits do not change the deployed artifact.

The first screen names the job, audience, and first action. It shows exactly
three facts covering the free limit and price, local storage, and offline use.
Fresh 390 px phone and 1440 px desktop captures confirm they are visible before
scrolling.

## Review-7 findings

1. **Within-limit state:** passing maximum targets now say **within limit** in
   visible text and the meter name. The tagged target-comparison test creates
   all four states through the UI. The live sample reports 35.1 g against a
   36 g sugar limit as **within limit**.
2. **One-time purchase scope:** the live page now states the $12 one-time
   price, 10-food free boundary, unlimited-food and weekly-printing paid
   deliverables, hosted checkout link, license return capture, daily cached
   verification, revoked-license handling, and paste-to-restore path. A forged
   token cannot add an eleventh food or print. Verification never blocks the
   free first paint. JSON export and accessibility remain free.
3. **404 reflow:** the standalone 404 removes intrinsic minimum widths, wraps
   narrow text, and uses a compact layout below 240 px. Its regression and the
   fresh live check both report a 195 px document at a 195 px viewport.

## Demo and live checks

One click opens seven foods, three placed meals, and three targets. The
**Demo — sample data, nothing is saved** label remains visible. A live run
added an eighth sample food, reset to seven, and returned to an unchanged real
food with **Start for real**.

The same live run checked the keyboard skip path, reduced motion, offline
reload and dialog use, the within-limit result, and the deliberate unknown-URL
404. Playwright Axe found no serious or critical issue on home, demo, planner,
Privacy, Terms, or 404. All normal routes had one h1, one main, route-specific
titles, labelled controls, and no console errors.

Live Lighthouse mobile results are 100 performance, 100 accessibility, 100
best practices, and 100 SEO. LCP was 1.59 s, TBT 0 ms, and CLS 0. The build is
34.09 kB JavaScript raw / 11.55 kB gzip and 14.53 kB CSS raw / 3.99 kB gzip.

## Clean-checkout verification

Detached checkout: `/tmp/nfp-repair9-clean.9JmNfp` at the implementation SHA.

```sh
npm ci
npm test
npm run lint
npm run build
npx playwright test --reporter=line
npm audit
npm audit --omit=dev
```

- Every exact command in `.factory/claims.json`: 17/17 passed separately.
- Unit tests: 14/14 passed.
- Browser tests: 45/45 passed.
- Both dependency audits: zero vulnerabilities.
- `dist/index.html` was produced.

The browser suite retains outcome checks for every earlier review and
verification class: offline/update behavior, malformed and unsafe imports,
numeric boundaries, whitespace recovery, storage failure, CSP-safe meters,
light/dark contrast, dialogs and route focus, skip navigation, cancellation,
deletion confirmation, target capacity, touch sizes, demo disposal, complete
JSON transfer, full-plan persistence, and safe food/target edits.

## Evidence

- Live outcome report: `evidence/repair-9-live-qa.json`
- Live audit script: `evidence/repair-9-live-qa.mjs`
- Lighthouse: `evidence/repair-9-lighthouse-live.json`
- Cold home phone/desktop: `evidence/repair-9-live-home/`
- Populated demo phone/desktop: `evidence/repair-9-live-demo/`
- 195 px 404: `evidence/repair-9-live-404-195.png`

The catalog description is 64 characters, starts with a verb, and is copied
to `/work/.evidence/catalog-description.txt`.

## Remaining external dependency

The Sociobot checkout route still returns HTTP 404 because the product offer
has not yet been registered by the separate billing operator. No provider
credential was invented and no checkout success is claimed. Public offer
metadata is at `/work/.evidence/billing-offer.json`, with the live $12 price,
one-time type, exact return URL, paid deliverables, and verification path.

After registration, the operator should run one real hosted-checkout purchase
and confirm that its returned license activates paid features. The free planner
already works. No backend, account, runtime AI action, CLI, or library checks
apply to this static local-first PWA. Lab INP was unavailable because
Lighthouse performs no interaction.

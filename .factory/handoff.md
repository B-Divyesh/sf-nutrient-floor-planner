# Nutrient Floor handoff

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

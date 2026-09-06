# Plan meals around nutrient targets — review 8

**Final verdict: FAIL.** One low-severity finding remains. There are zero
untested public claims.

## Candidate and scope

- Work order: `nutrient-floor-planner-review-8`
- Implementation reviewed: `75f1273057f842e046c59366a28151cb7f71a7c8`
- Documentation reviewed: `b0b3278e483dc70193affd0b826be6e8e62e9582`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Reviewed: 2026-09-06 UTC
- Product code was not changed.

Later commits through `30ed31a2d40aba8dff29519718140f96190d1f2b`
contain reports or generated Graphify output, not a newer product image. The
live JavaScript and CSS match the clean candidate build byte for byte.

## First screen and sample

The job is to plan meals against nutrient floors and limits chosen by the
user. The audience is home cooks who want enough fibre or protein without a
calorie diary. On fresh 1440 × 900 desktop and 390 × 844 phone loads, before
scrolling, the page states that job and audience. The first action is **Try it
with sample data**. Its adjacent text says that it loads seven foods, three
meals, and three targets. The free boundary and price, device storage, and
offline fact are also visible on the phone.

One click opened the populated sample with seven food rows, three meals, and
three targets. The persistent label read **Demo — sample data, nothing is
saved**. Fibre showed 40 g against a 30 g floor, protein showed 75.5 g against
a 75 g floor, and total sugar showed 35.1 g against a 36 g limit as **within
limit**.

In a fresh phone context, I saved a separate real food, entered the sample,
added an eighth demo-only food, and used **Reset demo**. Reset restored the
seven-food sample. **Start for real** then restored the real food and did not
show the demo-only food. No existing browser profile or real user data was
read or changed.

## Finding

### F-8-1 — Low — the documented browser suite has an asynchronous race

The first clean-checkout run of
`npx playwright test --reporter=line` failed 1 of 45 tests. The failure was the
`local-only` claim at `tests/claims.spec.ts:139`: immediately after clicking
**Restore purchase**, the test expected the mocked Sociobot verification
request array to contain one item, but it still contained zero.

The application starts verification in an asynchronous `submit` listener.
Playwright's click promise does not wait for that listener's fetch to begin,
and the assertion uses a synchronous `expect` rather than a retried web-first
assertion. This is a test timing defect, not evidence that meal data left the
device or that license verification failed.

The exact declared `local-only` command passed before this failure. A later
20-run repetition passed 20/20, and the exact README browser command passed
45/45 on a second run. Those passes confirm the product outcome but do not
erase a genuine failure from a documented clean-checkout command.

Repair: wait for the intercepted request or the completed verification state
before asserting the request count, then repeat the full clean-checkout suite.

## Claims and clean checkout

Detached checkout: `/tmp/nfp-review8-clean.mHaLlH` at the implementation SHA.
`npm ci` installed 58 packages and found zero vulnerabilities. Every exact
command in `.factory/claims.json` was run separately and passed:

| Claim IDs | Result |
| --- | --- |
| demo-week-coverage, sample-totals, sample-floor-status | PASS |
| one-time-upgrade, local-only, offline-use | PASS |
| json-transfer, local-persistence, demo-isolation, demo-reset | PASS |
| target-cap, print-week, food-source, target-comparison | PASS |
| user-chosen-targets, no-calorie-input, build-output | PASS |

The inventory guard found exactly one tagged browser test for each of the 17
claims. Landing, planner, Privacy, Terms, README, demo instructions, and
catalog copy were cross-checked against the inventory. No unlisted public
promise was found. Untested-claim count: **0**.

| Check | Result |
| --- | --- |
| `npm test` | PASS — copy guard, claim guard, 14/14 unit tests |
| `npm run lint` | PASS |
| `npm run build` | PASS — `dist/index.html` produced |
| First full browser run | **FAIL — 44/45; F-8-1** |
| `local-only` repeated 20 times | PASS — 20/20 |
| Exact `npx playwright test` retry | PASS — 45/45 |
| `npm audit` and `npm audit --omit=dev` | PASS — zero vulnerabilities |

The build contains 34.09 kB JavaScript raw (11.55 kB gzip), 14.53 kB CSS raw
(3.99 kB gzip), and a 121.88 kB hero image.

## Product paths and recovery

The passing full suite covers normal, invalid, boundary, and recovery paths:
complete JSON transfer; reload persistence; food, target, meal, and portion
editing; exact decimal thresholds; malformed and unsafe imports; finite-value
overflow; whitespace-only required fields; blocked storage; cancel and Escape;
confirmed deletion; five-target and ten-food boundaries; forged, valid,
cached, and restored licenses; printing; and all four target states.

Fresh live checks also proved:

- first Tab exposes the skip link and Enter moves focus to `main`;
- reduced-motion mode has no non-zero animation or transition duration;
- an offline demo reload renders the planner and opens **Add a meal**;
- `/`, `/demo`, `/plan`, `/privacy`, and `/terms` return 200 with specific
  titles, one h1, one main landmark, labelled controls, and no console errors;
- Axe reports no serious or critical issue on those routes or the 404;
- an unknown URL returns HTTP 404, says **Page not found**, offers recovery
  links, and has no horizontal overflow at 195 px;
- the manifest, robots file, sitemap, and standalone 404 asset are reachable;
- the live first-screen flow requests only the product origin.

The service-worker update regression passed in the successful browser run and
left only the new cache. Offline behavior is also covered by its own isolated
claim context.

Fresh mobile Lighthouse scored Performance 100, Accessibility 100, Best
Practices 100, and SEO 100. FCP was 0.9 s, LCP 1.4 s, TBT 0 ms, and CLS 0.
Response headers include HSTS, `nosniff`, a strict-origin referrer policy, and
a CSP limited to self resources plus the Sociobot license endpoint.

## Earlier finding disposition

Every earlier review and verification report, including minor findings, was
inspected. Current disposition is:

| Earlier finding group | Current evidence | Status |
| --- | --- | --- |
| Offline reload, bad precache, and old-cache update | Isolated offline and two-version worker tests pass; live offline dialog opens. | Fixed |
| Forged entitlement and missing paid scope | Valid verification or a fresh valid verdict is required; free use remains available while checking. | Fixed |
| Dead checkout | The required external endpoint returns the stipulated registration 404; fixtures prove the product flow. | Expected external condition |
| Empty-planner and dark-mode contrast | Current Axe scans have no serious or critical issue. | Fixed |
| Dialog, route, skip-link, and return focus | Keyboard and route-focus regressions pass; live skip path passes. | Fixed |
| Meal cancellation and destructive actions | Cancel leaks no meal; deletions require specific confirmation. | Fixed |
| Invalid import, unsafe IDs, and storage denial | Rejection and recovery tests pass without corrupting saved data. | Fixed |
| Missing capacity and build claims | Ten-food, five-target, and build-output claims exist and pass. | Fixed |
| Demo persistence and real-data isolation | Reload, exit, tab closure, reset, and fresh live real-plan separation pass. | Fixed |
| Metadata, icon sizes, headers, and CSP meters | Route and asset tests pass; live routes have no console errors. | Fixed |
| Decimal thresholds, whitespace loss, and numeric overflow | Boundary and recovery tests pass. | Fixed |
| Small touch targets and narrow layouts | Mobile target tests pass; live 195 px 404 width equals its viewport. | Fixed |
| Indirect copy, stale audit, unsupported drag, and decorative caption | Copy guard passes; direct labels remain; no drag claim or decorative caption remains. | Fixed |
| Incomplete sample, target-state, JSON, persistence, and editing proof | Dedicated outcome tests pass, including within-limit and deep JSON equality. | Fixed |
| Verification request test stability | The first fresh full-suite run exposed F-8-1. | **Open** |

No backend exists, so tenant isolation, server restart persistence, health,
and 429/Retry-After checks do not apply. No CLI, library, desktop package, or
runtime AI feature applies. A model feature would weaken the local-only design;
JSON transfer and printing cover the useful handoff paths.

The Sociobot checkout endpoint currently returns the stated HTTP 404 because
the external offer is not registered. This expected condition is not a broken
product page and is not counted as a finding.

## Evidence and counts

- `/work/.evidence/review8/live-review.json`
- `/work/.evidence/review8/claim-commands.log`
- `/work/.evidence/review8/playwright-full.log`
- `/work/.evidence/review8/local-only-repeat20.log`
- `/work/.evidence/review8/playwright-readme-command.log`
- `/work/.evidence/review8/lighthouse-live.json`
- `/work/.evidence/review8/runtime-hashes.log`
- `/work/.evidence/review8/verify-home/verify.json`
- `/work/.evidence/review8/verify-demo/verify.json`

Finding count: **1**. Untested claim count: **0**.

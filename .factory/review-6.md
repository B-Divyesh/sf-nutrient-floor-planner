# Adversarial first-read review 6 — PASS

Reviewed 2026-08-29 UTC against https://nutrient-floor-planner.sociobot.in.
No product code was changed. The researched brief file is absent; the shipped
design thesis, claims inventory, and live product established the baseline.

## Verdict

**PASS.** Zero findings remain. The first read is clear, the one-click demo is
real and isolated, every declared claim passed from a clean clone, and no
unlisted claim, route failure, or earlier regression was found.

## Cold first screen

Fresh contexts at 390 × 844 and 1440 × 900, before scrolling:

| Question | Answer | Exact supporting copy |
| --- | --- | --- |
| What does this do? | Plans meals against nutrient targets. | “Plan meals that meet your nutrient targets.” |
| For whom? | Home cooks who want fibre/protein without calorie logging. | “For home cooks who want enough fibre or protein without logging every calorie.” |
| What first? | Open the populated sample. | “Try it with sample data” / “Loads seven foods, three meals, and three targets.” |

The action and all three facts were above the fold. Mobile had no horizontal
overflow. The blueprint sheet visual is product-specific and does not carry
required text.

## Copy audit

Counts use visible words. Every sentence and meaningful label is listed. No
text exceeds 22 words or has jargon, a marketing adjective, a mood/metaphor
heading, inconsistent terminology, or a non-result-naming button.

### Landing

| Copy | Words | Check |
| --- | ---: | --- |
| Skip to planner | 3 | Direct skip action |
| Nutrient Floor | 2 | Wordmark |
| Demo / Planner / Privacy / Terms | 1 each | Direct navigation |
| Private meal planner | 3 | Direct product label |
| Plan meals that meet your nutrient targets. | 7 | Job-first h1 |
| For home cooks who want enough fibre or protein without logging every calorie. | 13 | no-calorie-input |
| Try it with sample data | 5 | Result-naming action |
| Loads seven foods, three meals, and three targets. | 8 | demo-week-coverage |
| Free to use | 3 | free-to-use |
| Stored on this device | 4 | local-persistence |
| Works offline after setup | 4 | offline-use |
| Ingredients arranged across a blue kitchen planning sheet. | 8 | Useful alt text |
| Sample weekly nutrient totals | 4 | Direct heading |
| Save familiar foods, choose targets, and place meal portions on a week. | 12 | Tested workflow |
| Fibre / 40 g / above the 30 g floor | 1 / 2 / 5 | sample-floor-status |
| Protein / 75.5 g / above the 75 g floor | 1 / 2 / 5 | sample-floor-status |
| Plan a week in three steps | 6 | Direct heading |
| 01 / Set a target | 5 | Direct step |
| Choose a floor or limit in grams. | 7 | target-comparison |
| 02 / Save your foods | 5 | Direct step |
| Enter values and a source from the label. | 8 | food-source |
| 03 / Place meals | 4 | Direct step |
| See gaps before you cook. | 5 | target-comparison |
| How your food values are used | 6 | Direct heading |
| The planner compares your food values with your targets. | 9 | target-comparison |
| Check labels before relying on the totals. | 7 | Useful caution |
| Private meal planning around your nutrient targets. | 7 | Direct footer line |
| Built by Param Factory / v1.5 | 4 / 1 | Credit/version |

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Nutrient Floor | 2 | Heading |
| Plan meals that meet your nutrient targets. | 7 | Job statement |
| For home cooks who want more fibre or protein, or less sugar, without a calorie diary. | 16 | no-calorie-input; target-comparison |
| Save your foods, choose weekly floors or limits, and place meals on a week. | 14 | target-comparison |
| Try the sample plan at /?demo=1 or /demo. | 8 | Demo entry |
| It opens with seven foods, three meals, and three targets. | 10 | demo-week-coverage |
| Sample changes stay only in the open demo. | 8 | demo-isolation |
| Reloading or leaving restores the bundled sample. | 7 | demo-isolation |
| It never touches your real plan. | 6 | demo-reset |
| Run locally | 2 | Heading |
| Open http://localhost:5173. | 2 | Instruction |
| Use Start for real, or open /plan, to create your plan. | 11 | Instruction |
| Run checks | 2 | Heading |
| The production build contains dist/index.html. | 5 | build-output |
| Deploy it as a static single-page application. | 7 | Instruction |
| Keep the included staticwebapp.config.json. | 4 | Instruction |
| Data and privacy | 3 | Heading |
| Foods, targets, and meal portions stay in browser storage on your device. | 12 | local-persistence |
| The planner uses no analytics and sends no meal data elsewhere. | 11 | local-only |
| You can export and reimport the complete plan as JSON. | 10 | json-transfer |
| Nutrient Floor is free to use. | 6 | free-to-use |
| The planner and demo work offline after setup. | 8 | offline-use |
| You can also print the weekly plan. | 7 | print-week |
| Read /privacy and /terms for details. | 6 | Instruction |
| How totals work | 3 | Heading |
| You enter each food value and its source. | 8 | food-source |
| The planner compares those values with the targets you choose. | 10 | target-comparison |
| It does not supply recommended target values. | 7 | user-chosen-targets |
| Check labels before relying on a total. | 7 | Useful caution |
| Claims covered by browser tests | 5 | Accurate heading |
| The sample opens with seven foods, three placed meals, and three targets. | 12 | demo-week-coverage |
| The sample week totals 40 g fibre and 75.5 g protein. | 11 | sample-totals |
| The sample shows 40 g fibre above a 30 g floor and 75.5 g protein above a 75 g floor. | 20 | sample-floor-status |
| Nutrient Floor is free to use with no payment gate. | 10 | free-to-use |
| The planner uses no analytics and sends no meal data elsewhere. | 11 | local-only |
| The planner and demo work offline after setup. | 8 | offline-use |
| You can export and reimport your complete plan as JSON. | 10 | json-transfer |
| Foods, targets, and meal portions stay on this device. | 9 | local-persistence |
| Demo changes stay in the open tab and reset when you leave. | 12 | demo-isolation |
| The planner saves up to five targets. | 7 | target-cap |
| The planner prints a weekly plan. | 6 | print-week |
| Food values are entered by you and saved with a source. | 11 | food-source |
| The planner compares your food values with floors and limits you choose. | 12 | target-comparison |
| It shows short, on-plan, within-limit, and over-limit states. | 8 | target-comparison |
| The planner does not supply recommended target values. | 8 | user-chosen-targets |
| You can plan meals without entering calories. | 7 | no-calorie-input |
| The production build contains dist/index.html. | 5 | build-output |
| Every claim and its exact Playwright command is in .factory/claims.json. | 10 | Inventory guard confirms mapping |

Terms remain consistent: food, meal, portion, floor, limit, target, plan, and
demo. The landing audit matches source and npm test guards against drift.

## Demo, sandbox, privacy, and offline behaviour

One click from the 390 px landing page opened /?demo=1 with seven named foods,
three placed meals, three targets, calculated totals, and the persistent
“Demo — sample data, nothing is saved.” banner. Adding a marker food changed
seven to eight; Reset demo restored seven. Start for real opened /plan, removed
the banner, and displayed the empty real planner.

The demo run did not create a real:plan IndexedDB value. Demo changes are held
in memory; code only reads/writes real:plan outside demo. Tagged tests verify
reset, hard navigation, reload, tab closure, and real-plan retention.

Landing and demo request logs contained only same-origin traffic: no analytics,
XHR, fetch, EventSource, websocket, or ping data transfer. After service-worker
setup, both /demo and /plan reloaded offline and opened Add a meal.

## Claims and clean-clone checks

Clean clone: /tmp/nutrient-floor-review6.RuHLFs at 66bb3c6. After npm ci, all
17 exact commands in .factory/claims.json passed separately:

| Claim IDs | Result |
| --- | --- |
| demo-week-coverage, sample-totals, sample-floor-status | pass |
| free-to-use, local-only, offline-use | pass |
| json-transfer, local-persistence | pass |
| demo-isolation, demo-reset | pass |
| target-cap, print-week, food-source | pass |
| target-comparison, user-chosen-targets, no-calorie-input, build-output | pass |

The same checkout passed npm test (14 unit tests plus copy/claim guards), npm
run lint, npm run build, and full Playwright (44/44). Build output contains
dist/index.html; JavaScript is 10.18 kB gzip and CSS is 3.85 kB gzip. Every
customer-facing landing/README promise has a declared observable test.

## Structure, accessibility, routes, and identity

- /, /demo, /plan, /privacy, /terms, /404.html, linked assets, robots.txt, and
  sitemap.xml returned 200. An unknown route returned HTTP 404 with direct
  “Page not found” wording.
- Every app route has one h1/main, route-specific title/description/canonical,
  OG/Twitter image, favicon, shared header/footer, skip link, Privacy, and
  Terms. SPA navigation/back focuses the new h1 and announces it.
- A live crawl found no dead HTTP links; #main and mailto are appropriate
  non-HTTP links.
- Live mobile Axe found no serious/critical issue on home, demo, planner,
  privacy, terms, or 404. Normal routes logged no console errors.
- The CSP is a self-only response header with frame-ancestors, nosniff, and a
  strict-origin referrer policy.
- The blueprint palette, ruled board, clipped mark, original ingredient art,
  Georgia/monospace pairing, square controls, and reduced-motion styling match
  the design thesis and are distinct from generic SaaS design.

## Earlier finding verification

Every earlier review, polish report, and handoff was read and live/code checked:

| Finding | Current confirmation | Result |
| --- | --- | --- |
| F-1-1 paid checkout | No payment/checkout/license/gate; twelve foods save. | fixed |
| F-1-2 forged entitlement | No entitlement code; legacy token has no effect. | fixed |
| F-1-3 incomplete 404 | Full shell, metadata, legal links, recovery actions. | fixed |
| F-1-4 claims/demo persistence | In-memory demo; exits/reset/calorie/offline covered. | fixed |
| F-1-5 indirect headings | Current headings are direct. | fixed |
| F-1-6 README wording | Within cap and reader-facing. | fixed |
| F-2-1 stale audit | Literal audit and drift guard pass. | fixed |
| F-2-2 indirect labels | Direct labels/accurate claims heading. | fixed |
| F-2-3 unsupported dragging | No draggable meals; editing is explicit. | fixed |
| F-2-4 tiny mobile notes | Essential notes are at least 14 px. | fixed |
| F-3-1 build claim | build-output exists and passes. | fixed |
| F-3-2 decorative caption | No visible caption; useful alt remains. | fixed |
| F-4-1 sample status | Floors, totals, states, meter names are tested. | fixed |
| F-5-1 targets/states | Tagged test covers all four states. | fixed |
| F-5-2 JSON proof | Tagged test deep-compares reimported plan. | fixed |
| F-5-3 persistence proof | Tagged test reloads food/target/meal/portion/values. | fixed |
| F-5-4 missing edits | Prefilled edits preserve meal links and persist. | fixed |

## Missed leverage

No AI feature is implied: planning totals is deterministic/local and sending
meal data would conflict with privacy. JSON import/export and printing cover
the obvious handoff needs. No provider key, decorative AI, account, or implied
sync feature was found. The absent brief prevents claiming more scope.

## What would make this perfect

The release meets the zero-finding standard. Maintain the one-to-one claim
inventory and rerun this review when copy, storage, or service-worker assets
change.

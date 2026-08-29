# Polish round 5 — cumulative finding map

Repair commit: `48170cc142287f1579af3ccb8438b2ada6ee02c4`.
Deployment: `9ad77d63-6505-4cd6-a36c-0945febbadd6`.
Live URL: <https://nutrient-floor-planner.sociobot.in/>.

Every `review-*.md` and `polish-*.md` was reread. The clean clone at
`/tmp/nutrient-floor-polish5.cbpahC` passed `npm ci`, `npm test`, lint,
build, all 17 exact claim commands, and Playwright 42/42. The final live
audit is [live-qa.json](evidence/polish-5-live/live-qa.json); its cold home
and direct-demo captures are in
[polish-5-live-home](evidence/polish-5-live-home/verify.json) and
[polish-5-live-demo](evidence/polish-5-live-demo/verify.json).

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 — dead paid checkout | The unavailable price, checkout, license, and upgrade path remain removed. The full planner is free. | Clean `@claim:free-to-use` (12 foods, no gate); [live home](https://nutrient-floor-planner.sociobot.in/) cold check; [home screenshot](evidence/polish-5-live-home/screenshot-mobile.png). |
| F-1-2 — forged token entitlement | No entitlement code exists; a legacy local token cannot change access or capacity. | Clean `@claim:free-to-use`; live home and planner audit in [live QA](evidence/polish-5-live/live-qa.json). |
| F-1-3 — incomplete 404 | The HTTP 404 keeps direct wording, shared header/footer, metadata, favicon, legal links, and recovery actions. | Live `GET /polish-5-not-found` returned 404 with the full shell in [live QA](evidence/polish-5-live/live-qa.json); [mobile 404 screenshot](evidence/polish-5-local/404-mobile.png). |
| F-1-4 — incomplete claims / persistent demo | The separate in-memory demo, reset/reload/exit behavior, no-calorie, offline, privacy, and declared claims remain covered. The three review-5 claim scopes were strengthened below. | Clean `@claim:demo-isolation`, `@claim:demo-reset`, `@claim:offline-use`, `@claim:no-calorie-input`; direct `?demo=1` live check; [live QA](evidence/polish-5-live/live-qa.json). |
| F-1-5 — indirect landing headings | Job-first headline, direct section headings, first-screen outcome, and free-plan facts remain in place. | `npm test` copy-audit guard; 390 px first-screen test; [live home](https://nutrient-floor-planner.sociobot.in/). |
| F-1-6 — long or technical README copy | README remains plain, under the sentence cap, and now says exactly what the full plan transfer and local persistence tests prove. | `npm test` copy guard; [README](../README.md); clean clone pass. |
| F-2-1 — stale copy audit | The audited landing strings are still literal source strings and the guard fails on drift. | `scripts/check-copy-audit.mjs` through `npm test`; [copy audit](copy-audit.md). |
| F-2-2 — indirect labels | Direct landing labels and the accurate README heading “Claims covered by browser tests” remain. | `npm test`; [live home](https://nutrient-floor-planner.sociobot.in/). |
| F-2-3 — unsupported dragging | Meal cards remain non-draggable; explicit meal edit is retained, with no misleading drag affordance. | `npm test` source guard; clean Playwright 42/42; [live demo](https://nutrient-floor-planner.sociobot.in/?demo=1). |
| F-2-4 — 12 px mobile notes | Essential annotations remain 14 px or larger at phone and 200% widths; new edit controls stay 44×44 px. | Clean mobile/zoom test; live edit controls are 44×44 in [live QA](evidence/polish-5-live/live-qa.json); [mobile demo screenshot](evidence/polish-5-local/demo-mobile.png). |
| F-3-1 — unlisted build output | `build-output` remains declared with its exact tagged test. | Clean `@claim:build-output`; `npm run build` produced `dist/index.html`. |
| F-3-2 — decorative hero caption | The visible caption remains absent while the image keeps useful alt text. | `npm test` source guard; [live home](https://nutrient-floor-planner.sociobot.in/). |
| F-4-1 — untested sample floor status | `sample-floor-status` remains declared and proves both displayed totals, floors, pass states, and meter names. | Clean `@claim:sample-floor-status`; [direct live demo](https://nutrient-floor-planner.sociobot.in/?demo=1). |
| F-5-1 — unproved limits and gaps | Expanded `target-comparison` claim/test. It creates floors and limits through the UI and checks short, on-plan, within-limit, and over-limit states plus meter names. | Clean `@claim:target-comparison`; live four-state check in [live QA](evidence/polish-5-live/live-qa.json). |
| F-5-2 — incomplete JSON proof | Rewrote the claim/README as complete export and reimport. The tagged test deep-compares all JSON plan fields after export/import/export. | Clean `@claim:json-transfer`; live byte-for-byte round trip in [live QA](evidence/polish-5-live/live-qa.json). |
| F-5-3 — food-only persistence proof | Rewrote the claim/README and expanded the tagged test to save and reload a food, source, values, target, meal, and portion relationship. | Clean `@claim:local-persistence`; live food/target/meal reload check in [live QA](evidence/polish-5-live/live-qa.json). |
| F-5-4 — no food/target editing | Added prefilled Edit food and Edit target dialogs. Updates keep IDs, retain meal portions, recalculate immediately, return focus, work with Enter, and persist. | `food and target edits preserve meal portions, return focus, recalculate totals, and persist`; keyboard and 44 px live controls in [live QA](evidence/polish-5-live/live-qa.json). |

## Final evidence

- Claim logs: [local claim evidence](evidence/polish-5-local/claims/).
- Product screenshots: [home desktop](evidence/polish-5-local/home-desktop.png),
  [demo mobile](evidence/polish-5-local/demo-mobile.png), and
  [404 mobile](evidence/polish-5-local/404-mobile.png).
- Live routes `/`, `/demo`, `/plan`, `/privacy`, `/terms`, and `/404.html`
  each have one h1, one main, the expected title, and zero serious/critical
  Axe findings; the unknown-route response is HTTP 404. See
  [live QA](evidence/polish-5-live/live-qa.json).

No review finding remains unresolved.

# Polish round 4 — cumulative finding map

Implementation commit: `89dff8e723ec6af694542659860e5ef359240908`.
Azure deployment: `4893ba8f-d69d-4318-9ee3-acca73263ea2`.
Live URL: <https://nutrient-floor-planner.sociobot.in/>.

Every `.factory/review-*.md` and `.factory/polish-*.md` report was reread.
Each finding below was checked in a clean clone and again on the deployed site.

| Finding | Change made or retained | Exact evidence |
| --- | --- | --- |
| F-1-1 — unavailable paid checkout | The broken checkout, price, license, and upgrade path remain removed. The complete planner is free. | `@claim:free-to-use ignores a legacy forged token and does not gate foods`; [clean claim log](evidence/polish-4-clean/claims/free-to-use.log); [live home screenshot](evidence/polish-4-live-home-mobile.png); [live home](https://nutrient-floor-planner.sociobot.in/) has no paid copy or Sociobot link. |
| F-1-2 — forged token entitlement | License and entitlement code remain absent. A forged legacy token cannot alter capacity or UI. | `@claim:free-to-use`; [live QA](evidence/polish-4-live-qa.json) records 12 foods, no paid copy, and no billing link at [live planner](https://nutrient-floor-planner.sociobot.in/plan). |
| F-1-3 — incomplete 404 | The real HTTP 404 keeps direct wording, the blueprint shell, metadata, favicon, navigation, legal links, footer, and two recovery actions. | `the styled 404 has the full shell, legal links, metadata, and recovery actions`; [live 404 screenshot](evidence/polish-4-live-404-mobile.png); [live unknown route](https://nutrient-floor-planner.sociobot.in/polish-4-page-not-found) returned 404 in [HTTP evidence](evidence/polish-4-live-http.log). |
| F-1-4 — incomplete claims and persistent demo | The demo stays in memory, never reads or writes real-plan data, and resets on reload, visible exit, hard exit, tab closure, or Reset demo. The inventory now has 17 one-to-one claim tests. | `@claim:demo-isolation`, `@claim:demo-reset`, `@claim:offline-use`, `@claim:no-calorie-input`, and `@claim:sample-floor-status`; [clean claim logs](evidence/polish-4-clean/claims); [live demo screenshot](evidence/polish-4-live-demo-mobile.png); [live demo](https://nutrient-floor-planner.sociobot.in/?demo=1) recorded 7→8→7 and 7 after every exit in [live QA](evidence/polish-4-live-qa.json). |
| F-1-5 — indirect landing headings | The first screen retains the job-first headline, audience sentence, one-click sample action with its outcome, and three short facts. Section headings state their purpose. | `landing first screen remains readable and actionable at 390px`; [live home screenshot](evidence/polish-4-live-home-mobile.png); [live home](https://nutrient-floor-planner.sociobot.in/) exact text is recorded in [live QA](evidence/polish-4-live-qa.json). |
| F-1-6 — long or technical README copy | README remains direct, uses browser-facing words, and contains no commercial promise. The new sample-floor sentence is 19 words. | `npm test` copy-audit guard in [clean test log](evidence/polish-4-clean/npm-test.log); current [README](../README.md); [live home screenshot](evidence/polish-4-live-home-mobile.png). |
| F-2-1 — stale copy audit | The audit remains synchronized with every visible landing string and now records release `v1.5`. | `scripts/check-copy-audit.mjs` through `npm test`; [clean test log](evidence/polish-4-clean/npm-test.log); [copy audit](copy-audit.md); [live home](https://nutrient-floor-planner.sociobot.in/). |
| F-2-2 — indirect labels and inaccurate README heading | The redundant sample eyebrow remains absent. “How your food values are used” and “Claims covered by browser tests” remain direct. | `landing first screen remains readable and actionable at 390px`; [live home screenshot](evidence/polish-4-live-home-mobile.png); live headings are recorded in [live QA](evidence/polish-4-live-qa.json). |
| F-2-3 — nonfunctional dragging | Meal cards remain non-draggable; their explicit edit button is the supported keyboard path. | `npm test` source guard plus full browser suite; [clean browser log](evidence/polish-4-clean/playwright-full.log); [live demo](https://nutrient-floor-planner.sociobot.in/?demo=1) has zero draggable elements in [live QA](evidence/polish-4-live-qa.json). |
| F-2-4 — 12 px mobile annotations | Essential meal, portion, food-source, day, total, and add-meal text remains at least 14 px on phones. The weekly board scrolls without page overflow. | `mobile and 200% zoom-equivalent layouts avoid page overflow`; [live demo screenshot](evidence/polish-4-live-demo-mobile.png); [live QA](evidence/polish-4-live-qa.json) records 14 px text and 195 px document width at [live demo](https://nutrient-floor-planner.sociobot.in/demo). |
| F-3-1 — undeclared build claim | `build-output` remains a declared one-to-one claim and checks a complete production app shell. | `@claim:build-output produces a complete dist/index.html app shell`; [clean claim log](evidence/polish-4-clean/claims/build-output.log); [clean build log](evidence/polish-4-clean/npm-build.log); live `/` returned 200 in [HTTP evidence](evidence/polish-4-live-http.log). |
| F-3-2 — decorative hero caption | The visible caption remains removed; the useful image alternative remains. | `landing first screen remains readable and actionable at 390px`; [live home screenshot](evidence/polish-4-live-home-mobile.png); [live home](https://nutrient-floor-planner.sociobot.in/) records zero captions and the exact alt text in [live QA](evidence/polish-4-live-qa.json). |
| F-4-1 — untested sample floor values and pass states | Added `sample-floor-status` to `claims.json` and README. Its browser test connects the landing preview to the real sample calculation and checks both labels, floors, totals, pass classes, “on plan” text, and accessible meter names. | `@claim:sample-floor-status shows both sample floors and their passing results`; [clean claim log](evidence/polish-4-clean/claims/sample-floor-status.log); [live home screenshot](evidence/polish-4-live-home-mobile.png); [live demo screenshot](evidence/polish-4-live-demo-mobile.png); exact live values and states are in [live QA](evidence/polish-4-live-qa.json). |

## Verification summary

- Clean clone: `/tmp/nutrient-floor-polish4.NmsEpg` at `89dff8e723ec6af694542659860e5ef359240908`.
- `npm ci`: passed with zero vulnerabilities.
- `npm test`: 11 unit tests plus copy and 17-claim inventory guards passed.
- `npm run lint`: passed.
- `npm run build`: passed; JavaScript is 26.53 kB raw / 9.17 kB gzip and CSS is 13.08 kB raw / 3.74 kB gzip.
- Every exact command in `.factory/claims.json`: 17/17 passed separately.
- Full Playwright suite: 41/41 passed.
- Factory `verify-url.sh`: cold live home and demo passed with no console errors.
- Live route, metadata, demo, privacy, offline, focus, 404, and mobile audit: passed.
- Live Axe: zero serious or critical findings on home, demo, planner, Privacy, Terms, and 404.
- Live Lighthouse: 100 performance, 100 accessibility, 100 best practices, and 100 SEO; LCP 1.083 s, CLS 0, TBT 0.
- The catalog description is a 58-character, verb-first sentence.

No finding remains unresolved.

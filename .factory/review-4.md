# Adversarial first-read review 4 — FAIL

Reviewed 2026-08-29 UTC against <https://nutrient-floor-planner.sociobot.in>
and a fresh clean clone of `0883d3c12a7ce705b2c597535e09d5bb6eb0a8a0`.
This review changed no product code.

## Verdict

**FAIL.** One claim-like statement in the live landing preview is not covered
by a matching `claims.json` entry and observable claim test. All other checks
in this round passed. A PASS requires zero findings.

## Cold first screen

Fresh Chromium contexts with no prior browser storage were opened at 390 × 844
and 1440 × 900. Before scrolling, both gave these answers:

| Question | First-read answer | Check |
| --- | --- | --- |
| What does it do? | It plans meals against nutrient targets. | Clear from “Plan meals that meet your nutrient targets.” |
| For whom? | Home cooks who want enough fibre or protein without logging calories. | Clear from “For home cooks who want enough fibre or protein without logging every calorie.” |
| What should I click first? | “Try it with sample data.” | Clear; the adjacent outcome says it loads seven foods, three meals, and three targets. |

The action and the three facts — “Free to use,” “Stored on this device,” and
“Works offline after setup” — were visible without scrolling at both sizes.
The first-screen check is not blocking.

## Findings

### F-4-1 — MAJOR — Sample target values and pass states are unlisted claims

- **Location / exact quotes:** Landing, **“40 g / above the 30 g floor”** and
  **“75.5 g / above the 75 g floor.”**
- **Evidence:** `sample-totals` declares only “The sample week totals 40 g
  fibre and 75.5 g protein.” `demo-week-coverage` proves only the count of
  three targets. `target-comparison` proves a separately created plan against
  a generic target and lists “landing explanation,” not the sample preview,
  in its `where` field. No entry declares or tests the sample’s 30 g and 75 g
  floor values or its displayed “above” state.
- **Why this matters:** A visitor can use these numbers to decide that the
  sample clears its targets. The inventory cannot detect a changed sample
  target or a wrong pass label while the claimed totals still pass.
- **Concrete fix:** Add a claim such as `sample-floor-status`: “The sample
  displays 40 g fibre above a 30 g floor and 75.5 g protein above a 75 g
  floor.” List the landing sample preview as `where`; from a fresh `/demo`
  context assert both target labels, target values, calculated totals, and
  `on plan` states. Alternatively remove the two floor/status statements
  from the landing preview.

## Copy audit

Word counts split visible words on whitespace. Navigation labels, the version,
and code-block commands are labels or commands, not sentences. No audited
landing or README sentence exceeds 22 words. No banned marketing adjective,
jargon term, inconsistent core term, mood heading, or non-result-naming
button was found. The sole claim-coverage issue is F-4-1.

### Landing page

| Text | Words | Check |
| --- | ---: | --- |
| Private meal planner | 3 | Direct product label |
| Plan meals that meet your nutrient targets. | 7 | Direct h1 |
| For home cooks who want enough fibre or protein without logging every calorie. | 13 | Audience and change |
| Try it with sample data | 5 | Result-naming action |
| Loads seven foods, three meals, and three targets. | 8 | `demo-week-coverage` |
| Free to use | 3 | `free-to-use` |
| Stored on this device | 4 | `local-persistence` |
| Works offline after setup | 4 | `offline-use` |
| Ingredients arranged across a blue kitchen planning sheet. (image alt) | 8 | Descriptive alt |
| Sample weekly nutrient totals | 4 | Direct section heading |
| Save familiar foods, choose targets, and place meal portions on a week. | 12 | Usable product description |
| Fibre | 1 | Data label |
| 40 g | 2 | `sample-totals` |
| above the 30 g floor | 5 | **F-4-1** |
| Protein | 1 | Data label |
| 75.5 g | 2 | `sample-totals` |
| above the 75 g floor | 5 | **F-4-1** |
| Plan a week in three steps | 6 | Direct section heading |
| 01 / Set a target | 5 | Direct step label |
| Choose a floor or limit in grams. | 7 | Direct instruction |
| 02 / Save your foods | 5 | Direct step label |
| Enter values and a source from the label. | 8 | `food-source` |
| 03 / Place meals | 4 | Direct step label |
| See gaps before you cook. | 5 | `target-comparison` |
| How your food values are used | 6 | Direct section heading |
| The planner compares your food values with your targets. | 9 | `target-comparison` |
| Check labels before relying on the totals. | 7 | Useful caution |
| Private meal planning around your nutrient targets. | 7 | Footer description |

### README

| Text | Words | Check |
| --- | ---: | --- |
| Nutrient Floor | 2 | Document title |
| Plan meals that meet your nutrient targets. | 7 | Direct summary |
| For home cooks who want more fibre or protein, or less sugar, without a calorie diary. | 16 | Audience and change |
| Save your foods, choose weekly floors or limits, and place meals on a week. | 14 | Direct description |
| Try the sample plan at `/?demo=1` or `/demo`. | 8 | Direct instruction |
| It opens with seven foods, three meals, and three targets. | 10 | `demo-week-coverage` |
| Sample changes stay only in the open demo. | 8 | `demo-isolation` |
| Reloading or leaving restores the bundled sample. | 7 | `demo-isolation` |
| It never touches your real plan. | 6 | `demo-reset` |
| Run locally | 2 | Direct heading |
| Open `http://localhost:5173`. | 2 | Direct instruction |
| Use Start for real, or open `/plan`, to create your plan. | 11 | Direct instruction |
| Run checks | 2 | Direct heading |
| The production build contains `dist/index.html`. | 5 | `build-output` |
| Deploy it as a static single-page application. | 7 | Developer instruction |
| Keep the included `staticwebapp.config.json`. | 4 | Developer instruction |
| Data and privacy | 3 | Direct heading |
| Foods, targets, and meals stay in browser storage on your device. | 11 | `local-persistence` |
| The planner uses no analytics and sends no meal data elsewhere. | 11 | `local-only` |
| You can export or import the complete plan as JSON. | 10 | `json-transfer` |
| Nutrient Floor is free to use. | 6 | `free-to-use` |
| The planner and demo work offline after setup. | 8 | `offline-use` |
| You can also print the weekly plan. | 7 | `print-week` |
| Read `/privacy` and `/terms` for details. | 6 | Direct instruction |
| How totals work | 3 | Direct heading |
| You enter each food value and its source. | 8 | `food-source` |
| The planner compares those values with the targets you choose. | 10 | `target-comparison` |
| It does not supply recommended target values. | 7 | `user-chosen-targets` |
| Check labels before relying on a total. | 7 | Useful caution |
| Claims covered by browser tests | 5 | Direct heading |
| The sample opens with seven foods, three placed meals, and three targets. | 12 | `demo-week-coverage` |
| The sample week totals 40 g fibre and 75.5 g protein. | 11 | `sample-totals` |
| Nutrient Floor is free to use with no payment gate. | 10 | `free-to-use` |
| The planner uses no analytics and sends no meal data elsewhere. | 11 | `local-only` |
| The planner and demo work offline after setup. | 8 | `offline-use` |
| You can export or import your complete plan. | 8 | `json-transfer` |
| Your plan stays on this device. | 6 | `local-persistence` |
| Demo changes stay in the open tab and reset when you leave. | 12 | `demo-isolation` |
| The planner saves up to five targets. | 7 | `target-cap` |
| The planner prints a weekly plan. | 6 | `print-week` |
| Food values are entered by you and saved with a source. | 11 | `food-source` |
| The planner compares entered food values with targets you choose. | 10 | `target-comparison` |
| The planner does not supply recommended target values. | 8 | `user-chosen-targets` |
| You can plan meals without entering calories. | 7 | `no-calorie-input` |
| The production build contains `dist/index.html`. | 5 | `build-output` |
| Every claim and its exact Playwright command is in `.factory/claims.json`. | 10 | Confirmed |

Terminology is consistent: **food**, **meal**, **portion**, **floor**,
**limit**, **target**, **plan**, and **demo** retain one meaning.

## Demo, sandbox, privacy, and offline checks

The one-click demo path passes. From a fresh 390 px context, the landing
action opened `/?demo=1` directly into the planner with seven food rows, three
placed meals, three targets, calculated totals, and the persistent banner
**“Demo — sample data, nothing is saved.”** The first demo screen therefore
already shows the product in use.

- Adding a demo food changed the count from 7 to 8; **Reset demo** returned it
  to 7.
- **Start for real** opened `/plan` after its asynchronous navigation, removed
  the banner, and showed an empty real plan in the fresh context.
- Fresh demo localStorage and sessionStorage were empty. The live request log
  for landing, demo entry, add-food, reset, and start-for-real contained only
  same-origin document, script, stylesheet, and image requests; no fetch,
  XHR, websocket, ping, or foreign request occurred.
- After service-worker setup, live `/demo` and `/plan` both reloaded while
  offline and opened **Add a meal** successfully.

No demo or privacy blocker was reproduced.

## Claims and clean-clone checks

A fresh clone at `/tmp/nutrient-review-4.7DgKye` ran `npm ci`, `npm test`,
`npm run lint`, `npm run build`, every exact command in `.factory/claims.json`
separately, and `npx playwright test --reporter=line`.

| Claim ID | Result |
| --- | --- |
| `demo-week-coverage`, `sample-totals`, `free-to-use`, `local-only` | pass |
| `offline-use`, `json-transfer`, `local-persistence`, `demo-isolation` | pass |
| `demo-reset`, `target-cap`, `print-week`, `food-source` | pass |
| `target-comparison`, `user-chosen-targets`, `no-calorie-input`, `build-output` | pass |

`npm test` passed its 11 unit tests and both copy/claim inventory guards.
`npm run lint` passed. `npm run build` produced `dist/index.html` with 9.17 kB
gzip JavaScript and 3.74 kB gzip CSS. The full Playwright run passed 40/40.
No declared test failed; F-4-1 concerns a missing declared sample-status
claim.

## Structure, routing, accessibility, and identity

- `/`, `/demo`, `/plan`, `/privacy`, and `/terms` returned 200. A bad URL
  returned the designed 404, with direct **“Page not found”** wording, shared
  shell, legal links, metadata, favicon, and recovery actions.
- Each checked route had one h1 and one main landmark, `lang="en"`, a
  route-specific title/description/canonical URL, Open Graph/Twitter image,
  favicon, skip link, and shared header/footer. The expected browser resource
  message for the deliberate HTTP 404 was the only 404-page console item.
- Crawled internal links, the demo query URL, sitemap, robots file, manifest,
  favicon, and OG image returned 200. The contact address is an explicit
  `mailto:` link.
- SPA navigation to Privacy and Back moved focus to the new h1 and updated the
  polite route announcement after rendering.
- The original blueprint drafting-sheet art, paper/navy palette, ruled weekly
  board, square controls, Georgia/monospace pairing, and clipped NF mark match
  `.factory/design.md` and are not a generic SaaS template.

## Earlier finding verification

Every earlier review, polish report, and current handoff was read. Each prior
finding was checked again against current source and the live deployment.

| Earlier finding | Current confirmation | Result |
| --- | --- | --- |
| F-1-1 dead $12 checkout | No price, checkout, license, upgrade, or payment gate remains; `free-to-use` passed. | fixed |
| F-1-2 forged-token entitlement | No entitlement code remains; the forged-token regression saved 12 foods. | fixed |
| F-1-3 incomplete 404 | Live 404 has direct wording, metadata, favicon, header/footer, legal links, and recovery actions. | fixed |
| F-1-4 incomplete claims / demo persistence | 16 declared commands passed; reset, exits, tab closure, real-data isolation, and offline behavior passed. | fixed for its recorded scope; F-4-1 is a new narrower inventory gap |
| F-1-5 indirect landing headings | The prior quoted headings are absent; current section headings name their sections. | fixed |
| F-1-6 long or technical README copy | All README sentences are at or below 22 words; prior storage and commercial jargon is absent. | fixed |
| F-2-1 stale copy audit | Current audit matches current landing text and the guard passed. | fixed |
| F-2-2 indirect labels / inaccurate README heading | Direct values heading and “Claims covered by browser tests” remain. | fixed |
| F-2-3 nonfunctional dragging | No draggable meal cards are present; explicit edit controls remain. | fixed |
| F-2-4 12 px mobile annotations | Mobile critical annotations render at 14 px; zoom/mobile browser tests passed. | fixed |
| F-3-1 missing README build claim | `build-output` is declared and passed. | fixed |
| F-3-2 decorative hero caption | No visible decorative caption remains; meaningful image alt remains. | fixed |

## Missed leverage

No additional AI feature is required: target comparison is deterministic and
local, and sending meal data to a model would weaken the stated privacy model.
Complete JSON import/export and printing already cover the obvious transfer
and handoff needs. No provider key or decorative AI feature is present.

## What would make this perfect

Add and pass a sample-floor-status claim test for the two displayed floor
values and “above” results, then repeat the live first-read and clean-clone
claim pass. No other product change is indicated by this review.

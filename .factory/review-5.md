# Adversarial first-read review 5 — FAIL

Reviewed 2026-08-29 UTC against
<https://nutrient-floor-planner.sociobot.in> and clean clone
`/tmp/nutrient-review5.eMGX2O` at
`4355c256b79c8e5672355693b02ab7ef4dddef6b`. No product code was changed.

## Verdict

**FAIL.** The first read, demo, live behavior, all 17 declared claim commands,
quality gates, accessibility scan, routing, and prior repairs pass. Four major
findings remain: three visitor promises are stronger than their designated
claim tests, and saved foods and targets cannot be edited. PASS requires zero
findings and no untested claim.

No finding in this round is classified as blocking: the demo is not missing or
weak, no declared claim command failed, and no earlier blocking finding
regressed.

## Cold first screen

Fresh Chromium contexts with no prior storage opened `/` at 390 × 844 and
1440 × 900. Before scrolling, both gave the same answers:

| Question | First-read answer | Check |
| --- | --- | --- |
| What does it do? | It plans meals against nutrient targets. | Clear from “Plan meals that meet your nutrient targets.” |
| For whom? | Home cooks who want enough fibre or protein without logging calories. | Clear from the 13-word audience sentence. |
| What should I click first? | “Try it with sample data.” | Clear; the adjacent result says it loads seven foods, three meals, and three targets. |

The primary action and all three facts — “Free to use,” “Stored on this
device,” and “Works offline after setup” — were above the fold at both sizes.
The mobile page had no horizontal overflow. This check passes.

## Findings

### F-5-1 — MAJOR — Floors, limits, and gap states are not proved by the designated claim test

- **Exact locations / quotes:** landing **“Choose a floor or limit in grams.”**
  and **“See gaps before you cook.”**; README **“Save your foods, choose
  weekly floors or limits, and place meals on a week.”**
- **Evidence:** `target-comparison` says the planner compares values with
  chosen targets, but its tagged test creates only the default minimum floor
  and asserts only a passing **“on plan”** result. `sample-floor-status` also
  checks only two passing floors. The untagged precision regression for one
  imported maximum does not satisfy the one-claim/one-tagged-test contract.
- **Why this matters:** a visitor is told that maximum limits and visible gaps
  are supported. The designated claim test would remain green if the normal
  UI stopped calculating limits or stopped showing short/over states.
- **Concrete fix:** expand the declared `target-comparison` claim and its one
  tagged test to create a floor and a limit through the UI, then verify short,
  on-plan, within-limit, and over-limit results. List all quoted locations in
  `where`. If that evidence is not added, rewrite the landing copy to **“Choose
  a nutrient floor in grams.”** and **“See weekly totals before you cook,”**
  and remove **“or limits”** from the README.

### F-5-2 — MAJOR — “Complete plan” JSON transfer is stronger than its test

- **Exact locations / quotes:** README **“You can export or import the complete
  plan as JSON.”** and **“You can export or import your complete plan.”**
- **Evidence:** `json-transfer` declares only **“Export or import your plan.”**
  Its tagged test checks seven exported foods, three exported meals, and the
  **“Plan imported.”** notice. It does not assert the three targets, nutrient
  values, sources, meal days, or portions after re-import. An export that
  silently empties targets or changes valid values can still pass.
- **Why this matters:** “complete” promises a lossless backup. A success notice
  does not prove that all user data survived the round trip.
- **Concrete fix:** change the claim to **“Exports and reimports the complete
  plan as JSON.”** Deep-compare the exported and re-imported foods, targets,
  meals, portions, sources, values, and days. Alternatively rewrite both
  sentences as **“Export or import a plan as JSON.”**

### F-5-3 — MAJOR — Device persistence is tested for foods only

- **Exact locations / quotes:** README **“Foods, targets, and meals stay in
  browser storage on your device.”** and **“Your plan stays on this device.”**;
  Privacy **“Nutrient Floor stores foods, targets, and meals in your browser.”**
- **Evidence:** the designated `local-persistence` test saves one food and
  checks that food after reload. It never saves or reloads a target or meal.
  Other untagged recovery tests exercise more state, but the claim contract
  requires the tagged test to assert the published outcome.
- **Why this matters:** losing targets or meal placements while retaining the
  pantry would still satisfy the current claim test and break the real job.
- **Concrete fix:** in `@claim:local-persistence`, save one food, one target,
  and one placed meal, reload, and assert their values and relationships. If
  the test remains food-only, rewrite the README sentence as **“Saved foods
  stay in browser storage on your device.”** and narrow the claim.

### F-5-4 — MAJOR — Saved foods and targets cannot be corrected without deletion

- **Location:** live `/demo` and `/plan`; each food and target exposes only a
  Delete button. Meal names, by contrast, are edit buttons. `src/main.ts`
  contains edit handling for meals but none for foods or targets.
- **Evidence:** the first food and first target each had one button, the
  accessible Delete control, and no edit link or button. Deleting a food also
  removes its portions from affected meals.
- **Why this matters:** a normal user who mistypes a label value, serving, or
  weekly target must delete and recreate it. Correcting a food can also force
  reconstruction of meal portions, creating avoidable data loss and work.
- **Concrete fix:** add **Edit food** and **Edit target** actions with prefilled
  forms. Preserve record IDs so meal portions survive food edits, recalculate
  totals after saving, return focus to the opener, and add keyboard and
  persistence tests.

## Copy audit

Counts split visible words on whitespace. Repeated navigation/footer labels
are listed once. Code-block commands are commands, not sentences. No sentence
exceeds 22 words, no banned marketing adjective appears, terminology is
consistent, and the primary landing action names its result. The flagged rows
are claim-scope problems rather than length or tone problems.

### Landing page

| Visible text | Words | Result |
| --- | ---: | --- |
| Skip to planner | 3 | pass |
| Nutrient Floor | 2 | pass |
| Demo / Planner / Privacy / Terms | 1 / 1 / 1 / 1 | pass; direct navigation labels |
| Private meal planner | 3 | pass; names the product |
| Plan meals that meet your nutrient targets. | 7 | pass |
| For home cooks who want enough fibre or protein without logging every calorie. | 13 | pass; `no-calorie-input` |
| Try it with sample data | 5 | pass; result-naming action |
| Loads seven foods, three meals, and three targets. | 8 | pass; `demo-week-coverage` |
| Free to use | 3 | pass; `free-to-use` |
| Stored on this device | 4 | pass, subject to F-5-3 scope |
| Works offline after setup | 4 | pass; `offline-use` |
| Ingredients arranged across a blue kitchen planning sheet. | 8 | pass; image alternative |
| Sample weekly nutrient totals | 4 | pass; direct heading |
| Save familiar foods, choose targets, and place meal portions on a week. | 12 | pass; tested workflow |
| Fibre | 1 | pass; data label |
| 40 g | 2 | pass; `sample-totals` |
| above the 30 g floor | 5 | pass; `sample-floor-status` |
| Protein | 1 | pass; data label |
| 75.5 g | 2 | pass; `sample-totals` |
| above the 75 g floor | 5 | pass; `sample-floor-status` |
| Plan a week in three steps | 6 | pass; direct heading |
| 01 / Set a target | 5 | pass; direct step label |
| Choose a floor or limit in grams. | 7 | **F-5-1** |
| 02 / Save your foods | 5 | pass; direct step label |
| Enter values and a source from the label. | 8 | pass; `food-source` |
| 03 / Place meals | 4 | pass; direct step label |
| See gaps before you cook. | 5 | **F-5-1** |
| How your food values are used | 6 | pass; direct heading |
| The planner compares your food values with your targets. | 9 | pass, subject to F-5-1 scope |
| Check labels before relying on the totals. | 7 | pass; useful caution |
| Private meal planning around your nutrient targets. | 7 | pass; footer description |
| Built by Param Factory / v1.5 | 4 / 1 | pass; credit and version labels |

### README

| Text | Words | Result |
| --- | ---: | --- |
| Nutrient Floor | 2 | pass; title |
| Plan meals that meet your nutrient targets. | 7 | pass |
| For home cooks who want more fibre or protein, or less sugar, without a calorie diary. | 16 | pass, subject to F-5-1 scope |
| Save your foods, choose weekly floors or limits, and place meals on a week. | 14 | **F-5-1** |
| Try the sample plan at `/?demo=1` or `/demo`. | 8 | pass |
| It opens with seven foods, three meals, and three targets. | 10 | pass; `demo-week-coverage` |
| Sample changes stay only in the open demo. | 8 | pass; `demo-isolation` |
| Reloading or leaving restores the bundled sample. | 7 | pass; `demo-isolation` |
| It never touches your real plan. | 6 | pass; `demo-reset` |
| Run locally | 2 | pass; direct heading |
| Open `http://localhost:5173`. | 2 | pass; instruction |
| Use Start for real, or open `/plan`, to create your plan. | 11 | pass; instruction |
| Run checks | 2 | pass; direct heading |
| The production build contains `dist/index.html`. | 5 | pass; `build-output` |
| Deploy it as a static single-page application. | 7 | pass; developer instruction |
| Keep the included `staticwebapp.config.json`. | 4 | pass; developer instruction |
| Data and privacy | 3 | pass; direct heading |
| Foods, targets, and meals stay in browser storage on your device. | 11 | **F-5-3** |
| The planner uses no analytics and sends no meal data elsewhere. | 11 | pass; `local-only` |
| You can export or import the complete plan as JSON. | 10 | **F-5-2** |
| Nutrient Floor is free to use. | 6 | pass; `free-to-use` |
| The planner and demo work offline after setup. | 8 | pass; `offline-use` |
| You can also print the weekly plan. | 7 | pass; `print-week` |
| Read `/privacy` and `/terms` for details. | 6 | pass; instruction |
| How totals work | 3 | pass; direct heading |
| You enter each food value and its source. | 8 | pass; `food-source` |
| The planner compares those values with the targets you choose. | 10 | pass, subject to F-5-1 scope |
| It does not supply recommended target values. | 7 | pass; `user-chosen-targets` |
| Check labels before relying on a total. | 7 | pass; useful caution |
| Claims covered by browser tests | 5 | pass; direct heading |
| The sample opens with seven foods, three placed meals, and three targets. | 12 | pass; `demo-week-coverage` |
| The sample week totals 40 g fibre and 75.5 g protein. | 11 | pass; `sample-totals` |
| The sample shows 40 g fibre above a 30 g floor and 75.5 g protein above a 75 g floor. | 20 | pass; `sample-floor-status` |
| Nutrient Floor is free to use with no payment gate. | 10 | pass; `free-to-use` |
| The planner uses no analytics and sends no meal data elsewhere. | 11 | pass; `local-only` |
| The planner and demo work offline after setup. | 8 | pass; `offline-use` |
| You can export or import your complete plan. | 8 | **F-5-2** |
| Your plan stays on this device. | 6 | **F-5-3** |
| Demo changes stay in the open tab and reset when you leave. | 12 | pass; `demo-isolation` |
| The planner saves up to five targets. | 7 | pass; `target-cap` |
| The planner prints a weekly plan. | 6 | pass; `print-week` |
| Food values are entered by you and saved with a source. | 11 | pass; `food-source` |
| The planner compares entered food values with targets you choose. | 10 | pass, subject to F-5-1 scope |
| The planner does not supply recommended target values. | 8 | pass; `user-chosen-targets` |
| You can plan meals without entering calories. | 7 | pass; `no-calorie-input` |
| The production build contains `dist/index.html`. | 5 | pass; `build-output` |
| Every claim and its exact Playwright command is in `.factory/claims.json`. | 10 | inventory is one-to-one, but F-5-1 through F-5-3 show scope gaps |

Terminology remains consistent: **food**, **meal**, **portion**, **floor**,
**limit**, **target**, **plan**, and **demo** retain one meaning each.

## Demo, sandbox, privacy, and offline behavior

The demo passes the one-click and isolation requirements.

- From the 390 px first screen, one click opened `/?demo=1` with the required
  banner, seven named foods, three realistic meals, three targets, and
  calculated totals already visible in the product UI.
- Adding a demo food changed 7 to 8. **Reset demo** restored 7 and removed the
  marker.
- A real food stored under `real:plan` remained present while demo entry,
  editing, and reset left the IndexedDB key list at only `real:plan`.
- Hard navigation and tab closure each discarded a different demo marker.
- After waiting for asynchronous navigation, **Start for real** opened
  `/plan`, removed the banner, and restored the one real food.
- The live flow recorded 13 same-origin shell requests, zero cross-origin
  requests, zero fetch/XHR/EventSource/WebSocket/ping requests, and zero
  console errors.
- After service-worker setup, both `/demo` and `/plan` returned 200 while
  offline, rendered the planner, and opened the Add meal dialog.

## Declared claims and clean-clone checks

Every exact command in `.factory/claims.json` was run separately after
`npm ci` in the clean clone. All declared commands passed:

| Claim ID | Result |
| --- | --- |
| `demo-week-coverage` | pass |
| `sample-totals` | pass |
| `sample-floor-status` | pass |
| `free-to-use` | pass |
| `local-only` | pass |
| `offline-use` | pass |
| `json-transfer` | pass, with the coverage gap in F-5-2 |
| `local-persistence` | pass, with the coverage gap in F-5-3 |
| `demo-isolation` | pass |
| `demo-reset` | pass |
| `target-cap` | pass |
| `print-week` | pass |
| `food-source` | pass |
| `target-comparison` | pass, with the coverage gap in F-5-1 |
| `user-chosen-targets` | pass |
| `no-calorie-input` | pass |
| `build-output` | pass |

The same clone passed `npm test` (11 unit tests plus copy and claim inventory
guards), `npm run lint`, `npm run build`, and the full Playwright suite
(41/41). The build produced `dist/index.html`; application JavaScript is
26.53 kB raw / 9.17 kB gzip and CSS is 13.08 kB raw / 3.74 kB gzip.

## Structure, routing, accessibility, and identity

- `/`, `/demo`, `/plan`, `/privacy`, and `/terms` returned 200. Each had one
  h1, one main, `lang="en"`, a route-specific title and description, canonical
  URL, Open Graph/Twitter image, favicon, skip link, and shared header/footer.
- The home title is **“Nutrient Floor — Plan meals around nutrient targets”**
  (51 characters). Route titles follow the prescribed Demo/Planner/Privacy/
  Terms pattern.
- The designed unknown route returned HTTP 404 with **“Page not found,”** the
  shared shell, legal links, metadata, favicon, and both recovery actions.
- Every HTTP navigation link across all routes returned 200. The explicit
  email is `mailto:`. Each in-page skip link targets an existing `main#main`;
  the 404 skip link correctly stays within the already loaded 404 document.
  Robots, sitemap, manifest, favicon, OG image, and apple-touch icon returned
  200 with correct MIME types.
- SPA navigation and Back moved focus to the new h1 and updated the polite
  announcement after the render frame.
- Live Axe scans found no serious or critical issue on home, demo, planner,
  Privacy, Terms, or 404. Reduced-motion mode was used for the 390 px scan.
- Response headers include a self-only CSP with `frame-ancestors` as a header,
  HSTS, `nosniff`, and strict-origin referrer policy. No CSP error appeared.
- The blueprint-paper palette, drafting grid, square controls, Georgia and
  monospace pairing, clipped NF mark, and original ingredient blueprint are
  product-specific and do not resemble a generic SaaS template.

## Earlier finding verification

Every earlier review, polish report, and current handoff was read. Each prior
finding was rechecked on the live site and in current code.

| Earlier finding | Current confirmation | Result |
| --- | --- | --- |
| F-1-1 — dead $12 checkout | No price, checkout, license, upgrade, billing link, or payment gate exists; `free-to-use` passed. | fixed |
| F-1-2 — forged-token entitlement | Entitlement code is absent; the forged-token test saves 12 foods without changing UI or capacity. | fixed |
| F-1-3 — incomplete 404 | Live HTTP 404 has direct wording, metadata, favicon, shell, legal links, and recovery actions. | fixed |
| F-1-4 — incomplete claims / persistent demo | The prior demo, reset, no-calorie, and offline scopes pass live and in tagged tests. F-5-1 through F-5-3 are new narrower scope gaps. | fixed for the earlier recorded scope |
| F-1-5 — indirect landing headings | The quoted metaphor and paid-section headings are absent; current headings name their sections. | fixed |
| F-1-6 — long or technical README copy | No README sentence exceeds 22 words; prior storage and commercial jargon is absent. | fixed |
| F-2-1 — stale copy audit | `.factory/copy-audit.md` matches the current landing and its guard passed. | fixed |
| F-2-2 — indirect labels / inaccurate README heading | The redundant label is absent; the values and claims headings remain direct. | fixed |
| F-2-3 — nonfunctional dragging | No draggable meal card exists; meal names provide the supported edit path. | fixed |
| F-2-4 — 12 px mobile annotations | The mobile override keeps essential annotations at 14 px; mobile/zoom tests passed. | fixed |
| F-3-1 — missing build claim | `build-output` is declared and passed against the complete app shell. | fixed |
| F-3-2 — decorative hero caption | No visible caption remains; the useful image alternative remains. | fixed |
| F-4-1 — untested sample floor status | `sample-floor-status` declares and proves both displayed floor values, totals, pass states, and meter names. | fixed |

## Missed leverage

F-5-4 is the clear missing capability: correcting a saved food or target should
not require deletion and reconstruction. No additional AI step is justified.
The calculations are deterministic and local; sending meal data to a model
would weaken the privacy model. JSON transfer and printing cover basic
handoff, and no provider key or decorative AI call is present. The repository
still has no `.factory/brief.json`, so no brief-specific sync requirement can
be verified.

## What would make this perfect

Make the three tagged claim tests match the full visitor-facing promises:
prove floors, limits, and gap states; prove a lossless complete JSON round
trip; and prove that foods, targets, and meals all persist together. Add safe
editing for saved foods and targets without breaking meal references. Then
rerun every exact claim command, the full browser suite, and the live first
read. Nothing else remained in this review.

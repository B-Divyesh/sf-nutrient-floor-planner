# Adversarial first-read review 2 — FAIL

Reviewed 2026-08-29 UTC against
<https://nutrient-floor-planner.sociobot.in> at candidate
`57a52c2b951f546ec22553542e8d25830c0d3e54`. This review changed no product
code.

## Verdict

**FAIL.** A live demo-isolation promise is false for ordinary exit paths, the
claim inventory still does not cover every visitor-facing promise, and an
earlier documented copy-audit gap remains. Three additional copy, interaction,
and mobile-readability findings remain. PASS requires zero findings.

## Findings

### F-1-4 — BLOCKING — The earlier incomplete-claims finding is only partly fixed

- **Earlier finding:** Review 1 found incomplete visitor-facing claim coverage.
  Polish 1 marked F-1-4 fixed. The present live behavior and inventory show it
  is not fully fixed, so this review reuses the earlier ID as required.
- **Exact claims:** Demo banner: **“Demo — sample data, nothing is saved.”**
  README: **“Leaving the demo deletes its changes.”** and **“Demo changes stay
  separate and are deleted when you leave.”** Privacy: **“Leaving the demo
  deletes those changes.”** `.factory/claims.json`: **“Demo changes use
  separate browser storage and are deleted when you leave.”**
- **Live evidence:** In a fresh browser context, I added **“Persists
  hard-navigation”** as the eighth demo food, opened `/` with a hard
  `page.goto`, then reopened `/demo`. The food and all eight rows remained. In
  another fresh context, **“Persists close-tab”** also remained after closing
  the demo tab, opening a new tab in the same context, and reopening `/demo`.
  `src/store.ts` writes `demo:plan` to persistent IndexedDB. `src/main.ts`
  clears it only through handled in-app navigation, popstate, Reset, or Start
  for real. The passing `@claim:demo-isolation` test checks only visible
  in-app links.
- **Additional uncovered claims:** Landing and README promise meal planning
  **“without logging every calorie”** / **“without a calorie diary,”** but no
  claims entry or tagged test asserts that calorie entry is unnecessary.
  README says **“The planner and demo work offline after setup,”** while
  `@claim:offline-use` exercises only `/demo`. A separate live probe confirmed
  `/plan` does work offline, but the published test does not prove that part of
  the claim.
- **Why this misleads:** A visitor is explicitly told demo edits are not saved
  and are deleted on exit, yet normal tab and address-bar exits retain them.
  The claim list also says every claim has an exact test when two claim scopes
  are absent or only partly exercised.
- **Concrete fix:** Keep demo state in memory so reload, hard navigation, and
  tab closure restore the bundled sample, or implement a reliable
  non-persistent sandbox. Extend `@claim:demo-isolation` to test a hard
  navigation and tab close/reopen. Add a tagged no-calorie-input claim test.
  Extend `@claim:offline-use` to reload and edit both `/demo` and `/plan`
  offline. Update every `where` field to name all live and README locations.

### F-2-1 — BLOCKING — The earlier handoff's stale copy audit remains stale

- **Earlier location / quote:** `.factory/handoff.md` recorded **“Refresh the
  stale sample-action sentence in `.factory/copy-audit.md`.”**
- **Current mismatch:** The live landing page and `src/main.ts` say **“Loads
  seven foods, three meals, and three targets.”** (8 words).
  `.factory/copy-audit.md` still records **“Loads a seven-food plan.”** (4
  words).
- **Why this matters:** The required proof-of-simplicity artifact does not
  audit the copy visitors actually see. It can falsely certify later copy
  changes and was already disclosed as unfinished in the prior handoff.
- **Concrete fix:** Regenerate `.factory/copy-audit.md` from current visible
  copy and add a test or script that fails when audited strings drift from the
  landing page.

### F-2-2 — MINOR — Two landing labels and one README heading are indirect or inaccurate

- **Exact copy:** **“SEE A SAMPLE WEEK MEET NUTRIENT TARGETS”** is awkward and
  duplicates the useful heading immediately below it. **“Use only the values
  you choose”** does not identify which values or name the section in
  isolation. README's **“Claims verified in the demo”** is inaccurate because
  several listed tests run at `/plan`, not in demo mode.
- **Why this slows first read:** The first two strings make a visitor decode
  the section instead of naming it. The README heading overstates where the
  evidence runs.
- **Concrete rewrite:** Delete the redundant eyebrow; keep **“Sample weekly
  nutrient totals.”** Replace the other heading with **“How your food values
  are used.”** Replace the README heading with **“Claims covered by browser
  tests.”**

### F-2-3 — MINOR — Meal cards advertise browser dragging but cannot be dropped

- **Location:** `src/main.ts` renders every meal card with
  `draggable="true"`. There are no drag, drop, or keyboard-reorder handlers in
  the source.
- **Why this misleads:** A desktop visitor can start a native drag and see a
  drag ghost, but dropping the meal on another day changes nothing.
- **Concrete fix:** Remove `draggable="true"`, or implement day reassignment
  with explicit drop targets, saved state, an announced result, and an
  equivalent keyboard action.

### F-2-4 — MINOR — Important demo annotations remain 12 px on phones

- **Earlier location:** The prior handoff called out 12–13.12 px secondary
  meal and food annotations as a follow-up.
- **Current evidence:** At the 390 px breakpoint, `.target small`, `.food
  small`, `.day-label`, `.meal-total`, `.meal p`, `.food span`, and
  `.add-meal` are still `0.75rem`, which computes to 12 px at the default root
  size. These strings include sources, serving sizes, portions, and meal
  totals.
- **Why this matters:** These are not decorative notes; they are the evidence
  a phone user checks before relying on a total.
- **Concrete fix:** Use at least `0.875rem` (14 px) for these annotations and
  retain the existing horizontal day scrolling. Recheck 390 px, 320 px, and
  200% zoom.

## Cold first screen

Fresh Chromium contexts at 390 × 844 and 1440 × 900 were opened at `/` with
no prior storage. Before scrolling:

| Question | Answer from the first screen | Result |
| --- | --- | --- |
| What does it do? | Plans meals against nutrient targets. | Clear from **“Plan meals that meet your nutrient targets.”** |
| For whom? | Home cooks who want enough fibre or protein without calorie logging. | Clear from the 13-word sentence directly below the headline. |
| What should I click first? | **“Try it with sample data.”** | Clear; the adjacent line says it loads seven foods, three meals, and three targets. |

The action and all three facts were above the fold at both sizes. The mobile
first screen showed the product-specific blueprint illustration beginning
below them. There is no first-screen blocker.

## Copy audit

Counts split visible words on whitespace. Repeated Privacy navigation/footer
labels are consolidated. Code blocks in README are commands, not sentences.
No string exceeds 22 words and no banned marketing word appears.

### Landing page

| Visible copy | Words | Result |
| --- | ---: | --- |
| Skip to planner | 3 | pass |
| Nutrient Floor | 2 | pass |
| Demo / Planner / Privacy | 1 / 1 / 1 | pass; navigation nouns |
| Private meal planner | 3 | pass; privacy is covered by local-storage and request tests |
| Plan meals that meet your nutrient targets. | 7 | pass |
| For home cooks who want enough fibre or protein without logging every calorie. | 13 | F-1-4; unlisted no-calorie-input claim |
| Try it with sample data | 5 | pass; result-naming action |
| Loads seven foods, three meals, and three targets. | 8 | pass live; F-2-1 in stale audit |
| Stored on this device | 4 | pass; listed claim |
| Works offline after setup | 4 | pass; listed claim |
| Export or import your plan | 5 | pass; listed claim and result-naming verbs |
| Ingredients arranged across a blue kitchen planning sheet. | 8 | pass; image alt text describes its purpose |
| Foods arranged on a kitchen planning illustration. | 7 | pass |
| See a sample week meet nutrient targets | 7 | F-2-2; awkward, redundant label |
| Sample weekly nutrient totals | 4 | pass |
| Save familiar foods, choose targets, and place meal portions on a week. | 12 | pass; covered workflow |
| Fibre / 40 g / above the 30 g floor | 1 / 2 / 5 | pass; sample-total claim |
| Protein / 75.5 g / above the 75 g floor | 1 / 2 / 5 | pass; sample-total claim |
| Plan a week in three steps | 6 | pass |
| 01 / Set a target | 5 | pass |
| Choose a floor or limit in grams. | 7 | pass |
| 02 / Save your foods | 5 | pass |
| Enter values and a source from the label. | 8 | pass; food-source claim |
| 03 / Place meals | 4 | pass |
| See gaps before you cook. | 5 | pass; target-comparison test observes status |
| Use only the values you choose | 6 | F-2-2; unclear out-of-context heading |
| The planner compares your food values with your targets. | 9 | pass; listed claim |
| Check labels before relying on the totals. | 7 | pass; useful caution |
| Private meal planning around your nutrient targets. | 7 | pass |
| Terms / Built by Param Factory / v1.2 | 1 / 4 / 1 | pass; footer labels |

### README

| Visible copy | Words | Result |
| --- | ---: | --- |
| Nutrient Floor | 2 | pass |
| Plan meals that meet your nutrient targets. | 7 | pass |
| For home cooks who want more fibre or protein, or less sugar, without a calorie diary. | 16 | F-1-4; unlisted no-calorie-input claim |
| Save your foods, choose weekly floors or limits, and place meals on a week. | 14 | pass |
| Try the sample plan at /?demo=1 or /demo. | 8 | pass |
| It opens with seven foods, three meals, and three targets. | 10 | pass; listed claim |
| Demo changes use separate browser storage. | 6 | pass alone; the isolation statement is tested |
| They never touch your real plan. | 6 | pass; reset/isolation tests preserve real data |
| Leaving the demo deletes its changes. | 6 | F-1-4; false for hard navigation and tab closure |
| Run locally | 2 | pass heading |
| Open http://localhost:5173. | 2 | pass instruction |
| Use Start for real, or open /plan, to create your plan. | 11 | pass |
| Run checks | 2 | pass heading |
| The build output is dist/, with index.html at its root. | 10 | pass; confirmed by build |
| Deploy it as a static single-page application. | 7 | pass in developer instructions |
| Keep the included staticwebapp.config.json. | 4 | pass in developer instructions |
| Data and privacy | 3 | pass heading |
| Foods, targets, and meals stay in browser storage on your device. | 11 | pass; listed claim |
| The planner uses no analytics and sends no meal data elsewhere. | 11 | pass; listed request-log claim |
| You can export or import the complete plan as JSON. | 10 | pass; listed claim |
| The planner and demo work offline after setup. | 8 | F-1-4; the declared test covers only demo |
| You can also print the weekly plan. | 7 | pass; listed claim |
| Read /privacy and /terms for details. | 6 | pass |
| How totals work | 3 | pass heading |
| You enter each food value and its source. | 8 | pass; listed claim |
| The planner compares those values with the targets you choose. | 10 | pass; listed claim |
| It does not supply recommended target values. | 7 | pass; listed claim |
| Check labels before relying on a total. | 7 | pass; useful caution |
| Claims verified in the demo | 5 | F-2-2; several tests use `/plan` |
| The sample opens with seven foods, three placed meals, and three targets. | 12 | pass; listed claim |
| The sample week totals 40 g fibre and 75.5 g protein. | 11 | pass; listed claim |
| The planner uses no analytics and sends no meal data elsewhere. | 11 | pass; listed claim |
| The planner works offline after setup. | 6 | pass for the demo-tested scope |
| You can export or import your complete plan. | 8 | pass; listed claim |
| Your plan stays on this device. | 6 | pass; listed claim |
| Demo changes stay separate and are deleted when you leave. | 10 | F-1-4; false for ordinary exits |
| The planner saves up to five targets. | 7 | pass; listed claim |
| The planner prints a weekly plan. | 6 | pass; listed claim |
| Food values are entered by you and saved with a source. | 11 | pass; listed claim |
| The planner compares entered food values with targets you choose. | 10 | pass; listed claim |
| The planner does not supply recommended target values. | 8 | pass; listed claim |
| Every claim and its exact Playwright command is in .factory/claims.json. | 10 | F-1-4; no-calorie coverage is absent and two scopes are incomplete |

Terminology is otherwise consistent: food, meal, portion, floor, limit,
target, plan, and demo keep the same meanings. The landing action is a verb
that names the result. README uses necessary developer terms only in run,
test, and deployment instructions.

## Demo, storage, and request behavior

The one-click path itself passes. From a fresh 390 px landing page, one click
opened `/?demo=1`. The first demo screen immediately showed the banner, the
planner heading, three realistic meals, three targets with calculated totals,
and seven named foods. Adding **“Demo only food”** raised the count to eight;
**Reset demo** restored seven and removed it. With **“Real lentils”** saved
before entering demo, **Start for real** returned to one real food, no demo
food, no banner, and only the `real:plan` IndexedDB key.

The same live flow made no cross-origin requests and logged no console or page
errors. After service-worker control, both `/demo` and `/plan` reloaded with
HTTP 200 offline and opened an add dialog. The remaining sandbox blocker is
F-1-4: demo edits persist in `demo:plan` across ordinary exits.

## Claims and clean-clone gates

A detached clean clone at `/tmp/nutrient-review2-clean.OWB4d1` ran every exact
command in `.factory/claims.json` separately. All 13 commands passed:

| Claim IDs | Result |
| --- | --- |
| demo-week-coverage, sample-totals, local-only, offline-use | pass |
| json-transfer, local-persistence, demo-isolation, demo-reset | pass |
| target-cap, print-week, food-source, target-comparison | pass |
| user-chosen-targets | pass |

The passing demo-isolation test is insufficient for the broader published
claim; the manual live failure in F-1-4 controls the verdict.

The same clean clone also passed `npm test` (7/7), `npm run lint`, `npm run
build`, and `npx playwright test` (29/29). The build produced `dist/`; JS is
8.74 kB gzip and CSS is 3.61 kB gzip.

## Structure, accessibility, links, and visual identity

- Home, demo, planner, privacy, and terms returned 200. The designed unknown
  route returned 404 with **“Page not found,”** the full header/footer,
  recovery actions, metadata, favicon, Privacy, and Terms.
- Every route has one h1, a main landmark, route-specific title and
  description, canonical URL, Open Graph/Twitter metadata, favicon, and shared
  shell. Home follows the **“Product — what it does”** title pattern.
- SPA Privacy navigation and browser Back moved focus to the new h1 and
  updated the polite announcement. Direct deep links loaded the correct
  route.
- All crawled internal routes, demo query, metadata assets, manifest,
  `robots.txt`, and `sitemap.xml` returned 200. The only non-HTTP link is the
  explicit product email address.
- Factory `verify-url.sh` passed home and demo with no console errors, one h1,
  `lang="en"`, main, and complete image alt text. Live Axe checks found zero
  serious or critical issues on home, light/dark demo, Privacy, Terms, and
  404. Reduced motion, touch-target, zoom, and keyboard regressions also pass
  the local suite.
- The blueprint drafting-sheet palette, ruled measurement board, square
  shapes, Georgia/monospace pairing, food illustration, and clipped NF mark
  match `.factory/design.md`. This is distinguishable from a generic centered
  SaaS hero or three-card template.

Structure therefore passes except for the interaction/readability findings
F-2-3 and F-2-4.

## History check

| Earlier item | Live and code confirmation | Result |
| --- | --- | --- |
| F-1-1 dead $12 checkout | No paid copy, checkout/API link, or gating remains. Commercial terms occur only in repository instructions; the forged-token regression passes. | fixed |
| F-1-2 forged token unlocked capacity | License code is absent; a legacy token changes nothing; eleven-food regression passes. | fixed |
| F-1-3 incomplete 404 | Live 404 has direct wording, full shell, metadata, legal links, and both recovery actions. | fixed |
| F-1-4 incomplete claims | Thirteen declared commands pass, but demo exit behavior disproves a listed claim and further scopes are absent. | **not fixed; BLOCKING** |
| F-1-5 indirect landing headings | The exact earlier labels were replaced. A different remaining heading defect is F-2-2. | fixed for earlier locations |
| F-1-6 long/technical README copy | No sentence exceeds 22 words; prior IndexedDB and commercial jargon is gone. | fixed |
| Polish 1 mapping | Each claimed change above was checked rather than accepted from the map. | one regression/partial fix: F-1-4 |
| Verification 7 stale copy-audit follow-up | The old sentence remains in `.factory/copy-audit.md`. | **not fixed; F-2-1** |
| Verification 7 12 px follow-up | Important annotations remain 12 px at mobile width. | **not fixed; F-2-4** |

## Missed leverage

No AI feature is justified. The core calculation is deterministic, local, and
user-controlled; sending meal data to a model would not improve the required
job. No provider or Azure key is embedded. The obvious transfer and handoff
features already exist: complete JSON import/export and a printable week.
There is no account system or cross-device model in the available product
scope, so sync is not an implied omission. The unfinished drag affordance is
captured as F-2-3 rather than treated as a new feature request.

## What would make this perfect

Make demo state genuinely non-persistent across every exit and prove hard
navigation plus tab closure. Complete claim coverage for calorie-free entry
and both offline routes. Regenerate the copy audit, use direct section labels,
remove or finish dragging, and raise important mobile annotations to 14 px.
Then rerun the entire live and clean-clone review. Nothing less reaches the
owner's zero-finding standard.

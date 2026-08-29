# Adversarial first-read review 3 — FAIL

Reviewed 2026-08-29 UTC against
<https://nutrient-floor-planner.sociobot.in> and candidate
`ae1a65946e30131da45e4ec1cfb38e592b34361a`. No product code was changed.

## Verdict

**FAIL.** Product behavior, the one-click demo, all 15 declared claims, prior
repairs, routing, accessibility, and privacy checks pass. Two findings remain:
one unlisted README claim and one visible sentence that carries no useful
product information. PASS requires zero findings.

## Findings

### F-3-1 — MAJOR — A README build claim is absent from `claims.json`

- **Exact location / quote:** README, Run checks: **“The build output is
  `dist/`, with `index.html` at its root.”** README also says **“Every claim
  and its exact Playwright command is in `.factory/claims.json`.”**
- **Evidence:** `.factory/claims.json` has 15 entries and no build-output
  entry. The build statement is true in this review—`npm run build` produced
  `dist/index.html`—but that command is a general quality gate, not a declared
  one-to-one claim test.
- **Why this matters:** A developer can rely on the stated deployment
  artifact, while the claim inventory says every relied-on statement has an
  exact listed test. The inventory is therefore incomplete and its closing
  sentence is inaccurate.
- **Concrete fix:** Add a `build-output` claim whose tagged test builds in a
  clean temporary checkout and asserts `dist/index.html`, or remove the
  declarative output claim and the assertion that every claim is inventoried.

### F-3-2 — MINOR — The hero caption does not give the visitor usable information

- **Exact location / quote:** Landing hero figure caption: **“Foods arranged
  on a kitchen planning illustration.”**
- **Why this matters:** The sentence only narrates visible decorative art. It
  does not explain the planner, an action, a cost, a privacy fact, or proven
  behavior. The image already has the accessibility text **“Ingredients
  arranged across a blue kitchen planning sheet.”**
- **Concrete fix:** Remove the visible caption and keep the image alt text.

## Cold first screen

Fresh Chromium contexts at 390 × 844 and 1440 × 900 were opened at `/` with
no prior storage. Before scrolling, both viewports gave the same answers:

| Question | First-read answer | Result |
| --- | --- | --- |
| What does it do? | Plans meals against nutrient targets. | Clear from **“Plan meals that meet your nutrient targets.”** |
| For whom? | Home cooks who want enough fibre or protein without calorie logging. | Clear from the 13-word sentence below the headline. |
| What should I click first? | **“Try it with sample data.”** | Clear; the adjacent sentence says it loads seven foods, three meals, and three targets. |

The primary action and all three facts—**Free to use**, **Stored on this
device**, and **Works offline after setup**—were above the fold at both sizes.
The page had no horizontal overflow.

## Copy audit

Counts split visible words on whitespace. All landing strings and README prose
are included; code-block commands are commands rather than sentences. No
sentence exceeds 22 words. No banned marketing word, inconsistent product
term, unclear heading, or non-result-naming landing action was found beyond
F-3-1 and F-3-2.

### Landing page

| Visible text | Words | Result |
| --- | ---: | --- |
| Skip to planner | 3 | pass; direct accessibility action |
| Nutrient Floor | 2 | pass; product name |
| Demo / Planner / Privacy | 1 / 1 / 1 | pass; navigation names |
| Private meal planner | 3 | pass; names the product and privacy property |
| Plan meals that meet your nutrient targets. | 7 | pass; job-first h1 |
| For home cooks who want enough fibre or protein without logging every calorie. | 13 | pass; audience and change |
| Try it with sample data | 5 | pass; result-naming action |
| Loads seven foods, three meals, and three targets. | 8 | pass; listed claim |
| Free to use | 3 | pass; listed claim |
| Stored on this device | 4 | pass; listed claim |
| Works offline after setup | 4 | pass; listed claim |
| Ingredients arranged across a blue kitchen planning sheet. | 8 | pass; image alt text |
| Foods arranged on a kitchen planning illustration. | 7 | **F-3-2** |
| Sample weekly nutrient totals | 4 | pass; direct heading |
| Save familiar foods, choose targets, and place meal portions on a week. | 12 | pass |
| Fibre | 1 | pass |
| 40 g | 2 | pass; listed sample-total claim |
| above the 30 g floor | 5 | pass |
| Protein | 1 | pass |
| 75.5 g | 2 | pass; listed sample-total claim |
| above the 75 g floor | 5 | pass |
| Plan a week in three steps | 6 | pass; direct heading |
| 01 / Set a target | 5 | pass |
| Choose a floor or limit in grams. | 7 | pass |
| 02 / Save your foods | 5 | pass |
| Enter values and a source from the label. | 8 | pass; listed claim |
| 03 / Place meals | 4 | pass |
| See gaps before you cook. | 5 | pass; target-comparison result |
| How your food values are used | 6 | pass; direct heading |
| The planner compares your food values with your targets. | 9 | pass; listed claim |
| Check labels before relying on the totals. | 7 | pass; useful caution |
| Private meal planning around your nutrient targets. | 7 | pass; footer one-line description |
| Privacy / Terms / Built by Param Factory / v1.3 | 1 / 1 / 4 / 1 | pass; footer labels |

### README

| Text | Words | Result |
| --- | ---: | --- |
| Nutrient Floor | 2 | pass; document title |
| Plan meals that meet your nutrient targets. | 7 | pass |
| For home cooks who want more fibre or protein, or less sugar, without a calorie diary. | 16 | pass |
| Save your foods, choose weekly floors or limits, and place meals on a week. | 14 | pass |
| Try the sample plan at `/?demo=1` or `/demo`. | 8 | pass |
| It opens with seven foods, three meals, and three targets. | 10 | pass; listed claim |
| Sample changes stay only in the open demo. | 8 | pass; listed claim |
| Reloading or leaving restores the bundled sample. | 7 | pass; listed claim |
| It never touches your real plan. | 6 | pass; listed claim |
| Run locally | 2 | pass; direct heading |
| Open `http://localhost:5173`. | 2 | pass; direct instruction |
| Use Start for real, or open `/plan`, to create your plan. | 11 | pass |
| Run checks | 2 | pass; direct heading |
| The build output is `dist/`, with `index.html` at its root. | 10 | **F-3-1** |
| Deploy it as a static single-page application. | 7 | pass; developer instruction |
| Keep the included `staticwebapp.config.json`. | 4 | pass; developer instruction |
| Data and privacy | 3 | pass; direct heading |
| Foods, targets, and meals stay in browser storage on your device. | 11 | pass; listed claim |
| The planner uses no analytics and sends no meal data elsewhere. | 11 | pass; listed claim |
| You can export or import the complete plan as JSON. | 10 | pass; listed claim |
| Nutrient Floor is free to use. | 6 | pass; listed claim |
| The planner and demo work offline after setup. | 8 | pass; listed claim |
| You can also print the weekly plan. | 7 | pass; listed claim |
| Read `/privacy` and `/terms` for details. | 6 | pass; direct instruction |
| How totals work | 3 | pass; direct heading |
| You enter each food value and its source. | 8 | pass; listed claim |
| The planner compares those values with the targets you choose. | 10 | pass; listed claim |
| It does not supply recommended target values. | 7 | pass; listed claim |
| Check labels before relying on a total. | 7 | pass; useful caution |
| Claims covered by browser tests | 5 | pass; direct heading |
| The sample opens with seven foods, three placed meals, and three targets. | 12 | pass; listed claim |
| The sample week totals 40 g fibre and 75.5 g protein. | 11 | pass; listed claim |
| Nutrient Floor is free to use with no payment gate. | 10 | pass; listed claim |
| The planner uses no analytics and sends no meal data elsewhere. | 11 | pass; listed claim |
| The planner and demo work offline after setup. | 8 | pass; listed claim |
| You can export or import your complete plan. | 8 | pass; listed claim |
| Your plan stays on this device. | 6 | pass; listed claim |
| Demo changes stay in the open tab and reset when you leave. | 12 | pass; listed claim |
| The planner saves up to five targets. | 7 | pass; listed claim |
| The planner prints a weekly plan. | 6 | pass; listed claim |
| Food values are entered by you and saved with a source. | 11 | pass; listed claim |
| The planner compares entered food values with targets you choose. | 10 | pass; listed claim |
| The planner does not supply recommended target values. | 8 | pass; listed claim |
| You can plan meals without entering calories. | 7 | pass; listed claim |
| Every claim and its exact Playwright command is in `.factory/claims.json`. | 10 | **F-3-1**; inaccurate while the build-output claim is absent |

Terminology is consistent: **food**, **meal**, **portion**, **floor**,
**limit**, **target**, **plan**, and **demo** retain one meaning each.

## Demo and sandbox behavior

The one-click path passes. In a fresh 390 px context, the landing action opened
`/?demo=1` and immediately showed the persistent **“Demo — sample data,
nothing is saved.”** banner, seven named foods, three realistic meals, three
targets, and calculated totals.

- Adding a demo food changed the count from 7 to 8. **Reset demo** restored 7
  and removed the marker.
- A real food was saved before a second demo entry. **Start for real** restored
  that real food and showed no demo marker.
- A demo marker disappeared after hard navigation and another disappeared
  after tab closure; each reopened demo had 7 foods.
- Fresh demo storage had no localStorage values. Demo changes remained in
  memory; the real plan stayed under the separate `real:plan` IndexedDB key.
- The whole live flow made no cross-origin requests and no fetch, XHR,
  EventSource, WebSocket, or ping requests.
- After service-worker setup, both `/demo` and `/plan` reloaded with HTTP 200
  offline and opened an edit dialog.

No demo blocker was reproduced.

## Claims and clean-clone gates

A detached clean clone at `/tmp/nutrient-review3-clean.4bcgId` ran every exact
command in `.factory/claims.json` separately. Each ID appears in exactly one
tagged Playwright test.

| Claim ID | Result |
| --- | --- |
| `demo-week-coverage` | pass |
| `sample-totals` | pass |
| `free-to-use` | pass |
| `local-only` | pass |
| `offline-use` | pass |
| `json-transfer` | pass |
| `local-persistence` | pass |
| `demo-isolation` | pass |
| `demo-reset` | pass |
| `target-cap` | pass |
| `print-week` | pass |
| `food-source` | pass |
| `target-comparison` | pass |
| `user-chosen-targets` | pass |
| `no-calorie-input` | pass |

The same clone passed `npm test` (11/11 unit tests plus the copy-audit guard),
`npm run lint`, `npm run build`, and `npx playwright test --reporter=line`
(39/39). The build produced `dist/index.html`; application JavaScript is 9.20
kB gzip and CSS is 3.74 kB gzip. No declared claim test failed. F-3-1 concerns
an undeclared README claim.

## Structure, accessibility, links, and visual identity

- `/`, `/demo`, `/plan`, `/privacy`, and `/terms` return 200. An unknown URL
  returns the designed HTTP 404 with **“Page not found,”** full header/footer,
  Privacy/Terms links, metadata, favicon, and two recovery actions.
- Every route has one h1, one main, route-specific title and description,
  canonical URL, Open Graph/Twitter metadata, favicon, and the shared shell.
  The home title is **“Nutrient Floor — Plan meals around nutrient targets.”**
- SPA navigation and browser Back move focus to the new h1 and update the
  polite route announcement. Direct deep links load the expected route.
- Every crawled internal link returned 200; the only non-HTTP link is the
  explicit `mailto:` contact. `robots.txt`, `sitemap.xml`, manifest, OG image,
  favicon, and app icons are present. The OG image is 1200 × 630.
- Response headers include the matching self-only CSP, `nosniff`, and
  strict-origin referrer policy. `frame-ancestors` is delivered as a header.
- Factory `verify-url.sh` passed live home and demo with no console errors.
  Playwright Axe found no serious or critical violations on home at both
  widths, demo with reduced motion, planner, Privacy, Terms, or 404. Mobile
  controls measured at least 44 px, key planner annotations were at least 14
  px, and no unsupported draggable element remained.
- The blueprint drafting-sheet palette, ruled board, square controls,
  Georgia/monospace type pairing, original food illustration, and clipped NF
  mark match `.factory/design.md` and do not resemble a generic SaaS template.

## History check

| Earlier item | Live and code confirmation | Result |
| --- | --- | --- |
| F-1-1 — dead $12 checkout | No price, checkout, purchase, license, or upgrade action exists in live copy or product source. The planner has no payment gate. | fixed |
| F-1-2 — forged token entitlement | Entitlement code is absent. The `free-to-use` regression adds more than eleven foods and checks that legacy token state cannot create a gate. | fixed |
| F-1-3 — incomplete 404 | Live unknown route has direct wording, shared shell, legal links, metadata, favicon, and both recovery actions. | fixed |
| F-1-4 — incomplete claims / persistent demo | Fifteen one-to-one declared tests pass. Live reset, hard navigation, tab closure, real-data isolation, no-calorie entry, and both offline routes pass. | fixed for the earlier scope; new inventory gap is F-3-1 |
| F-1-5 — indirect landing headings | The quoted “sheet,” “question,” “small menu,” and “basic planner” wording is absent. Current headings name their sections. | fixed |
| F-1-6 — long or technical README copy | No README sentence exceeds 22 words; the earlier IndexedDB and commercial wording is absent. | fixed |
| F-2-1 — stale copy audit | `.factory/copy-audit.md` matches current landing strings and `npm test` runs its drift guard. | fixed |
| F-2-2 — indirect labels / inaccurate README heading | The redundant sample eyebrow and vague values heading are absent; README says “Claims covered by browser tests.” | fixed |
| F-2-3 — nonfunctional dragging | Live demo and source contain no `draggable="true"` meal cards. Editing remains the explicit reassignment path. | fixed |
| F-2-4 — 12 px mobile annotations | The checked mobile annotations compute to 14 px; 390 px and 200%-zoom regressions pass. | fixed |
| Polish 1 and Polish 2 maps | Every mapped change above was checked against both live behavior and current source instead of accepting the recorded status. | confirmed, subject only to new F-3-1/F-3-2 |
| Current handoff paid-tier gap | The live product accurately says free, has no paid promise, and exposes no dead billing route. | no regression |

## Missed leverage

No missing AI step is justified. The calculation is deterministic, the user
controls the source values and targets, and sending meal data to a model would
weaken the local-first job. No provider key or AI call is present. Complete
JSON import/export and a printable week already cover the obvious transfer
needs; account-based sync is not implied by the available scope. The repository
still has no `.factory/brief.json`, so the design thesis, product behavior, and
declared claims remain the available scope sources.

## What would make this perfect

Add test-backed inventory coverage for the README build-output statement (or
remove the declarative claim), then remove the decorative hero caption. Rerun
the copy guard, all exact claim commands, the clean build, and the live first
read. Nothing else remained after this review.

# Adversarial first-read review 1 — FAIL

Reviewed 2026-08-29 UTC against <https://nutrient-floor-planner.sociobot.in>.
This review changed no product code.

## Verdict

**FAIL.** Two live paid-feature blockers, one unresolved earlier structural
gap, incomplete claims coverage, and copy defects remain.

## Cold first screen

Fresh Chromium contexts at 390 × 844 and 1440 × 900, before scrolling, gave
the same answers:

| Question | First-read answer | Result |
| --- | --- | --- |
| What does it do? | Plans meals against nutrient targets. | clear |
| For whom? | Home cooks who want enough fibre or protein without calorie logging. | clear |
| What should I click first? | **Try it with sample data**; it says it loads a seven-food plan. | clear and visible |

The exact copy was “Plan meals that meet your nutrient targets.”, “For home
cooks who want enough fibre or protein without logging every calorie.”, and
“Try it with sample data” / “Loads a seven-food plan.” No first-read blocker
was found.

## Findings

### F-1-1 — BLOCKING — The advertised $12 checkout is a dead link

- **Location / quote:** Landing **“Buy the $12 upgrade”**; landing and README:
  **“$12 is a one-time purchase for unlimited saved foods.”**
- **Evidence:** On 2026-08-29,
  https://api.sociobot.in/api/v1/products/nutrient-floor-planner/checkout
  returned HTTP 404 and {"error":"enabled factory product","status":404}.
  The internal links crawl was healthy; this purchase action was the dead link.
- **Why this misleads:** The page asks a visitor to pay for an unavailable
  product. The price and unlimited-food promise cannot be acted on.
- **Concrete fix:** Remove the price, purchase promise, and button until the
  registered Sociobot route works, or register it and add a checkout-contract
  test that asserts a usable response/redirect. The present paid-upgrade claim
  test only checks an href and mocks a *valid* license; it does not test that a
  purchase can begin.

### F-1-2 — BLOCKING — An unverified local token unlocks paid capacity offline

- **Location / quote:** src/main.ts, collectLicense() sets
  licensed = verdict?.valid !== false; customer claim: **“A $12 one-time
  Sociobot purchase adds unlimited saved foods.”**
- **Evidence:** In a fresh live context I preloaded
  localStorage['sb_license:nutrient-floor-planner'] = 'forged-review-token'
  and aborted the verification request. After importing ten foods at /plan,
  **Add food** opened the eleventh-food dialog.
- **Why this misleads:** Payment is presented as what buys unlimited foods,
  while any visitor can receive it with a browser-storage value. A failed or
  offline verification must not grant an entitlement.
- **Concrete fix:** Default licensed to false. Unlock only after a successful
  verification or an unexpired cached **valid** verdict; retain the cap on
  failed/offline verification. Add a license-enforcement claim: a forged or
  no-verdict token must block the eleventh save/import, while a mocked valid
  verdict permits it.

### F-1-3 — BLOCKING — The previously recorded 404 gap remains unfixed

- **Earlier record:** .factory/handoff.md and .factory/verification-6.md record
  this as the remaining low defect, but assign no prior finding identifier. It
  is re-raised as F-1-3 under the history rule.
- **Location / quote:** Live /not-a-real-route returns HTTP 404 headed
  **“This sheet is not in the folder.”** and labelled **“NUTRIENT FLOOR / LOST
  SHEET.”**
- **Evidence:** public/404.html and the live response have a main, but no
  header, navigation, skip link, footer, Privacy/Terms links, canonical,
  description, Open Graph metadata, or favicon.
- **Why this misleads:** The metaphor does not say “page not found,” and a
  person following a bad shared link loses the normal way home and legal links.
- **Concrete fix:** Use the normal header, skip link, footer, metadata, and
  favicon. Replace the heading with **“Page not found”**, the eyebrow with
  **“Nutrient Floor”**, and provide **“Open the sample plan”** and **“Go to the
  planner.”**

### F-1-4 — MAJOR — Visitor-facing claims are not fully declared or tested

- **Location / quotes:** Landing preview **“33.5 g / above 30 g floor”** and
  **“75.5 g / above 75 g floor”**; landing note **“It does not count calories,
  diagnose health conditions, or upload a food diary.”**; landing caption
  **“Original generated illustration; food values are entered by you.”**;
  README **“Checkout is hosted by Sociobot, the merchant of record.”** and
  **“After checkout, the returned license token is stored only in this browser
  and verified with Sociobot when online; nutrition data is never sent with
  it.”**
- **Evidence:** No .factory/claims.json item lists these landing locations or
  tests their outcomes. demo-week-coverage checks counts, not displayed totals.
  food-source names README only. local-only says only that meal data leaves no
  device. F-1-1 disproves the checkout statement.
- **Why this misleads:** These are relied-on facts, but the claim inventory
  cannot prove them and has missed a false commercial promise.
- **Concrete fix:** Remove untestable claims. Otherwise add observable tests
  for sample totals, no nutrition upload, food-value provenance, token-only
  license requests, and a working checkout; list every actual landing/README
  location in each claim's where field.

### F-1-5 — MINOR — Landing headings use indirect or incomplete wording

- **Location / quote:** **“A PRIVATE MEAL PLANNING SHEET,” “THE QUESTION IT
  ANSWERS,” “Will this small menu clear my floor?,”** and **“Keep the basic
  planner free.”**
- **Why this misleads:** “Sheet,” “question,” “menu,” and “floor” make the
  reader infer a section purpose. “Basic” omits the usable free-plan limit.
- **Concrete rewrite:** **“Private meal planner,” “See a sample week meet
  nutrient targets,” “Sample weekly nutrient totals,”** and **“Use the free
  planner with up to 10 saved foods.”**

### F-1-6 — MINOR — README exceeds the cap and uses avoidable jargon

- **Location / quote:**
  - **“Nutrient Floor is for home cooks who want to clear a fibre or protein
    floor, or keep sugar below a limit, without keeping a calorie diary.”**
    (26 words; cap 22)
  - **“After checkout, the returned license token is stored only in this
    browser and verified with Sociobot when online; nutrition data is never
    sent with it.”** (25 words; cap 22)
  - **“Demo changes use a separate IndexedDB namespace and never touch your
    real plan.”** and **“Nutrient Floor has no analytics or food catalogue
    network calls.”** (implementation jargon.)
- **Concrete rewrite:**
  - “For home cooks who want more fibre or protein, or less sugar, without a
    calorie diary.”
  - “Your license token stays in this browser. Sociobot checks it when you are
    online.” (Only after F-1-1/F-1-2 are repaired and tested.)
  - “Demo changes use separate browser storage. They never touch your real
    plan.”
  - “This planner does not use analytics or upload your meal data.”

## Demo and sandbox

**PASS.** From a fresh 390 px context, the sample action opened /demo and
immediately showed seven food rows, three placed meals, three targets, and the
persistent **“Demo — sample data, nothing is saved.”** banner. Adding a food
made the pantry count eight; **Reset demo** returned it to seven. **Start for
real** opened an empty planner without the banner. Landing, demo, add-food,
reset, and start-for-real request logs contained only the product origin.

After an online setup and service-worker control, an offline /demo reload
rendered the planner and opened **Add a meal**. No demo or offline blocker was
reproduced.

## Claims and clean-clone checks

I cloned into /tmp/nutrient-review-clean.UDjXAa, ran npm ci, then ran every
exact .factory/claims.json command individually. All 11 passed:

| Claim | Result |
| --- | --- |
| demo-week-coverage, local-only, offline-use, json-transfer | pass |
| local-persistence, demo-isolation, paid-upgrade, free-food-cap | pass |
| target-cap, print-week, food-source | pass |

The same clean checkout passed npm test (7/7), npm run build, and the full
Playwright suite (23/23). The paid-upgrade test is insufficient rather than
failed; it does not negate F-1-1 or F-1-2.

## Copy audit

Word counts use visible words. Short labels are included to cover the full
landing; em dash means no plain-words issue in that string.

### Landing page

| Copy | Words | Flag |
| --- | ---: | --- |
| Skip to planner | 3 | — |
| Nutrient Floor | 2 | — |
| Demo / Planner / Privacy | 1 / 1 / 1 | — |
| A private meal planning sheet | 5 | F-1-5 |
| Plan meals that meet your nutrient targets. | 7 | — |
| For home cooks who want enough fibre or protein without logging every calorie. | 13 | — |
| Try it with sample data | 5 | — |
| Loads a seven-food plan. | 4 | — |
| Stored on this device | 4 | — |
| Works offline after setup | 4 | — |
| $12 one-time upgrade | 3 | F-1-1 |
| Original generated illustration; food values are entered by you. | 9 | F-1-4; two ideas |
| The question it answers | 4 | F-1-5 |
| Will this small menu clear my floor? | 7 | F-1-5 |
| Pick a few targets, save familiar foods, and place meal portions on a week. | 14 | — |
| Fibre / 33.5 g / above 30 g floor | 1 / 3 / 4 | F-1-4 |
| Protein / 75.5 g / above 75 g floor | 1 / 3 / 4 | F-1-4 |
| Plan a week in three steps | 6 | — |
| Set a target / Choose a floor or limit in grams. | 3 / 7 | — |
| Save trusted foods / Copy values from a label or source. | 3 / 7 | — |
| Place meals / See gaps before you cook. | 2 / 5 | — |
| What this does not do | 5 | — |
| It does not count calories, diagnose health conditions, or upload a food diary. | 13 | F-1-4 |
| Optional one-time upgrade | 3 | F-1-1 |
| Keep the basic planner free. | 5 | F-1-5 |
| $12 is a one-time purchase for unlimited saved foods. | 9 | F-1-1 |
| Buy the $12 upgrade | 4 | F-1-1; dead action |
| Have a license? / Restore purchase | 3 / 2 | F-1-2 |
| Nutrient Floor is a private meal planner. | 7 | F-1-4 |
| Terms / Built by Param Factory / v1.1 | 1 / 4 / 2 | — |

### README

Headings: **Nutrient Floor** (2), **Run** (1), **Verify** (1), **Data and
privacy** (3), **Optional one-time upgrade** (3), **Claims verified in the
demo** (5). Change **Run** to **Run locally** and **Verify** to **Run checks**;
the other headings make sense independently.

| Copy | Words | Flag |
| --- | ---: | --- |
| Plan meals that meet your nutrient targets. | 7 | — |
| Nutrient Floor is for home cooks who want to clear a fibre or protein floor, or keep sugar below a limit, without keeping a calorie diary. | 26 | F-1-6 (>22) |
| It stores a small trusted food list and weekly meal plan in the browser on your device. | 17 | 'trusted' unsupported; use “your food list” |
| Try the isolated sample plan at /demo or /?demo=1. | 10 | 'isolated' jargon; say “sample plan” |
| It loads seven foods, three meals, and three targets. | 9 | — |
| Demo changes use a separate IndexedDB namespace and never touch your real plan. | 13 | F-1-6 |
| Leaving demo through any app link discards its sample changes. | 10 | — |
| Open http://localhost:5173. | 4 | — |
| Use Start for real in the demo, or open /plan, to create a private plan. | 15 | — |
| Values are user-entered and include a source field; check labels before relying on a value. | 15 | split two ideas |
| The build output is dist/, with index.html at its root. | 11 | — |
| Deploy it as a static single-page application and preserve the included staticwebapp.config.json. | 14 | technical instruction; acceptable |
| Food values, targets, and meals are stored in IndexedDB on your device. | 12 | use “browser storage” |
| Export or import the full plan as JSON. | 8 | — |
| Nutrient Floor has no analytics or food catalogue network calls. | 10 | F-1-6 |
| The demo and normal planner work offline after setup. | 9 | — |
| You can print the weekly sheet. | 6 | — |
| See /privacy and /terms. | 4 | — |
| The free planner saves up to 10 foods. | 8 | — |
| A $12 one-time Sociobot purchase adds unlimited saved foods. | 9 | F-1-1/F-1-2 |
| Checkout is hosted by Sociobot, the merchant of record. | 9 | F-1-1/F-1-4 |
| After checkout, the returned license token is stored only in this browser and verified with Sociobot when online; nutrition data is never sent with it. | 25 | F-1-4/F-1-6 |
| Use the Have a license? field on the home page to restore a purchase on another device. | 17 | F-1-1 |
| Loads a seven-food plan with three placed meals. | 8 | — |
| No meal data leaves this device. | 6 | — |
| Works offline after setup. | 4 | — |
| Export or import your plan. | 5 | — |
| Your plan stays on this device. | 6 | — |
| Demo data uses a separate local space and is discarded when you leave. | 13 | — |
| $12 is a one-time purchase for unlimited saved foods. | 9 | F-1-1/F-1-2 |
| The free planner saves up to 10 foods; a valid upgrade allows more. | 13 | F-1-2 |
| Saves up to five targets. | 5 | — |
| Prints a weekly sheet. | 4 | — |
| Food values are entered by you and include a source field. | 11 | — |
| Each claim and its Playwright command are recorded in .factory/claims.json. | 11 | — |

## Structure, history, and missed leverage

Home, demo, planner, privacy, and terms have route-specific titles, one h1,
main, canonical URLs, shared header/footer, no console errors, and the
blueprint drafting-sheet identity described in the design file. Sitemap,
robots, app routes, back/focus regression coverage, metadata, and normal link
targets pass. The checkout is the only bad link, and the static 404 is F-1-3.

There are no earlier .factory/review-*.md or .factory/polish-*.md files in
repository history. I read the earlier handoffs and present verification
records. Offline reload, invalid import recovery, CSP meters, dialog keyboard
handling, accidental meal creation, demo isolation, delete confirmation,
capacity, mobile layout, unsafe IDs, metadata, and skip-link findings now have
current source/regression-test evidence and were not reproduced. The prior 404
gap remains; the earlier unavailable/bypassable paid-upgrade problem has
regressed as F-1-1 and F-1-2.

No additional AI feature is expected: the local-first planner already has the
obvious import/export and print paths, and an AI meal generator would require
sending meal data without following from the job. No provider key is embedded.

## What would make this perfect

Make the paid offer real and enforce it only after verified entitlement, or
remove paid copy and gating. Complete the 404 shell with direct wording. Then
match every visitor-facing promise to a sandbox claim test and apply the listed
copy rewrites before another full live review.


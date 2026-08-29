# Nutrient Floor adversarial review 3 handoff — FAIL

## Result

- Work order: `nutrient-floor-planner-review-3`
- Candidate: `ae1a65946e30131da45e4ec1cfb38e592b34361a`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Review: `.factory/review-3.md`
- Product code modified: no

The live product behavior passes, but the zero-finding review standard does
not. F-3-1 records an undeclared README build-output claim. F-3-2 records a
visible hero caption that provides no usable product information.

## What was verified

- Cold first read in fresh 390 × 844 and 1440 × 900 Chromium contexts.
- One-click demo, realistic seeded state, banner, Reset demo, Start for real,
  hard-navigation reset, tab-close reset, and real-plan isolation.
- Live request logging, offline demo/planner reload, and editability.
- Every exact command in `.factory/claims.json` from detached clean clone
  `/tmp/nutrient-review3-clean.4bcgId`: 15/15 passed.
- `npm test`: copy guard and 11/11 unit tests passed.
- `npm run lint`: passed.
- `npm run build`: passed and produced `dist/index.html`.
- `npx playwright test --reporter=line`: 39/39 passed.
- Factory `verify-url.sh`: live home and demo passed with no console errors.
- Playwright Axe: zero serious/critical violations on all reviewed routes and
  states.
- Route metadata, designed 404, deep links, Back/focus announcement, internal
  link crawl, response headers, touch targets, reduced motion, and distinct
  blueprint visual identity.
- Every earlier finding from reviews 1 and 2 was checked live and in current
  code; all earlier defects remain fixed.

## Remaining work

1. Resolve F-3-1 by adding a one-to-one `build-output` claim test or removing
   the declarative README claim and its inaccurate claim-inventory assertion.
2. Resolve F-3-2 by removing the decorative visible hero caption while keeping
   the image alt text.
3. Rerun the entire adversarial checklist. PASS requires zero findings.

The repository has no `.factory/brief.json`; the review used the design
thesis, current behavior, demo contract, claim inventory, and supplied work
order as the available scope.

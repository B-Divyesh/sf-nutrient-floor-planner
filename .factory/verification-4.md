# Independent verification 4 — FAIL

**Candidate:** `a9ba872f421a66d0b87c55f44310017f791e10ee`  
**Live URL:** https://nutrient-floor-planner.sociobot.in  
**Verified:** 2026-08-28 UTC  
**Verdict:** **FAIL — release-blocking claims-contract defects.**

## Cold first read

On a cold desktop visit, the first screen says “Plan meals that meet your
nutrient targets.” It says it is for “home cooks who want enough fibre or
protein without logging every calorie.” The first clear action is the one-click
link **Try it with sample data**, immediately explained as loading a seven-food
plan. It opens `/demo`, which displayed the persistent “Demo — sample data,
nothing is saved” banner, 7 foods, and 3 meals. This requirement passes.

## Clean-clone test evidence

I cloned the candidate into `/tmp/nutrient-floor-verify`, detached HEAD at the
candidate SHA, then ran `npm ci` before any product tests. Every exact command
declared in `.factory/claims.json` passed independently (one test each):

| Claim ID | Exact command | Result |
| --- | --- | --- |
| `demo-week-coverage` | `npx playwright test --grep @claim:demo-week-coverage` | PASS |
| `local-only` | `npx playwright test --grep @claim:local-only` | PASS |
| `offline-use` | `npx playwright test --grep @claim:offline-use` | PASS |
| `json-transfer` | `npx playwright test --grep @claim:json-transfer` | PASS |
| `local-persistence` | `npx playwright test --grep @claim:local-persistence` | PASS |
| `demo-isolation` | `npx playwright test --grep @claim:demo-isolation` | PASS |
| `paid-upgrade` | `npx playwright test --grep @claim:paid-upgrade` | PASS |
| `print-week` | `npx playwright test --grep @claim:print-week` | PASS |
| `food-source` | `npx playwright test --grep @claim:food-source` | PASS |

Additional clean-clone gates all passed:

```text
npm test       6/6 passed
npm run lint   passed (tsc --noEmit)
npm run build  passed; dist/ produced
npx playwright test  20/20 passed
```

The build produced 25,894 B JS (9.20 KB gzip), 12,493 B CSS (3.55 KB gzip),
and a 121,876 B hero WebP: within the stated static/PWA initial budgets.

## Live product verification

- The live JS and CSS SHA-256 values exactly match a fresh candidate build:
  `2da0e976afd27ab112bc06724deb9993cd57f8c62e89ed6b701aa7c27dbc6742`
  and `640da7549bdc50f69077541c2abe00e7339d8624068121a2a2e7d7937da150e0`.
  The worker differs only in its expected `Date.now()` cache-version value.
- `/`, `/demo`, `/plan`, `/privacy`, `/terms`, manifest, robots, and sitemap
  returned 200; an unknown route returned 404.
- A fresh real-plan flow added a 12 g protein floor, a sourced 6 g protein
  food, and a two-serving meal. The weekly meter reported exactly “12 g, on
  plan.” A zero target was rejected by native constraint validation; malformed
  JSON reported the recovery message and preserved the meal; food deletion
  required a consequence-specific confirmation.
- Live request recording during landing, demo, and an add-food flow found only
  same-origin product requests. There were no page errors or console errors.
  The live document CSP is `default-src 'self'` with only the documented
  Sociobot license origin in `connect-src`; HSTS, `nosniff`, and strict-origin
  referrer policy are present. There is no product server endpoint to load or
  rate-limit; the optional Sociobot checkout/verification endpoint is not
  called during normal planning.
- At 390 px in dark/reduced-motion mode there was no horizontal overflow,
  reduced-motion durations were `0s`, and the Tab-focused skip link had a
  3 px visible lime focus outline. Live Axe Playwright scans of `/`, `/demo`,
  `/plan`, `/privacy`, and `/terms` found zero serious/critical violations.
  `npx @axe-core/cli` itself could not start because this container has no
  Selenium Chrome binary; the pinned Playwright Chromium integration ran.
- After a live online visit and service-worker control, an offline reload of
  `/demo` succeeded and **Add a meal** opened. A local static serving of the
  candidate with a changed worker cache version produced “An update is ready”; 
  **Update now** activated it (`waiting: false` afterwards).
- Assets use immutable one-year caching. HTML, manifest, and worker use a
  30-second revalidation policy, appropriate for worker discovery.

## Release-blocking defects

### Major — unlisted, untested capacity claims

The claims contract requires every visitor-reliant claim to have a dedicated
entry and `@claim:<id>` observable test. These capacity promises have neither:

1. **“The free planner saves up to 10 foods.”** appears in `README.md` and the
   equivalent cap is surfaced in the planner notice. `.factory/claims.json`
   has no `free-food-cap` (or equivalent) claim, and no matching tagged browser
   test exercises the eleventh food / upgrade boundary.
2. **“UP TO 5 CUSTOM TARGETS”** is displayed in the planner, with the matching
   “You can save up to five targets.” notice. `.factory/claims.json` has no
   target-cap claim and no matching tagged end-to-end test exercises the sixth
   target boundary. The unit validation test is not a declared demo claim test.

The `claims` acceptance contract says an unlisted claim-like sentence is a
finding that fails review until it is removed or a claim and sandbox test are
added. Therefore this otherwise functional candidate cannot be accepted.

## Recommended repair and re-verification

Either remove both quantitative promises from visitor-facing copy, or add
separate entries to `.factory/claims.json` and isolated Playwright demo tests
that prove the 10-food free boundary/unlimited licensed behavior and the
five-target boundary. Re-run every declared claim command after that change.

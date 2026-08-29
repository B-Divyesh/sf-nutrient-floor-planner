# Independent verification 5 — FAIL

## Scope and decision

- Candidate commit: `a240b244be4cc6f5dcda066519f79e6a60d3ecc0`
- Live URL: https://nutrient-floor-planner.sociobot.in
- Verified: 2026-08-29 (UTC), from a fresh `npm ci` install in this checkout.
- Decision: **FAIL — release-blocking accessibility defect.**

The product otherwise matches the requested candidate deployment and its normal,
boundary, invalid-input, privacy, PWA, responsiveness, and automated quality
checks passed. The defect below violates the non-negotiable keyboard/skip-link
acceptance requirement.

## Release blocker

### High — the keyboard skip link does not skip to the planner

On live `/demo`, a fresh keyboard-only browser context reached **Skip to
planner** as the first Tab stop. Pressing Enter changed the URL to `#main`, but
did not scroll the page (`window.scrollY` remained `0`) and left focus on the
skip link. Pressing Tab next moved focus to `body`, after which navigation
continues through the header rather than the planner. This reproduces at 1440px
desktop and 390px mobile.

`<main id="main">` is not programmatically focusable, so the link cannot do the
job its label promises. A keyboard user cannot bypass the repeated header/nav.
This fails the required working skip link and keyboard-only use baseline.

Expected repair: make the main target focusable (for example `tabindex="-1"`) and
move focus to it on skip activation; add a Playwright regression test that
asserts focus reaches `#main` and the next Tab starts in planner content.

## Required claims contract

`.factory/claims.json` exists and declares 11 claims. From the clean install I
ran every exact declared command against the local demo entry point:

| Claim | Exact test command | Result |
| --- | --- | --- |
| demo-week-coverage | `npx playwright test --grep @claim:demo-week-coverage` | pass |
| local-only | `npx playwright test --grep @claim:local-only` | pass |
| offline-use | `npx playwright test --grep @claim:offline-use` | pass |
| json-transfer | `npx playwright test --grep @claim:json-transfer` | pass |
| local-persistence | `npx playwright test --grep @claim:local-persistence` | pass |
| demo-isolation | `npx playwright test --grep @claim:demo-isolation` | pass |
| paid-upgrade | `npx playwright test --grep @claim:paid-upgrade` | pass |
| free-food-cap | `npx playwright test --grep @claim:free-food-cap` | pass |
| target-cap | `npx playwright test --grep @claim:target-cap` | pass |
| print-week | `npx playwright test --grep @claim:print-week` | pass |
| food-source | `npx playwright test --grep @claim:food-source` | pass |

The subsequent complete Playwright run passed all 22 tests, including all
eleven tagged claim tests. This validates the demo plan (7 foods/3 meals),
separate demo namespace and exit/reset behavior, offline reload, JSON transfer,
storage persistence, invalid-import recovery, capacity boundaries (10 free
foods/five targets), the mocked license upgrade, printing, source attribution,
dialogs, unsafe-ID rejection, storage failure recovery, mobile/zoom layout, and
local axe scans.

## First-read test (cold live visit)

The cold live landing screen passed the plain-language/demonstration gate. It
says it **plans meals that meet nutrient targets**, says it is **for home cooks
who want enough fibre or protein without logging every calorie**, and presents
**Try it with sample data** with the result **Loads a seven-food plan**. It is a
one-click link to `/demo`.

## Local quality gates

| Check | Evidence | Result |
| --- | --- | --- |
| Install | `npm ci` | pass; 0 vulnerabilities reported |
| Unit tests | `npm test` | 7/7 passed |
| Type/lint | `npm run lint` | passed (`tsc --noEmit`) |
| Browser integration | `npx playwright test` | 22/22 passed |
| Production build | `npm run build` | passed; `dist/` produced |
| Bundle budget | JS 26,089 B / 9.30 KB gzip; CSS 12,493 B / 3.55 KB gzip | pass (<200 KB JS / <50 KB CSS) |

## Live deployment identity, headers, and privacy

- The deployed `/`, `index-Cv9C-JMs.js`, and `index-nPaBR6Tz.css` SHA-256 hashes
  exactly match a fresh local production build. The live worker uses the same
  generated shell; its sole difference is the expected build-specific cache
  nonce.
- Live `/`, `/demo`, `/plan`, `/privacy`, `/terms`, manifest, robots, sitemap,
  404 page, PWA icons, and hero all returned 200. An unknown route returned 404.
- Headers on live HTML/assets include CSP restricted to `self` plus the declared
  Sociobot license origin, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, HSTS, and immutable
  one-year caching for hashed JS/CSS/assets.
- A fresh live Playwright flow visited `/plan`, saved a food with a source and
  numeric fibre value, and recorded only same-origin document/JS/CSS requests;
  no foreign request occurred and no console/page error occurred. This supports
  the local-only nutrition-data promise. The only product network path in code
  is the optional Sociobot license verification.
- The product-unlock verification endpoint was exercised with one invalid token
  from a single client: 30 requests returned 200; request 31 returned 429. The
  first 429 had `Retry-After: 3` (and `x-ratelimit-after: 3`); 89 of 120 total
  requests were 429. Observed allowance: 30 requests per window.

## Browser, responsive, accessibility, and PWA evidence

- Live Playwright/Axe found zero serious or critical violations on `/demo` in
  desktop light and 390px dark/reduced-motion contexts. Console/page errors:
  none. This does not negate the manual keyboard blocker above.
- At 390px, document width equalled viewport width (390px); no horizontal
  overflow. Reduced-motion reported zero active transitions. The first Tab
  focus ring was visible at 3px (blue in light, lime in dark). Dialog Escape
  returned focus to the triggering **Add a meal** button after render.
- Live service worker was active and controlling scope `/`; after an online
  setup, an offline `/demo` reload rendered the demo heading and opened **Add a
  meal** successfully. Its cache contained the current `nutrient-floor-*`
  shell.
- A separate local two-version production-worker simulation rebuilt the worker
  with a new cache nonce, called `registration.update()`, showed **An update is
  ready**, and exercised **Update now** / `SKIP_WAITING`; the new worker became
  the waiting then activating worker. This confirms the deployed update path
  without changing product source.

## Non-blocking observations

- No backend, CLI, library consumer, sign-in, or AI workflow applies to this
  local-first PWA.
- Existing modified `graphify-out/` files were present before verification and
  were left untouched.

## Retest criterion

Release only after the skip-link fix is implemented, a regression test proves
focus lands in the planner and subsequent Tab navigation bypasses the header,
and all eleven exact claim commands plus the complete suite pass again.

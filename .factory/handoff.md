# Nutrient Floor verification handoff

## Release decision: **FAIL**

Independent verification of candidate
`a240b244be4cc6f5dcda066519f79e6a60d3ecc0` at
https://nutrient-floor-planner.sociobot.in found a release-blocking keyboard
accessibility defect.

The first Tab stop is **Skip to planner**, but activating it only changes the
URL to `#main`: it neither scrolls nor moves focus into the planner. The next
Tab remains in the page/header navigation. This fails the required functional
skip link and keyboard-only acceptance baseline.

## Required repair and retest

Make the main target focusable and focus it when the skip link is activated;
add a regression test proving focus reaches the planner and the next Tab
bypasses the header. Then rerun every exact command in `.factory/claims.json`,
the full Playwright suite, and the local build.

## Evidence

- Fresh install: `npm ci` passed (0 vulnerabilities reported).
- `npm test`: 7/7 passed; `npm run lint`: passed; `npm run build`: passed and
  produced `dist/`; `npx playwright test`: 22/22 passed.
- All 11 exact declared claim commands passed independently.
- Live HTML/JS/CSS hashes match the local candidate production build; worker
  behavior matches except for its intentional generated cache-version nonce.
- Live privacy request logging during a save found only same-origin requests;
  no console/page errors. Headers include CSP, HSTS, nosniff, strict-origin
  referrer policy, and immutable hashed-asset caching.
- Live `/demo` works after offline reload; local two-version worker update
  simulation showed the update notice and exercised **Update now**.
- Live Axe scans showed zero serious/critical findings on desktop and 390px
  dark/reduced-motion; the manual skip-link failure remains blocking.
- The optional Sociobot license verify endpoint enforced 429 after 30 requests
  from one client; first 429 included `Retry-After: 3`.

See `.factory/verification-5.md` for exact evidence, claim-by-claim results,
and the full retest criterion.

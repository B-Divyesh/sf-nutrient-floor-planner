# Independent verification 6 — PASS

## Scope and decision

- Candidate: `287a245befbc7292ddb4bc41ab69030dbeda6a1e`
- Live URL: https://nutrient-floor-planner.sociobot.in
- Verified: 2026-08-29 UTC
- Work order: `nutrient-floor-planner-verify-6`
- Decision: **PASS.** No release-blocking or material defects were found.

This was a fresh verification of the candidate and live deployment. Product
code was not changed. The supplied researched brief was used as the scope
contract because this checkout has no `.factory/brief.json`.

## Mandatory first-read and demo gate

The cold live first screen passes on desktop and at 390 px:

- What it does: **“Plan meals that meet your nutrient targets.”**
- Who it is for: **“For home cooks who want enough fibre or protein without
  logging every calorie.”**
- What to do first: **“Try it with sample data”**, immediately explained by
  **“Loads a seven-food plan.”**

The action is fully visible in the initial 390 × 844 viewport. One click opens
`/demo`, showing seven foods, three meals, three targets, and the persistent
**“Demo — sample data, nothing is saved”** banner with **Reset demo** and
**Start for real**.

## Required claims contract

`.factory/claims.json` exists and contains 11 valid entries. After `npm ci` in
a detached clean worktree at the exact candidate commit, I ran every declared
command separately through the shipped `/demo` or `/plan` entry point:

| Claim ID | Exact command | Result |
| --- | --- | --- |
| `demo-week-coverage` | `npx playwright test --grep @claim:demo-week-coverage` | PASS |
| `local-only` | `npx playwright test --grep @claim:local-only` | PASS |
| `offline-use` | `npx playwright test --grep @claim:offline-use` | PASS |
| `json-transfer` | `npx playwright test --grep @claim:json-transfer` | PASS |
| `local-persistence` | `npx playwright test --grep @claim:local-persistence` | PASS |
| `demo-isolation` | `npx playwright test --grep @claim:demo-isolation` | PASS |
| `paid-upgrade` | `npx playwright test --grep @claim:paid-upgrade` | PASS |
| `free-food-cap` | `npx playwright test --grep @claim:free-food-cap` | PASS |
| `target-cap` | `npx playwright test --grep @claim:target-cap` | PASS |
| `print-week` | `npx playwright test --grep @claim:print-week` | PASS |
| `food-source` | `npx playwright test --grep @claim:food-source` | PASS |

Result: **11/11 claim commands passed**. Landing and README claims map to these
entries; no release-blocking unlisted behavioral claim was found.

## Clean-checkout quality gates

The following were repeated in the detached clean worktree after `npm ci`:

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 58 packages, 0 vulnerabilities |
| `npm test` | PASS; 7/7 unit tests |
| `npm run lint` | PASS; TypeScript `--noEmit` |
| `npx playwright test` | PASS; 23/23 browser tests |
| `npm run build` | PASS; `dist/` produced |

The production build emits 26.38 kB JS (9.38 kB gzip) and 12.49 kB CSS
(3.55 kB gzip). The hero WebP is 121,876 bytes. These are below the 200 kB JS,
50 kB CSS, and 300 kB mobile-hero budgets.

## End-to-end product behavior

Fresh live browser contexts covered normal, boundary, invalid, and recovery
paths:

- A 12 g protein floor, a sourced food with 6 g protein, and a two-portion meal
  produced **12 g — on plan**.
- Blank required food fields and a negative nutrient value were blocked by
  visible native form validation. Zero nutrient values were accepted, then a
  corrected food saved successfully.
- Malformed JSON produced the specific recovery message and preserved the
  current plan. The suite also rejects incomplete records and unsafe imported
  IDs before storage or rendering.
- Food deletion showed its meal consequence, **Keep it** preserved the data,
  and confirmed deletion removed the portions and returned coverage to 0 g
  short.
- The exact 10-food free boundary, licensed eleventh food, five-target limit,
  JSON round trip, persistence, print action, demo reset/exit isolation, and
  blocked-storage recovery all passed in the complete browser suite.
- Empty `/plan` gives direct next actions. Privacy and Terms are reachable at
  real URLs, and an unknown path returns a designed HTTP 404 with a home link.

No backend, library/CLI package, sign-in, or runtime AI feature applies. AI meal
generation is explicitly outside the brief.

## Live identity, privacy, headers, and endpoint allowance

The live deployment matches the candidate build:

- HTML SHA-256: `6d8faf9d8e2327027fce391a26fe6fc0b13eae6e35fcae0a811f79c9e57b262c`
- JS SHA-256: `88669159f3d50b747245a2a30b0dc2c4ca2ed8611718d97bd4e727729d16b78e`
- CSS SHA-256: `640da7549bdc50f69077541c2abe00e7339d8624068121a2a2e7d7937da150e0`
- Manifest, 404 page, hero, and both icons also match byte for byte. The live
  worker matches after normalizing only its generated cache timestamp.

Live `/`, `/demo`, `/plan`, `/privacy`, `/terms`, manifest, robots, sitemap,
404 page, hero, and icons returned 200; a nonexistent route returned 404.

Playwright recorded 28 requests across the live landing, demo, input, route,
and offline setup flow. Every request was same-origin. There were zero console
errors on valid routes, zero page errors, and zero failed requests. The only
console error observed was the expected browser resource message from the
intentional HTTP 404 probe. No analytics, CDN font/script, or nutrition-data
request occurred. The optional license request contains only its token.

Headers read from the browser response include:

- CSP: `default-src 'self'; img-src 'self' data:; style-src 'self'; script-src
  'self'; connect-src 'self' https://api.sociobot.in`
- HSTS with subdomains and preload
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- HTML/worker/manifest: `max-age=30, must-revalidate`
- Hashed assets: `max-age=31536000, immutable`

The Sociobot product verification endpoint was tested from one client with an
invalid token. Requests 1–30 returned 200; request 31 returned 429 with
`Retry-After: 4` and `x-ratelimit-after: 4`. Observed allowance: **30 requests
per rate-limit window**.

## Accessibility, responsive behavior, and performance

- The repaired live skip-link path passes at desktop and 390 px: first Tab
  focuses **Skip to planner**; Enter focuses `main#main` and scrolls 137 px;
  the next Tab focuses **Export plan**.
- Dialog autofocus, Escape close, and focus return pass. Interactive targets
  checked at 390 px are at least 44 × 44 CSS px. The visible dark-mode focus
  outline is 3 px lime.
- Desktop light and 390 px dark/reduced-motion Playwright Axe scans found zero
  violations. The independent `@axe-core/cli` 4.11.4 scan of live `/demo` also
  found zero violations.
- The factory `verify-url.sh` passed: HTTPS 200, title, `lang=en`, one `h1`, a
  main landmark, complete image alt text, and no console errors.
- At 390 px, document and viewport widths are both 390 px. The full suite also
  passes its 195 px, 200%-zoom-equivalent layout check. Reduced-motion computed
  transitions are all `0s`.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 0.9 s, LCP 1.8 s, TBT 50 ms, CLS 0, total transfer 204 KiB.

## PWA and offline verification

The live manifest declares standalone display, versioned start URL, 192 and
512 icons, and a maskable 512 icon. After an online visit, the live worker
controlled `/`; a fully offline `/demo` reload rendered the sample and opened
the **Add a meal** dialog.

A fresh local two-version simulation of the exact production build changed the
worker cache version. It produced **An update is ready**, exposed a waiting
worker, and **Update now** activated and controlled the new worker, rendered
version 2, and left the version-2 cache active.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: the static 404 uses the drafting metaphor “This sheet is not in the
  folder” and omits the normal site header/footer. It still has a direct
  “Return to your meal plan” link, correct title/lang/main/h1, HTTP 404 status,
  readable contrast, and no impact on core use. Replace the heading with
  “Page not found” and reuse the standard shell during a future polish pass.

The earlier deployment-only concern is resolved by fresh asset hashes and live
behavior. The previous skip-link blocker is also fixed in production.

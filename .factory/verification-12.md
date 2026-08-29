# Independent product verification 12 — PASS

## Candidate and verdict

- Candidate commit: `89dff8e723ec6af694542659860e5ef359240908`
- Live URL: <https://nutrient-floor-planner.sociobot.in/>
- Verified: 2026-08-29 UTC
- Artifact: offline-first, local-first PWA
- Result: **PASS — no release-blocking or other product defect was found.**

This was a fresh independent run. The candidate was checked out detached in a
clean worktree at `/tmp/nutrient-floor-qa.yADzqb`; dependencies were installed
there with `npm ci`. Product code was not modified. The supplied researched
brief and work order were used as the acceptance contract.

Fresh deployment evidence supersedes any earlier deployment-only result. The
site is reachable, its critical production files match this candidate, and its
live behavior passes the contract below.

## Mandatory first-read gate

**PASS.** On a cold live load, the first screen answers all three questions in
plain words:

- What it does: **“Plan meals that meet your nutrient targets.”**
- Who it serves: **“For home cooks who want enough fibre or protein without
  logging every calorie.”**
- What to do first: **“Try it with sample data.”** The adjacent text says this
  loads seven foods, three meals, and three targets.

The action is visible above the fold at 390 px and is 44 px high. One click
opens `/?demo=1` with the populated planner and persistent **Demo — sample
data, nothing is saved**, **Reset demo**, and **Start for real** controls.

## Claims contract

`.factory/claims.json` exists. Its inventory guard reports 17 claims with one
tagged browser test each. Every listed command was run separately before the
rest of the review; all 17 passed:

| Claim ID | Result |
| --- | --- |
| `demo-week-coverage` | PASS |
| `sample-totals` | PASS |
| `sample-floor-status` | PASS |
| `free-to-use` | PASS |
| `local-only` | PASS |
| `offline-use` | PASS |
| `json-transfer` | PASS |
| `local-persistence` | PASS |
| `demo-isolation` | PASS |
| `demo-reset` | PASS |
| `target-cap` | PASS |
| `print-week` | PASS |
| `food-source` | PASS |
| `target-comparison` | PASS |
| `user-chosen-targets` | PASS |
| `no-calorie-input` | PASS |
| `build-output` | PASS |

The live landing page, planner, Privacy, Terms, demo documentation, and README
were cross-checked against the inventory. No unlisted testable product claim
was found.

## Clean-checkout gates

| Check | Fresh result |
| --- | --- |
| `npm ci` | PASS; 58 packages installed, 0 vulnerabilities |
| `npm test` | PASS; copy audit, claim inventory, 11/11 unit tests |
| `npm run lint` | PASS; `tsc --noEmit` |
| `npm run build` | PASS; exact production build generated `dist/index.html` |
| `npx playwright test --reporter=line` | PASS; 41/41 integration, claim, accessibility, and PWA tests |
| `npm audit` | PASS; 0 vulnerabilities |
| `npm audit --omit=dev` | PASS; 0 vulnerabilities |

The build emitted 26.53 kB JavaScript (9.17 kB gzip), 13.08 kB CSS (3.74 kB
gzip), and a 121,876-byte hero WebP. There are no webfont files. These are
comfortably inside the 200 kB JS, 50 kB CSS, 120 kB font, and 300 kB hero
budgets.

## End-to-end and recovery evidence

- The bundled demo shows seven sourced foods, three placed meals, and three
  chosen targets. It calculates 40 g fibre against a 30 g floor and 75.5 g
  protein against a 75 g floor; both show **on plan** with named meters.
- A fresh real plan accepted a 30 g fibre floor, 10 g sugar limit, a sourced
  chickpea bowl, and a two-portion meal. It calculated 24 g fibre / 6 g short
  and 4 g sugar / on plan, then survived reload.
- JSON export contained the expected one food, one meal, and two targets. A
  malformed import produced the documented recovery message and preserved the
  existing food.
- Precision boundaries were correct: 0.1 g × 1.25 displayed 0.125 g and 0.025
  g over; 0.1 g × 0.75 displayed 0.075 g and 0.025 g short.
- The five-target maximum, a twelfth free food, empty required fields, unsafe
  imported IDs, unavailable browser storage, cancellation, and confirmed
  deletion are covered by passing browser tests. Invalid input leaves the
  dialog open, identifies the field, and does not corrupt persisted data.
- Demo edits reset after reload, explicit reset, navigation, and tab closure;
  the real plan remains separate.

## Keyboard, mobile, and accessibility

- `/opt/fleet/lib/verify-url.sh` passed on live home and demo: HTTPS 200,
  specific titles, `lang=en`, one h1, a main landmark, complete image alt text,
  labelled buttons, and no console/page errors.
- Fresh live Axe scans found zero serious or critical findings on home, demo,
  planner, Privacy, Terms, the styled 404, and dark mode.
- A keyboard-only live flow used Tab, Enter, typing, and native dialog focus to
  add a target, food, and meal. It reached the skip link first, moved focus to
  `main`, focused each dialog's first field, and produced 16 g / **on plan**.
- The skip link has a visible 3 px outline. Escape closes a dialog and returns
  focus to its opener. SPA route changes focus and announce the new h1.
- At 390×844 there is no page overflow and all checked controls are at least
  44 px. At a 195 px viewport (200% zoom equivalent), document width remains
  195 px and critical planner annotations remain 14 px.
- With reduced motion requested, the live demo reports no non-zero animation
  or transition duration.

Desktop and 390 px mobile captures were visually inspected. The blueprint
drafting-sheet identity remains coherent; content is readable, the primary
action is obvious, and the intentionally horizontal seven-day board does not
create page-level overflow.

## Privacy, headers, and routing

The Playwright request log for the full live demo and editing flow contains
only same-origin documents, hashed JS/CSS, and the hero image. It contains no
XHR, fetch, WebSocket, EventSource, or ping request, and no third-party request.
No meal data left the browser.

Live document responses include:

- `Content-Security-Policy: default-src 'self'; ... connect-src 'self';
  frame-ancestors 'none'`
- `Strict-Transport-Security: max-age=10886400; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

HTML and the service worker use `max-age=30, must-revalidate`. Hashed JS/CSS
use `max-age=31536000, immutable`. The manifest has
`application/manifest+json`. `/`, `/demo`, `/plan`, `/privacy`, `/terms`,
robots, sitemap, icons, social image, and favicon return 200. An unknown route
returns HTTP 404 with the designed recovery page. All user navigation links
resolve; the only non-HTTP link is the documented support email.

## PWA behavior

The manifest supplies name, short name, standalone display, product palette,
versioned start URL, 192 px icon, and 512 px maskable icon. On live `/demo`, a
service worker controlled the page and offline reload reopened the populated
planner; **Add a meal** still opened while offline. The observed live cache was
`nutrient-floor-v1788013148996`.

The fresh full suite also exercised a generated replacement worker. It showed
**Update now**, activated the waiting worker, removed the old cache, reloaded
under the new controller, and retained the planner UI.

## Deployment identity and performance

Fresh local `dist/` and live SHA-256 hashes match:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `eab9909f5abbc61e78258c419be53293e2e2acd0eecb4e8dbb662faf6510b8bc` |
| `assets/index-CctVxQj5.js` | `be20c06b79b4946b99bd329292b7c707e1acf1720d60f18800ddba7fe0261227` |
| `assets/index-C9IZyVAl.css` | `60b825a078886ea06243db28f3598dab9f3ddcfaf1c7fe75d0e414d54fb73c8a` |
| `assets/hero.webp` | `b3d7303812d6a5b85ccd98d67be2e4c1f95220843963501846a385b148352bca` |
| `manifest.webmanifest` | `8f147832092ba5b9437946504fdd54d8feeab43411e8a7f6c1c0e6cd7edfb38f` |
| `404.html` | `6bcecd606a6f00a0cad66421e7cd85d63cc263d914f23f91d754353c44fe5196` |

The hero, both PWA icons, favicon, and 404 stylesheet also matched byte for
byte. `sw.js` differs only in its intentional `Date.now()` cache identifier;
after normalizing that number, local and live hash to
`bbf7bdad9a909874f25298521cba9f1ff5083dab21b79f794b04d3967070bfe4`.

Fresh mobile Lighthouse against the live site scored **99 performance, 100
accessibility, 100 best practices, and 100 SEO**. It measured LCP 1.8 s, FCP
0.9 s, speed index 0.9 s, total blocking time 120 ms, CLS 0, and 205 KiB total
transfer. Lab INP was not available because the audit performs no interaction;
the measured blocking time is below 200 ms and live interactions completed
without observable delay.

## Applicability and defects

This is a static local-first PWA. It has no product server endpoint, payment or
product-unlock call, sign-in, AI call, library package, or CLI. API rate-limit,
Entra authority, backend concurrency/health/persistence, and consumer-package
checks are therefore not applicable.

### Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

**Final decision: PASS.**

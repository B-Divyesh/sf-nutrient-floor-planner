# Independent product verification 13 — FAIL

## Candidate and decision

- Candidate: `566f107d3328c2921500ea2c32a175634bd8a9d1`
- Live URL: <https://nutrient-floor-planner.sociobot.in/>
- Verified: 2026-08-29 UTC
- Artifact: offline-first, local-first PWA
- Result: **FAIL — one high-severity calculation-integrity defect is release-blocking.**

Fresh evidence supersedes any earlier deployment-only result. The deployment is
reachable and matches the candidate, but an accepted boundary value can make a
weekly nutrient result become `Infinity g` and incorrectly report **on plan**.

## Release gates

### First-read and demo gate — PASS

On a cold live load, the first screen says:

- What it does: **Plan meals that meet your nutrient targets.**
- Who it is for: **For home cooks who want enough fibre or protein without
  logging every calorie.**
- What to do first: **Try it with sample data.**

The action is 44 px high on desktop and 390 px mobile. One click opens
`/?demo=1` with seven foods, three meals, three targets, and the persistent
**Demo — sample data, nothing is saved**, **Reset demo**, and **Start for real**
controls. See [first-read-desktop.png](evidence/verification-13/first-read-desktop.png)
and [demo-mobile.png](evidence/verification-13/demo-mobile.png).

### Claims gate — PASS after the required install

`.factory/claims.json` exists. Its inventory guard confirms 17 claims and one
tagged browser test per claim. Every listed command was run separately from the
detached clean worktree after `npm ci`; all 17 passed:

| Claim | Result |
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

For completeness, the commands were first invoked before installing packages,
as requested; all stopped because the clean clone did not yet contain local
`@playwright/test`. This was an environment bootstrap condition, not a product
assertion failure. `npm ci` installed the declared dependency, after which all
17 exact commands passed both in the supplied checkout and the clean worktree.

The landing page, planner, Privacy, Terms, README, and demo documentation were
cross-checked against the inventory. No unlisted product claim was found.

## Release-blocking defect

### High — accepted finite input overflows a core nutrient total and produces a false pass

Reproduced on the live deployment in a fresh browser context:

1. Open `/plan` and add a 30 g minimum fibre target.
2. Add a sourced food with fibre `1e308`. The number input reports
   `valid: true`, `rangeOverflow: false`, and the food is saved.
3. Add a meal containing two portions of that food.
4. The weekly board and meal show **Infinity g**. The 30 g floor is labelled
   **on plan**, and the meter accessible name is
   `Boundary fibre: Infinity grams against a 30 gram floor, on plan`.
5. Reload. The invalid calculated state remains in IndexedDB and on screen.

Expected: reject an unsafe numeric range with a field-specific recovery message,
or prevent non-finite derived totals from being stored or displayed.

Impact: this corrupts the product's core answer—whether a meal plan meets the
user's chosen floor—and announces a false success to assistive technology. The
value is extreme, but it is accepted as valid input and persists. Editing or
deleting the record is a workaround, not input recovery. Evidence:
[numeric-overflow.png](evidence/verification-13/numeric-overflow.png).

The validator checks that each stored number is finite, but it does not enforce
a safe upper bound or check that multiplication and aggregation remain finite.
The existing precision-boundary tests cover small decimals, not overflow.

## Clean-checkout gates

Detached worktree: `/tmp/nutrient-floor-verify13.A9QGdG` at the exact candidate.
It remained clean after all checks.

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 58 packages, 0 vulnerabilities |
| `npm test` | PASS; copy audit, claim inventory, 11/11 unit tests |
| `npm run lint` | PASS; `tsc --noEmit` |
| `npm run build` | PASS; generated `dist/index.html` |
| `npx playwright test --reporter=line` | PASS; 42/42 |
| Every command in `.factory/claims.json` | PASS; 17/17 separately |
| `npm audit` | PASS; 0 vulnerabilities |
| `npm audit --omit=dev` | PASS; 0 vulnerabilities |

The production build is 28.00 kB JavaScript (9.50 kB gzip), 13.76 kB CSS
(3.85 kB gzip), no webfonts, and a 121,876-byte hero WebP. It is within the
200 kB JS, 50 kB CSS, 120 kB font, and 300 kB hero budgets.

## Independent functional and recovery checks

- Normal case: a 30 g fibre floor, sourced 12 g-fibre food, and 2.5-portion
  meal calculated 30 g and **on plan**; food, target, and meal survived reload.
- Invalid zero target: native validation rejected `0` against the 0.1 minimum
  and left the dialog open with its browser validation message.
- Whitespace-only target: the app kept the dialog open, focused the invalid
  field, set `aria-invalid=true`, and announced **Enter a target name. It
  cannot be blank.**
- Malformed JSON import announced the documented recovery message and preserved
  the existing plan.
- The full test suite additionally passed exact decimal thresholds, the five
  target cap, unsafe imported IDs, blocked storage, cancellation, confirmed
  deletion, editing, JSON round-trip, and demo isolation.
- A keyboard-only live flow used Tab, Enter, and typing to create a target,
  food, and meal, then produced 8 g and **2 g short**. The skip link is first,
  moves focus to `main`, and has a visible 3 px outline plus 5 px halo.

## Accessibility, mobile, and motion

- `/opt/fleet/lib/verify-url.sh` passed live home and demo with zero console or
  page errors: [home](evidence/verification-13/verify-home.json) and
  [demo](evidence/verification-13/verify-demo.json).
- Fresh live Axe scans found no serious or critical findings on home, demo,
  planner, Privacy, Terms, 404, or dark-mode demo.
- Each tested route has one h1, one main landmark, route-specific title and
  canonical URL, labelled controls, and complete image alt text.
- At 390×844, home and demo have no page-level horizontal overflow and the
  primary action is 44 px high. At a 195 px 200%-zoom equivalent, document
  width remains 195 px and checked planner annotations remain 14 px.
- With `prefers-reduced-motion: reduce`, no non-zero animation or transition
  duration was found.

## Privacy, headers, routes, and PWA

- A Playwright request log spanning landing, demo, real planning, validation,
  and legal routes recorded 37 same-origin GETs, no third-party request, and no
  XHR, fetch, WebSocket, EventSource, or ping. No meal data left the browser.
- The live browser response exposes CSP (`default-src 'self'`,
  `connect-src 'self'`, `frame-ancestors 'none'`), `nosniff`, and strict-origin
  referrer policy. Curl also confirms HSTS.
- HTML, manifest, and service worker use 30-second revalidation. Hashed JS/CSS
  and the hero use one-year immutable caching.
- `/`, `/demo`, `/plan`, `/privacy`, `/terms`, manifest, service worker,
  icons, social image, sitemap, robots, and favicon return successfully. An
  unknown route returns HTTP 404 with the designed recovery page. All live site
  links resolve; the only non-HTTP link is the support email.
- The live service worker controls `/demo`; the observed cache was
  `nutrient-floor-v1788017517309`. Offline reload retained all seven sample
  foods and the meal dialog remained operable. The clean 42-test suite also
  replaced the worker, activated it through **Update now**, removed the prior
  cache, and reloaded under the new controller.

## Deployment identity and performance

The following clean local and live SHA-256 values match:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `f62c6c961a01d17d89f28115eae06eb3894ad7bf7db8830b5064200ef7f1010e` |
| `assets/index-Olf0I6Yu.js` | `5012257040d97c44d3055a807b4187670767140a1ce28e97f0f8dd9fa087c510` |
| `assets/index-BN1C9l1y.css` | `f6eefe1f33d3bb421cc65bb26187079c6e7a1ffcccb0614befd064dbfec7c7d5` |
| `assets/hero.webp` | `b3d7303812d6a5b85ccd98d67be2e4c1f95220843963501846a385b148352bca` |
| `manifest.webmanifest` | `8f147832092ba5b9437946504fdd54d8feeab43411e8a7f6c1c0e6cd7edfb38f` |
| `404.html` | `6bcecd606a6f00a0cad66421e7cd85d63cc263d914f23f91d754353c44fe5196` |

Favicon and both manifest icons also match byte-for-byte. `sw.js` differs only
by its generated cache timestamp; normalized copies both hash to
`24e93436a29a03853cb2b09b31eac0cbf45f8b4f716226d9dec607533b661546`.

Fresh live mobile Lighthouse: **97 performance, 100 accessibility, 100 best
practices, 100 SEO**; FCP 1.0 s, LCP 1.1 s, TBT 190 ms, CLS 0, speed index
1.3 s. Lab INP was unavailable because Lighthouse does not interact with the
page; the measured TBT remains below the 200 ms responsiveness budget.

## Applicability and defect totals

This is a static PWA with no product server endpoint, unlock call, sign-in, AI
feature, package, or CLI. API rate-limit, Entra authority, backend concurrency,
health/build endpoint, and clean-consumer package checks are not applicable.

- Critical: 0
- High: 1 — unsafe numeric overflow produces a persistent false target pass
- Medium: 0
- Low: 0

**Final decision: FAIL.**

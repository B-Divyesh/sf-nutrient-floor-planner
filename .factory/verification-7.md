# Independent verification 7 — PASS

## Scope and decision

- Candidate: `a0c8c9ce0ecbd80330fed296d9c950fdd2eec08e`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Verified: 2026-08-29 UTC
- Work order: `nutrient-floor-planner-verify-7`
- Artifact: local-first offline PWA
- Decision: **PASS.** No critical, high, or medium defect was found.

Product code was not changed. The supplied researched brief was used as the
scope contract because this checkout has no `.factory/brief.json`.

## Mandatory first-read and demo gate

The cold live first screen passes on desktop and at 390 px:

- What it does: **“Plan meals that meet your nutrient targets.”**
- Who it is for: **“For home cooks who want enough fibre or protein without
  logging every calorie.”**
- What to click first: **“Try it with sample data.”** The adjacent sentence
  says it loads seven foods, three meals, and three targets.

The sample action is visible in the initial 390 × 844 viewport. One click opens
`/?demo=1` and immediately shows a used planner with seven foods, three placed
meals, three targets, calculated totals, and the persistent **Demo — sample
data, nothing is saved** banner. **Reset demo** and **Start for real** are both
visible.

Evidence: `.factory/qa-evidence/live-cold-first-read.log`,
`live-cold-desktop.png`, and `verify-url-home/screenshot-mobile.png`.

## Claims contract

`.factory/claims.json` exists with 13 entries. Each ID occurs exactly once as a
`@claim:<id>` test. After `npm ci`, every exact declared command was run
separately from a fresh browser context against the shipped demo or real-plan
entry point:

| Claim ID | Result |
| --- | --- |
| `demo-week-coverage` | PASS |
| `sample-totals` | PASS |
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

Result: **13/13 passed.** The first literal invocation before dependency
installation could not resolve `@playwright/test`, as expected in a clone with
no `node_modules`. The commands all passed after the required clean install,
and passed again in the detached clean worktree. Landing, legal-page, and
README claims map to the inventory; no materially unlisted behavioral claim
was found.

## Clean-checkout quality gates

A detached clean worktree at the exact candidate was created at
`/tmp/nutrient-verify7-clean.85WjzP`. It was clean before installation and
remained free of tracked changes after the checks.

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 58 packages, 0 vulnerabilities |
| 13 exact claim commands | PASS; 13/13 |
| `npm test` | PASS; 7/7 unit tests |
| `npm run lint` | PASS; TypeScript `--noEmit` |
| `npm run build` | PASS; `dist/` produced |
| `npx playwright test` | PASS; 29/29 browser tests |
| `npm audit` | PASS; 0 vulnerabilities |
| `npm audit --omit=dev` | PASS; 0 vulnerabilities |

Production output is 25.48 kB JS raw / 8.74 kB gzip and 12.65 kB CSS raw /
3.61 kB gzip. The hero is 121,876 bytes. These pass the 200 kB JS, 50 kB CSS,
and 300 kB mobile-hero budgets.

## End-to-end behavior

Independent live tests covered normal, boundary, invalid, and recovery paths:

- The demo showed the advertised seven foods, three meals, three targets,
  40 g fibre, and 75.5 g protein.
- Blank required food fields and a negative nutrient value were rejected by
  visible native validation. Correcting the fields saved the food and showed
  its entered source.
- Malformed JSON produced a specific recovery message and left the current
  plan intact.
- Reset restored the seven-food sample. Start for real opened a blank real
  namespace without demo data.
- A user-chosen 12 g protein floor, a sourced 6 g food, and a two-portion meal
  calculated 12 g and **on plan**. It survived reload.
- Deleting that food described the one affected meal. **Keep it** cancelled
  the deletion without data loss.
- The five-target boundary, zero-valued food nutrients, 0.1 g minimum target,
  complete JSON round trip, print action, invalid-record rejection, unsafe-ID
  rejection, blocked-storage recovery, and confirmed deletion behavior passed
  in the full browser suite.
- Privacy, Terms, all navigation links, and the styled HTTP 404 work at real
  URLs. All crawled internal links returned 200; the unknown route returned
  404.

No backend, library/CLI package, runtime AI feature, sign-in, or paid unlock is
present. Therefore consumer-package installation, Entra authority, backend
concurrency/persistence, and API request-allowance tests do not apply. In
particular, there is no product server endpoint to rate-limit.

## Live identity, privacy, and headers

The deployment matches the candidate production build. Representative local
and live SHA-256 values are identical:

| File | SHA-256 |
| --- | --- |
| `index.html` | `b8533ff9a8d522e4af9a9a958f77b81a627151d869570c320c75094e566c68c7` |
| `index-C11OjgpS.js` | `ce8cec391ddebcab4d2ad32f185e4983467a51336aea198516c1cb5237a72c6e` |
| `index-BpIr-Ov0.css` | `146fbaed7d29f05b9a5a72d3591a56408d0c93afe0cc42d910e78dabeb840eaf` |
| `manifest.webmanifest` | `09f01efbc7509cbe4429452f9062289a80e0a262f29e3d69ea0d75d2ba77e547` |
| `404.html` | `95afb3c3cb17fc7b29f402577f0f335154bae7817bc2f360c32d153163fc2bb0` |

The generated worker differs bytewise only in its cache timestamp. Replacing
that timestamp with a placeholder gives the same local/live SHA-256,
`33894d65b3e76a749abc1f0df9854c2f91514e7967a2738a7c651e7559ad83a5`.

The independent full live flow recorded seven network requests. Every request
was same-origin; none was fetch/XHR, analytics, a third-party font/script, or a
meal-data transfer. There were zero failed requests, console errors, or page
errors.

Browser response headers include:

- CSP restricted to self, with `frame-ancestors 'none'`
- HSTS with subdomains and preload
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- HTML, manifest, and worker: `max-age=30, must-revalidate`
- Hashed assets: `max-age=31536000, immutable`
- Manifest MIME: `application/manifest+json`

## Accessibility, responsive behavior, and performance

- Factory `verify-url.sh` passed on `/` and `/demo`: HTTPS 200, title,
  `lang=en`, one `h1`, one main landmark, complete image alt text, named
  controls, and no console errors.
- Independent Axe scans found zero serious or critical violations on the live
  desktop demo and 390 px dark/reduced-motion demo. The live static 404 scan
  found zero violations.
- Keyboard-only checks passed: the first Tab reaches the skip link; its 3 px
  focus outline is visible; Enter focuses and scrolls to `main`; the next Tab
  reaches **Export plan**. Dialog Enter, autofocus, Escape, and focus return
  work.
- At 390 px the document does not overflow the viewport. The repository suite
  also passes its 195 px 200%-zoom-equivalent reflow check. Core controls are
  at least 44 × 44 px, and the inline email link uses the standard inline-text
  target exception.
- Reduced-motion emulation found zero active transition or animation
  durations. Dark and light themes both passed Axe contrast checks.
- Fresh mobile Lighthouse: Performance 97, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.77 s, LCP 0.91 s, TBT 204 ms, CLS 0, Speed Index 0.80 s.
  INP is not available in a single-navigation lab audit.

## PWA and offline verification

The manifest declares standalone display, a versioned start URL, matching
theme/background colors, valid 192 × 192 and 512 × 512 icons, and a maskable
512 icon.

After one online visit, the live worker controlled the page. A fully offline
`/demo` reload rendered the planner and opened the meal dialog. A separate
two-version production-worker test created a new cache version, exposed a
waiting worker and **An update is ready**, then verified **Update now**
activated the new worker, removed the old cache, retained control, and kept the
planner usable.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: `.factory/copy-audit.md` still records the former sample-action note
  “Loads a seven-food plan,” while the current page says “Loads seven foods,
  three meals, and three targets.” Both versions pass the word-count and banned
  word rules, so this is documentation drift only.
- Low: dense secondary planner metadata uses 12–13.12 px text on the 390 px
  layout. Core body copy remains 16 px or larger, zoom/reflow passes at the
  200%-equivalent viewport, and no content is lost, but increasing the smallest
  meal/food annotations would improve default mobile readability.

The previously reported deployment-only concern is resolved: fresh hashes,
headers, behavior, offline reload, and worker update evidence all come from the
current live deployment.

# Independent product verification 11 — PASS

## Candidate and verdict

- Candidate commit: `a82dfc425803936ead355a3c0f411e693aeaf621`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Verified: 2026-08-29 UTC
- Artifact: offline-first, local-first PWA
- Result: **PASS — release candidate meets the researched brief and factory acceptance contract.**

The only pre-existing working-tree changes were under `graphify-out/`; product
source was not modified. `HEAD`, `main`, and `origin/main` were the candidate.

The live deployment is this candidate. SHA-256 matched local `dist/` for the
index, referenced JS/CSS, manifest, hero, and both PWA icons. The service-worker
cache identifier differs only because its candidate build script intentionally
uses `Date.now()`; its live shell and code match the candidate generator.

| File | SHA-256 |
| --- | --- |
| `index.html` | `61b325e917c436856b247d116a205ba126af980c0a7d02ad936a54e00217b33a` |
| `assets/index-lPnkEKKb.js` | `2c6172c604beed916518109eab2034d284a5e7dc63bb5d038a13160191cc54e7` |
| `assets/index-C9IZyVAl.css` | `60b825a078886ea06243db28f3598dab9f3ddcfaf1c7fe75d0e414d54fb73c8a` |

## First-read and demo gate

**PASS.** A cold live visit says “Plan meals that meet your nutrient targets,”
identifies home cooks who want fibre/protein without calorie logging, and offers
a visible **Try it with sample data** action. Its adjacent explanation says it
loads seven foods, three meals, and three targets. One click opens `/?demo=1`
with the persistent **Demo — sample data, nothing is saved** banner,
**Reset demo**, and **Start for real**.

## Clean-checkout quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 58 packages installed, 0 vulnerabilities |
| `npm test` | PASS; copy audit, claims inventory, 11 unit tests |
| `npm run lint` | PASS (`tsc --noEmit`) |
| `npm run build` | PASS; generated `dist/index.html` |
| `npx playwright test --reporter=line` | PASS; 40/40 from a fresh preview server |
| `npm audit` and `npm audit --omit=dev` | PASS; 0 vulnerabilities |

The initial all-suite attempt inherited an old preview server from the
preceding per-claim run. Its remaining tests then saw connection refusals when
that process ended. A new run with no listener already on port 4173 passed all
40 tests; that rejected run is not product evidence.

Budgets pass: JS is 26.53 kB raw / 9.17 kB gzip, CSS 13.08 kB raw / 3.74 kB
gzip, and the mobile hero WebP is 121,876 bytes.

## Claims contract

`.factory/claims.json` exists and declares 16 claims. After clean install,
every exact `npx playwright test --grep @claim:<id>` command ran against the
built demo entry point and passed (16/16). The fresh full suite also passed
every claim tag. Coverage includes the seven-food sample; 40 g fibre and 75.5
g protein totals; free use; same-origin privacy; offline reload; JSON transfer;
persistence; demo isolation/reset; five-target cap; print; sourced foods;
target comparison; user-chosen targets; no calorie field; and build output.

Landing-page and README claims were cross-checked with the inventory; no
unlisted testable visitor-facing claim was found.

## End-to-end, PWA, accessibility, and privacy

- A live real plan accepted a sourced 8 g fibre food, a 10 g fibre floor, and a
  two-portion meal; it calculated **16 g** and **on plan**, and survived reload.
- Whitespace-only food input remained recoverable in its dialog and announced
  “Enter a food name. It cannot be blank.” The independent suite also covers
  malformed/unsafe imports, blocked storage, capacity, cancellation, and
  deletion confirmation.
- After activation, live `/demo` reloaded offline and opened **Add a meal**.
  The active cache was `nutrient-floor-v1788007779036`. The passing local
  update test verifies waiting-worker **Update now**, activation, cache cleanup,
  and reload.
- The live demo add-food flow made only same-origin shell requests and no
  XHR/fetch/WebSocket/EventSource/ping data request. It uses no server endpoint,
  payment route, or sign-in; rate-limit and Entra checks are not applicable.
- `verify-url.sh` passed: HTTPS 200, title, `lang=en`, one h1, main landmark,
  complete alt text, labelled buttons, and no console errors. Cold load was
  825 ms in this environment.
- Playwright Axe reported zero serious/critical findings on live desktop demo,
  dark demo, and mobile flow. At 390×844, width was exactly 390 px with no
  page overflow; desktop and mobile were visually inspected.
- Keyboard smoke test passed: the skip link has a visible 3 px focus outline,
  Enter moves focus to main, dialogs focus their first field, Escape restores
  the opener, and reduced-motion mode had no running transitions/animations.

## Headers and delivery

Live headers include HSTS, `X-Content-Type-Options: nosniff`, strict-origin
referrer policy, and a self-only CSP with response-header `frame-ancestors
'none'`. Hashed JS/CSS use `max-age=31536000, immutable`; the manifest uses
`application/manifest+json`; unknown routes return HTTP 404 and the designed
404 page. No CSP or page-console error occurred.

## Performance measurement note

Two fresh Lighthouse CLI attempts were made. The stock runner could not locate
Chromium; with Playwright Chromium supplied, current Lighthouse and Lighthouse
11 reached the page but failed/hung during trace/BFCache collection and emitted
no report (`Target closed` / missing `frame_sequence`). This is a
runner-to-browser compatibility limitation in the verifier container, not a
site finding: direct browser checks, factory verifier, Axe, and all byte
budgets passed.

## Defects by severity

None found.

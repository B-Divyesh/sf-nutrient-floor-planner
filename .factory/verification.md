# Independent product verification — FAIL

## Candidate and scope

- Candidate: `b343611089fc9b4577aa1fa1c1b946d7f1b38faf`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Verified: 2026-08-28 UTC
- Artifact: offline-first PWA
- Method: clean `npm ci`, repository checks, exact `dist/` preview, fresh-browser
  local and production flows, desktop and 390 px mobile, keyboard, axe,
  Lighthouse, response/header inspection, service-worker offline reload, and
  Sociobot unlock endpoint checks.
- Product code was not modified.

## Verdict

**FAIL — do not release this candidate.** The central offline claim is false
on an actual offline reload, invalid imported data can persistently brick the
planner, and the advertised paid purchase/unlock path is both unavailable and
bypassable. Production also has serious accessibility failures and CSP console
errors that make a zero-coverage meter look full.

The live files are the candidate rather than a stale deployment. SHA-256
matched exactly for `index.html`, `index-C_AQ91-k.js`, `index-CAhViJV0.css`,
`sw.js`, the manifest, hero, icons, and social image. Representative hashes:

- `index.html`: `21b5851d220085fa90d09ced37c44917b8cbdf77582343fb820dd7047d3570db`
- JS: `c6aa32c2a30be832b1dd5b117178f5711ddcb06974e55480d3be452b01e8390f`
- CSS: `e2c081145330644efe9d26d9d57da21407117f8e442c532729c365b4c04125f8`
- `sw.js`: `06510dc26410e6d5e95fede74a294d97be922224e4a17d8b2fbaa68adea3513b`

## Mandatory first-read and demo gate

**PASS.** A cold desktop load says what it does (“Plan meals that meet your
nutrient targets”), for whom (“For home cooks…”), and what to do first (“Try it
with sample data”). The sample-data action is visible on the first screen. One
click reaches `/demo`; after its IndexedDB load settles it shows seven foods,
three meals, three targets, the persistent demo banner, **Reset demo**, and
**Start for real**.

## Claim tests

`.factory/claims.json` exists. After `npm ci`, every exact listed command was
run individually from the candidate and passed:

The mandatory first, pre-install invocation could not resolve
`@playwright/test` because a clean clone has no dependencies. The same exact
commands below were rerun immediately after the clean install; those are the
claim outcomes reported here.

| Claim | Exact command | Repository test | Independent result |
| --- | --- | --- | --- |
| Seven-food plan and three meals | `npx playwright test --grep @claim:demo-week-coverage` | PASS, 1 test | PASS |
| No meal data leaves this device | `npx playwright test --grep @claim:local-only` | PASS, 1 test | PASS; live add-food flow contacted only the product origin |
| Works offline after setup | `npx playwright test --grep @claim:offline-use` | PASS, 1 test | **FAIL**; the test never reloads while offline |

The offline claim test only sets the context offline and opens a modal in the
already loaded page. In a fresh browser, one online `/demo` visit followed by
an offline reload failed on both the production build preview and live host:
the planner heading count became 0, the body contained only “Skip to planner,”
and JS/CSS requests emitted `net::ERR_FAILED`. The service worker precaches
development paths such as `/src/main.ts` and `/@vite/client`, not the built
hashed assets. This is a release-blocking false claim.

The claim inventory is also incomplete. Testable visitor-facing statements
without their own claim entries include the $12 purchase, unlimited foods and
printing, complete JSON import/export, persistent on-device storage, and
demo/real storage isolation. The privacy page additionally says demo data is
discarded on leaving, but a food added in demo remained after **Start for
real** and re-entering demo (8 foods instead of the seeded 7).

## Build and automated checks

| Check | Result |
| --- | --- |
| `npm ci` | PASS |
| `npm test` | PASS — 3/3 unit tests |
| `npx playwright test` | PASS — 3/3 repository claim tests |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS; `dist/` produced |
| Lint | No lint script/configuration exists |
| `npm audit --omit=dev` | PASS — 0 runtime vulnerabilities |
| `npm audit` | FAIL — 3 development advisories: 1 moderate, 1 high, 1 critical |
| Factory `verify-url.sh` on `/` | PASS — HTTPS 200, title/lang/main/alt, no landing console error |

The critical development advisory is `GHSA-5xrq-8626-4rwp` in Vitest below
3.2.6. Vite also has a high-severity path disclosure advisory. These are not
shipped runtime dependencies, but the pinned local toolchain is unsafe.

## End-to-end product behavior

### What passed

- The exact production build loaded its sample correctly (7 foods, 3 meals,
  3 targets).
- **Start for real** opened an empty `real:plan`; demo and real plans occupied
  distinct IndexedDB keys (`demo:plan` and `real:plan`).
- A representative fibre floor, sourced lentil food, Wednesday meal, and one
  portion saved and survived reload. Coverage showed 16 g and 14 g short of a
  30 g floor.
- Required fields and the 0.1 g target minimum used native validation. Invalid
  JSON syntax showed a recovery message. Export downloaded valid JSON with the
  expected one food, meal, and target.
- Privacy/terms routes render, nutrition sources are visible and required, and
  the product makes no medical claim.

### Critical defects

1. **Offline reload does not work after the first visit.** Evidence and false
   claim details are above. This violates the artifact class and core contract.
2. **A superficially valid import can persistently brick the planner.** Importing
   `{"foods":[{}],"targets":[],"meals":[],"updatedAt":"x"}` passes the only
   array checks, is written to IndexedDB, and throws `Cannot read properties of
   undefined (reading 'replace')`. After reload there is no heading or recovery
   UI, only the skip-link text. Clearing browser storage is the only recovery.
3. **Paid entitlement is not enforced.** Placing any string in
   `localStorage['sb_license:nutrient-floor-planner']` made the landing page say
   “Your upgrade is active” and exposed **Print week** with zero requests to the
   verification endpoint. There is no cached-verdict timestamp or daily
   revalidation. This was reproduced with `forged-qa-token`.

### Major defects

1. **The advertised purchase is unavailable.** The live **Buy the $12 upgrade**
   endpoint returns HTTP 404 with `{"error":"enabled factory product","status":404}`.
2. **Production CSP breaks the coverage graphic and emits console errors.** The
   page uses inline `style="width:…"` for meters while the response permits only
   `style-src 'self'`. A plan at 0 of 100 g had an authored `width:0%`, but the
   blocked style produced a computed child width of 766 px inside a 766 px
   meter, visually reporting full coverage. The browser logged the CSP error.
3. **Serious accessibility failures exist in the main demo.** Axe 4.11 found
   prohibited `aria-label` attributes on all three meter `div`s and contrast
   failures for **Add food** and muted target text in light mode. Dark mode adds
   contrast failures across the landing eyebrow, captions, buttons, legal copy,
   and footer. Lighthouse accessibility on `/demo` is 91, below the required 95.
4. **Dialogs are not keyboard-safe.** After opening **Add food**, focus stayed on
   `BODY`; the next Tab moved to the background wordmark, not into the dialog;
   Escape did not close it. The dialog has no accessible name. SPA route changes
   likewise leave focus on `BODY` and provide no route-change live region.
5. **Canceling meal creation creates data.** Opening **Add a meal** then pressing
   **Close** changed the count from 1 to 2 and left a saved “New meal.”
6. **The PWA install/update implementation is incomplete.** Manifest icons claim
   192×192 and 512×512, but the PNGs are actually 192×128 and 512×341. The
   service worker immediately calls `skipWaiting`, never announces an available
   update, and never deletes old versioned caches.
7. **Destructive actions have no confirmation or undo.** Deleting a food also
   removes it from every meal immediately. This can silently alter nutrient
   totals.

### Additional defects

- The interface labels itself “3–5 custom targets” but accepted a sixth target.
- The sample calls its target “Added sugar limit” while its only `sugar` field
  sums total sugar, including blueberries and plain yogurt. The result does not
  measure the stated nutrient.
- Many mobile controls are below 44×44 px: navigation links are 17 px high,
  demo actions 30 px, toolbar actions 40 px, meal names 35 px, and delete
  controls 40×40 px. At a 200%-zoom-equivalent 195 CSS px viewport, document
  width was 285 px, forcing horizontal page scrolling.
- The universal lime focus outline has only 1.19:1 contrast against the paper
  background, below the 3:1 focus requirement.
- Unknown URLs return HTTP 200 and render the planner. The designed 404 page is
  therefore not reached by `/definitely-not-a-route`.
- Hashed JS, CSS, and image responses use only `Cache-Control: public,
  must-revalidate, max-age=30`, not long-lived immutable caching.
- `manifest.webmanifest` is served as `application/octet-stream`. Chrome parsed
  it in this run, but it is not the appropriate manifest MIME type.
- The social image is 945×630 rather than the required 1200×630, and Twitter
  title/description/image metadata are absent.

## Privacy, network, and endpoint policy

- PASS: a fresh live demo plus adding a food made only same-origin requests;
  no analytics, third-party fonts, scripts, or nutrition uploads were observed.
- PASS: HSTS, `X-Content-Type-Options`, `Referrer-Policy`, and CSP headers are
  present. The CSP mismatch described above is a functional failure.
- PASS: the product requires no sign-in, so Entra tenant verification is not
  applicable.
- PASS: rate limiting exists on the Sociobot verify endpoint. In one concurrent
  burst of 120 invalid-license GETs, 30 returned 200 and the remaining 90
  returned 429. The first 429 included `Retry-After: 4`.

## Responsive, motion, and performance evidence

- Desktop and 390×844 mobile were visually inspected. The core layout remains
  present with no page-level horizontal overflow at normal mobile scale.
- Reduced-motion emulation matched the media query and found zero active
  animations or non-zero transition/animation durations.
- Lighthouse mobile landing: performance 98, accessibility 100, best practices
  100, SEO 100; LCP 1.202 s, TBT 169 ms, CLS 0. INP is unavailable in a lab
  navigation. The demo accessibility score is separately 91.
- Build sizes: JS 20.04 KB raw / 7.36 KB gzip; CSS 10.65 KB raw / 3.22 KB gzip;
  hero WebP 121,876 bytes. These pass the asset budgets.

## Required release work

Fix the three critical issues first, then make the claim tests prove a true
fresh offline reload and the paid/demo boundaries. Resolve all axe
serious/critical findings, CSP errors, keyboard dialog/focus behavior, icon
dimensions, checkout registration, and the remaining major defects. Re-run
this full verification on the repaired commit and deployment.

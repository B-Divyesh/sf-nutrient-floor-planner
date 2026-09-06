# Plan meals around nutrient targets — verification 16

**Final verdict: PASS.** The deployed implementation has zero findings of every severity and zero untested public claims.

## Candidate and scope

- Work order: `nutrient-floor-planner-verify-16`
- Implementation reviewed: `fad08d2adaa0689044d633854d0926188e798fff`
- Documentation reviewed: `4c4274ad51cc6ff424b98e0947026e7565bd56c0`
- Current repository wrapper: `0ec5cab772e313195ce96cee369e06f082193ddf`
- Deployed static release: `da6cf500-9e54-427e-a6a8-dc1f978c3086`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Verified: 2026-09-06 UTC
- Product code was not changed.

The wrapper commit changes only pre-existing Graphify output. The live product files match a clean build of the implementation commit byte for byte. The generated service worker also matches after normalizing its build-time cache number.

## First screen and sample

The job is to plan meals against personally chosen nutrient floors and limits. The audience is home cooks who want enough fibre or protein without a calorie diary. Fresh 1440 × 900 desktop and 390 × 844 phone contexts state both points before scrolling. The first action is **Try it with sample data**, followed by **Loads seven foods, three meals, and three targets**. The three facts about the free limit and price, device storage, and offline use also fit in the phone viewport.

One click opened a populated sample with seven foods, three placed meals, and three targets. Fibre showed 40 g against a 30 g floor. Protein showed 75.5 g against a 75 g floor. Total sugar showed 35.1 g against a 36 g limit as **within limit**, including in the accessible meter name.

The persistent label said **Demo — sample data, nothing is saved**. In a fresh browser context, I first saved a real-plan food, then added an eighth demo-only food. **Reset demo** restored the seven-food sample. **Start for real** restored the separate real-plan food and did not carry over the demo-only food. This used an isolated verifier profile and did not read or alter an existing person's data.

## Declared claims

After `npm ci`, every exact command in `.factory/claims.json` was run separately from the detached checkout `/tmp/nfp-verify16-clean`:

| Claim | Result |
| --- | --- |
| `demo-week-coverage` | PASS |
| `sample-totals` | PASS |
| `sample-floor-status` | PASS |
| `one-time-upgrade` | PASS |
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

The inventory guard confirms exactly one tagged browser test for each of the 17 claims. A separate 30-run repetition of `local-only` passed 30/30, confirming the F-8-1 request/outcome wait is stable. A cross-check of the landing page, planner, Privacy, Terms, README, demo instructions, manifest description, and catalog copy found no missing, false, incomplete, or unlisted public claim. Untested claim count: **0**.

## Clean-checkout quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 58 packages, 0 vulnerabilities |
| 17 exact claim commands | PASS — 17/17 |
| `npm test` | PASS — copy audit, claim guard, 14/14 unit tests |
| `npm run lint` | PASS |
| `npm run build` | PASS — produced `dist/index.html` |
| `npx playwright test --reporter=line` | PASS — 45/45 browser tests |
| `npm audit` | PASS — 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |

The build contains 34.09 kB JavaScript raw / 11.55 kB gzip and 14.53 kB CSS raw / 3.99 kB gzip. The hero is 121,876 bytes, and no webfont is shipped. These pass the static PWA budgets.

## Normal, invalid, boundary, and recovery paths

The complete browser run proved the normal target → food → meal workflow, editing and reload persistence, complete JSON export/import, printing, demo reset and disposal, and the 10-food and five-target limits. It also proved exact decimal floor/limit boundaries and the visible short, on-plan, within-limit, and over-limit states.

Invalid and recovery coverage passed for malformed plans, unsafe imported IDs, whitespace-only required fields, out-of-range nutrients and portions, derived-total overflow, blocked browser storage, forged and revoked licenses, a pending license request, cancellation, Escape, and confirmed destructive actions. Existing saved records remain intact after rejected input.

## Live accessibility, privacy, PWA, and routes

- The factory URL check passed `/`, `/demo`, `/plan`, `/privacy`, and `/terms`: HTTP 200, route-specific titles, `lang=en`, one h1, one main landmark, complete image alt text, labelled buttons, and no console or page errors.
- Fresh live Axe scans reported zero serious or critical violations on `/`, `/demo`, `/plan`, `/privacy`, `/terms`, and `/404.html`. The full suite also passed light and dark themes.
- On the live phone UI, the first Tab exposed the skip link with a 3 px solid focus outline; Enter focused `main`. Dialog autofocus, Escape return focus, SPA route focus, and the polite route announcement all passed.
- Reduced-motion mode produced no non-zero animation or transition duration. The 390 px layout did not overflow. The 195 px 200%-zoom equivalent 404 had a 195 px document width.
- After online service-worker setup, a fresh live demo reloaded offline and still opened **Add a meal**. The two-version local production test showed an update prompt, changed controller, removed the old cache, and kept the planner usable.
- A live demo edit produced no foreign or data-transfer requests. A separate live license restore sent one GET to the documented Sociobot verification endpoint, with only the license query parameter and no request body, and displayed the inactive-license result.
- All rendered internal links returned 200. The email link remained `mailto:`. The purchase link alone returned the stipulated registration 404. An unknown product URL returned a designed HTTP 404 with **Page not found** and recovery links.
- Live headers include HSTS, `nosniff`, a strict-origin referrer policy, and a CSP limited to self resources plus the Sociobot license endpoint. Hashed assets use one-year immutable caching; HTML, the manifest, and worker revalidate in 30 seconds.

Fresh mobile Lighthouse scores were Performance **100**, Accessibility **100**, Best Practices **100**, and SEO **100**. FCP was 0.99 s, LCP 1.03 s, TBT 82.5 ms, and CLS 0.

The blueprint drafting-sheet identity matches `.factory/design.md`. The generated food-and-grid hero was visually inspected: it has no readable text, logo, watermark, or misleading product output. The design file records its prompt, generation source, date, palette, type, spacing, and motion policy.

## Earlier finding disposition

Every earlier review and verification report was inspected, including minor observations:

| Earlier finding group | Current proof | Disposition |
| --- | --- | --- |
| Initial offline reload, bad precache, and incomplete update flow | Isolated offline claim, live offline dialog, and two-version cache test pass. | Fixed |
| Invalid import crash, unsafe IDs, whitespace data loss, numeric overflow, and decimal mismatch | Import, whitespace, range, derived-total, unsafe-ID, and precision regressions pass. | Fixed |
| Forgeable paid entitlement and absent purchase/restore behavior | Paid claim requires a verified or fresh cached verdict and covers return, restore, revocation, capacity, and printing. | Fixed |
| F-1-1 dead checkout | Product link is correct; its external offer remains deliberately unregistered and returns the stipulated 404. | Expected external condition |
| CSP-broken meters and console errors | Semantic meters use no blocked inline width; live valid routes have no errors. | Fixed |
| Empty/light/dark contrast, meter ARIA, label-name mismatch, focus contrast, small targets, and small phone annotations | Current full Axe, experimental rule, 44 px targets, 14 px annotations, and live focus checks pass. | Fixed |
| Dialog naming/focus, route focus/live announcement, skip link, cancellation, and destructive actions | Browser regressions and fresh live keyboard checks pass. | Fixed |
| Wrong icon dimensions, oversized worker cache, stale-cache recreation, caching, and manifest MIME | Manifest, asset, budget, cache-header, offline, and update checks pass. | Fixed |
| Target capacity, sugar naming, missing metadata/social card, missing real 404, and narrow overflow | Five-target test, total-sugar wording, route metadata, 1200 × 630 social asset, live HTTP 404, and 195 px reflow pass. | Fixed |
| F-1-4/F-2-1/F-3-1/F-4-1 and verification claim gaps | Inventory and copy guards pass; all 17 listed commands pass with no unlisted claim. | Fixed |
| F-1-5/F-1-6/F-2-2/F-2-3/F-2-4/F-3-2 and later copy/readability notes | Current direct copy, removed drag/caption claims, synced audit, mobile layout, and catalog checks pass. | Fixed |
| F-5-1 through F-5-4: incomplete state, JSON, persistence, and editing proof | Dedicated outcome tests cover all states, deep JSON equality, full-plan reload, and edits. | Fixed |
| F-7-1 within-limit state | Live sample and tagged claim visibly and accessibly say **within limit**. | Fixed |
| F-7-2 paid scope | The $12 one-time scope and license path are present and tested; offer registration remains external. | Fixed in product |
| F-7-3 narrow 404 | Fresh live document width equals the 195 px viewport. | Fixed |
| F-8-1 asynchronous privacy-test race | Exact claim, full suite, and 30/30 repetition pass after waiting for the request and visible result. | Fixed |

No normal product finding remains. The Sociobot checkout endpoint returns the work-order-specified 404 because the external offer is not registered. This is a deliberate external state, not a broken product page. Once registration occurs, the billing operator should complete one real hosted purchase.

This is a static local-first PWA. It has no product backend, tenant, server-side state, account, CLI, library, or desktop package, so backend isolation, restart persistence, health, 429/Retry-After, and clean-consumer artifact checks do not apply. No runtime AI step is appropriate for deterministic nutrient arithmetic; adding one would weaken the local-only design.

## Evidence

- `/work/.evidence/verify16/claim-commands.log`
- `/work/.evidence/verify16/playwright-full.log`
- `/work/.evidence/verify16/local-only-repeat30.log`
- `/work/.evidence/verify16/live-qa.json`
- `/work/.evidence/verify16/live-links-and-license.log`
- `/work/.evidence/verify16/live-focus.log`
- `/work/.evidence/verify16/live-privacy.log`
- `/work/.evidence/verify16/lighthouse-live.json`
- `/work/.evidence/verify16/runtime-all-hashes.log`
- `/work/.evidence/verify16/route-status.log`

Finding count: **0**. Untested claim count: **0**.

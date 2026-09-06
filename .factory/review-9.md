# Plan meals around nutrient targets — review 9

**Final verdict: PASS.** The deployed implementation has zero findings of
every severity and zero untested public claims.

## Candidate and scope

- Work order: `nutrient-floor-planner-review-9`
- Implementation reviewed: `fad08d2adaa0689044d633854d0926188e798fff`
- Documentation and QA state reviewed: `81ed8dc1ae6f99eaae1443ea1c295d7234330314`
- Current repository wrapper: `a725ea76bbb917df5f5bf949a7351cce59ae5f1a`
- Deployed static release recorded by verification 16: `da6cf500-9e54-427e-a6a8-dc1f978c3086`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Reviewed: 2026-09-06 UTC
- Product code was not changed.

The current wrapper changes only pre-existing Graphify output. A clean build
of the implementation commit matches every public live file byte for byte.
The generated service worker also matches after normalizing its build-time
cache number.

The full repository QA report `.factory/verification-16.md` was read before
the review. All earlier review and verification reports were also inspected,
including their low-severity findings and observations.

## First screen and sample

The job is to plan meals against personally chosen nutrient floors and limits.
The audience is home cooks who want enough fibre or protein without a calorie
diary. Fresh 1440 × 900 desktop and 390 × 844 phone contexts state both facts
before scrolling. The first action is **Try it with sample data**. Its adjacent
text says **Loads seven foods, three meals, and three targets**. The free limit
and $12 price, device storage, and offline use also fit in the phone viewport.

One click opened seven foods, three placed meals, and three targets. Fibre was
40 g against a 30 g floor. Protein was 75.5 g against a 75 g floor. Total sugar
was 35.1 g against a 36 g limit and said **within limit**, including in the
meter's accessible name.

The persistent label said **Demo — sample data, nothing is saved**. In a fresh
phone context, a separately saved real-plan food survived entering the demo,
adding an eighth demo-only food, and resetting the sample. **Reset demo**
restored seven sample foods. **Start for real** restored the real food and did
not carry over the demo-only food. The isolated review profile did not read or
change another person's data.

## Declared claims

After `npm ci`, every exact command in `.factory/claims.json` ran separately
from the detached checkout `/tmp/nfp-review9-clean.XLWIaR`.

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

The inventory guard found exactly one tagged browser test for each claim. A
separate 30-run repetition of `local-only` passed 30/30, confirming the former
request-wait race is fixed. Landing, planner, Privacy, Terms, README, demo
instructions, manifest, and catalog copy were cross-checked. No missing,
false, incomplete, or unlisted public claim was found. Untested claim count:
**0**.

## Clean-checkout quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 58 packages, 0 vulnerabilities |
| 17 exact claim commands | PASS — 17/17 |
| `npm test` | PASS — copy audit, claim guard, 14/14 unit tests |
| `npm run lint` | PASS |
| `npm run build` | PASS — produced `dist/index.html` |
| `npx playwright test --reporter=line` | PASS — 45/45 browser tests |
| `local-only` repeated 30 times | PASS — 30/30 |
| `npm audit` | PASS — 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |

The build contains 34.09 kB JavaScript raw / 11.55 kB gzip and 14.53 kB CSS
raw / 3.99 kB gzip. The hero is 121,876 bytes, and no webfont ships. These are
within the static PWA budgets.

## Product paths and recovery

The browser suite proved the normal target → food → meal flow, correction and
reload persistence, complete JSON export/reimport, printing, demo reset and
disposal, the 10-food boundary, and the five-target boundary. It also proved
exact decimal thresholds and the visible and accessible short, on-plan,
within-limit, and over-limit states.

Invalid and recovery checks passed for malformed plans, unsafe imported IDs,
whitespace-only required fields, out-of-range nutrients and portions, derived
total overflow, blocked storage, forged and revoked licenses, pending license
checks, cancellation, Escape, and confirmed destructive actions. Rejected
input left existing saved records intact.

## Live accessibility, privacy, PWA, and routes

- The factory URL check passed `/`, `/demo`, `/plan`, `/privacy`, and `/terms`.
  Each returned 200 with a specific title, `lang=en`, one h1, one main
  landmark, complete alt text, labelled buttons, and no console or page error.
- Fresh live Axe scans had zero serious or critical violations on `/`,
  `/demo`, `/plan`, `/privacy`, `/terms`, and `/404.html`. Fresh dark-theme
  scans also passed all five normal routes.
- On the live phone UI, the first Tab exposed the skip link and Enter focused
  `main`. Dialog autofocus, Escape return focus, SPA route focus, and the
  polite route announcement passed.
- Reduced motion produced no non-zero animation or transition duration. The
  390 px pages did not overflow. The 195 px 200%-zoom-equivalent 404 had a
  195 px document width.
- After online worker setup, a fresh live demo reloaded offline and still
  opened **Add a meal**. The clean two-version test showed the update prompt,
  changed controller, removed the old cache, and kept the planner usable.
- A live demo edit made no request after load and no foreign or data-transfer
  request. A separate live restore made one GET to the documented Sociobot
  verification endpoint, with only the license query parameter and no body,
  then displayed the inactive result.
- Every rendered internal link returned 200. The email remained `mailto:`.
  The purchase link alone returned the work-order-stipulated registration 404.
  An unknown product URL returned a designed HTTP 404 headed **Page not found**
  with recovery and legal links.
- Live headers include HSTS, `nosniff`, a strict-origin referrer policy, and a
  CSP limited to self resources plus the Sociobot license endpoint. Hashed
  assets use one-year immutable caching; HTML, manifest, and worker revalidate
  in 30 seconds.

Fresh mobile Lighthouse scored Performance **100**, Accessibility **100**,
Best Practices **100**, and SEO **100**. FCP was 1.02 s, LCP 1.62 s, TBT 50 ms,
and CLS 0.

The blueprint drafting-sheet identity matches `.factory/design.md`. Visual
inspection found no readable text, brand, watermark, or misleading output in
the generated food-and-grid hero. The design file records its prompt, source,
date, palette, type, spacing, and motion policy.

## Earlier finding disposition

| Earlier finding group | Current proof | Disposition |
| --- | --- | --- |
| Unlisted claims, capacity claims, incomplete claim scope, and stale copy audit | The one-to-one inventory and copy guards pass; all 17 commands pass and the public-copy cross-check found no gap. | Fixed |
| Demo data surviving exit or touching real data | Reload, hard navigation, tab closure, reset, and fresh live real-plan separation pass. | Fixed |
| Invalid import crash, unsafe IDs, whitespace data loss, blocked storage, and numeric overflow | Malformed, unsafe-ID, required-field, storage-denial, range, and derived-total regressions pass without replacing saved data. | Fixed |
| Decimal mismatch and missing within-limit state | Exact threshold tests and all four target states pass; the live sugar limit says **within limit**. | Fixed |
| Missing edits, incomplete JSON proof, and incomplete persistence proof | Food and target correction, deep JSON equality, and full food/target/meal reload checks pass. | Fixed |
| Dead or forgeable paid path and missing one-time scope | Paid access requires verification or a fresh valid cached verdict; return, restore, revocation, free capacity, and printing are tested. | Fixed in product |
| External checkout registration | The product link is correct; the separate offer remains deliberately unregistered and returns the stipulated 404. | Expected external condition |
| Empty/light/dark contrast, label-name mismatch, meter names, focus contrast, and small targets | Live light/dark Axe, experimental-name, 44 px target, and focus checks pass. | Fixed |
| Dialog naming/focus, skip link, route focus/announcement, cancellation, and destructive actions | Browser regressions and fresh live keyboard checks pass. | Fixed |
| Oversized precache, wrong icons, offline reload, stale-cache recreation, manifest MIME, and caching | Asset, manifest, offline, header, and two-version update checks pass. | Fixed |
| Route metadata, social assets, CSP meters, total-sugar wording, and missing or narrow 404 | Specific metadata, 1200 × 630 social art, semantic meters, live 404, and 195 px reflow pass. | Fixed |
| Indirect copy, unsupported drag wording, decorative caption, and small mobile annotations | Copy guard passes; direct labels remain; there is no drag claim or caption; annotations are at least 14 px. | Fixed |
| F-8-1 asynchronous privacy-test race | Exact claim, fresh full suite, and a separate 30/30 repetition pass after waiting for the request and visible result. | Fixed |
| Earlier deployment-only mismatches or failed wrappers | All public live files match the clean implementation build; later commits contain reports or Graphify output only. | Resolved |

No normal product finding remains. The Sociobot checkout endpoint returns the
specified HTTP 404 because the external offer is not registered. This is a
deliberate external state, not a broken product page. After registration, the
billing operator should complete one real hosted purchase.

This is a static local-first PWA. It has no product backend, tenant, server-side
state, account, CLI, library, or desktop package. Backend isolation, restart
persistence, health, 429/Retry-After, and clean-consumer artifact checks do not
apply. A runtime model step is not useful for deterministic nutrient arithmetic
and would weaken the local-only design; JSON transfer and printing cover the
obvious handoff needs.

## Evidence

- `/work/.evidence/review9/claim-commands.log`
- `/work/.evidence/review9/playwright-full.log`
- `/work/.evidence/review9/local-only-repeat30.log`
- `/work/.evidence/review9/live-qa.json`
- `/work/.evidence/review9/live-privacy-links.json`
- `/work/.evidence/review9/live-axe-dark.json`
- `/work/.evidence/review9/lighthouse-live.json`
- `/work/.evidence/review9/runtime-parity.log`
- `/work/.evidence/review9/verify-home/verify.json`
- `/work/.evidence/review9/verify-demo/verify.json`
- `/work/.evidence/review9/verify-plan/verify.json`
- `/work/.evidence/review9/verify-privacy/verify.json`
- `/work/.evidence/review9/verify-terms/verify.json`

Finding count: **0**. Untested claim count: **0**.

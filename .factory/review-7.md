# Plan meals against nutrient targets — review 7 — FAIL

Reviewed 2026-09-06 UTC at <https://nutrient-floor-planner.sociobot.in>.
Product code was not changed.

## Verdict

**FAIL.** Three findings remain: two medium and one low. One declared public
claim is false and incompletely tested. The researched one-time purchase scope
is still absent. The designed 404 still overflows at a 200% zoom-equivalent
width. There is one untested claim component.

- Finding count: **3**
- Untested claim count: **1**
- Critical: 0
- High: 0
- Medium: 2
- Low: 1

## Candidate and live version

- Implementation reviewed: `d461e3774ef56b37ca7536658b4dc368d5e9b7dc`
- Documentation checkout: `47d41a8c56f909c408fe70cc61a6efc57c17b233`
- Latest substantive report commit before this review: `d5b87f09b382deca6a931aeef9995b1a37a480ca`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Artifact: static, local-first PWA; there is no product backend, account,
  runtime AI feature, CLI, library, or desktop package.

Commits after `d461e37` change only reports or Graphify output. A clean build
from the documentation checkout therefore represents the last implementation.
Live HTML, JavaScript, CSS, hero, manifest, 404, favicon, and both icons match
that build byte for byte. The service worker matches after its generated cache
timestamp is normalized.

## First screen before scrolling

Fresh 390 × 844 phone and 1440 × 900 desktop contexts answered the required
questions before any scroll:

| Question | Live answer |
| --- | --- |
| Job | “Plan meals that meet your nutrient targets.” |
| Audience | “For home cooks who want enough fibre or protein without logging every calorie.” |
| First action | “Try it with sample data” |
| What the action does | “Loads seven foods, three meals, and three targets.” |

The action and the three facts — free, stored on this device, and offline after
setup — were inside both first viewports. The action was 44 px high. Neither
landing page overflowed horizontally. The words are direct and the page title
names the job.

## Findings

### F-7-1 — Medium — the promised “within-limit” state does not exist

`.factory/claims.json` and the README promise that target comparison includes
**short, on-plan, within-limit, and over-limit** states. The live sample has a
35.1 g total against a 36 g sugar limit, but it displays:

> Total sugar limit | limit · 36 g | 35.1 g | on plan

The designated `@claim:target-comparison` test also expects **on plan** for the
passing maximum-limit case. It never asserts **within limit**, despite using
that phrase in the test title. The exact claim command passes, but the promised
observable state is absent and untested.

This reopens the unresolved part of review finding F-5-1. Either show and test
**within limit** for a passing maximum target, or remove that phrase from every
public claim and the test title.

### F-7-2 — Medium — the researched one-time purchase remains absent

The supplied brief specifies one-time monetization. The live product instead
states **Free to use**, and source contains no buy link, license capture,
verification, or restore path. A fresh request to the required Sociobot product
checkout returned HTTP 404 with the documented “enabled factory product” error.

Removing the earlier broken checkout was safer than exposing a dead or
forgeable purchase. The free planner works, but the brief deviation remains.
Factory product registration is required before the paid-unlock contract can
be implemented. This is the same open scope finding recorded in verifications
9, 10, and 14. Under this work order's zero-finding rule it prevents PASS.

### F-7-3 — Low — the 404 needs horizontal scrolling at 200% zoom

The deliberate unknown URL correctly returns HTTP 404 and a designed recovery
page. It is not a defect merely because it returns 404. At 390 CSS px its
document width is 390 px. At a 195 px, 200%-zoom-equivalent viewport, its
document width is 213 px, requiring 18 px of horizontal movement.

The app, legal pages, and demo fit at 195 px. This is the same low finding from
verification 14 and remains open.

## Demo and real-data isolation

One click from the live phone landing page opened the populated planner with
seven named foods, three placed meals, three targets, calculated totals, and
the persistent **Demo — sample data, nothing is saved** label. Adding a sample
food changed the count to eight while the label remained visible. **Reset
demo** restored seven. **Start for real** opened an empty `/plan` with no sample
foods, targets, meals, or banner.

All checks used new browser contexts. Demo changes stayed in memory. The real
plan test used only the disposable context's IndexedDB and was destroyed when
the context closed. No existing user data or external product state changed.

## Normal, invalid, boundary, and recovery paths

- A 30 g fibre floor, a sourced 12 g food, and a 2.5-portion meal produced
  exactly 30 g and **on plan**. Food, target, portion, and meal survived reload.
- A whitespace-only target name kept its dialog open, focused and marked the
  field invalid, and announced what to correct.
- The earlier `1e308` nutrient regression is fixed. The field reports range
  overflow, announces the 100,000 g maximum, and saves no unsafe food.
- Malformed JSON showed the recovery message and preserved the existing plan.
- The complete suite also covered exact decimal thresholds, all whitespace
  fields, unsafe imported IDs, unsafe calculated totals, blocked storage,
  edit persistence, cancellation, confirmation, printing, and JSON transfer.

## Claims and clean-checkout checks

Detached checkout: `/tmp/nutrient-floor-review7.YykKHo` at `47d41a8`.
`npm ci` installed the documented prerequisites with zero vulnerabilities.
Every exact command from `.factory/claims.json` was then run separately.

| Claim result | Count |
| --- | ---: |
| Exact commands that exited successfully | 17 |
| Fully proved claims | 16 |
| False or incompletely tested claims | 1 |

`target-comparison` is the one incomplete claim for the reason in F-7-1. No
other unlisted landing, README, legal, or demo promise was found.

The same clean checkout passed:

| Check | Result |
| --- | --- |
| `npm test` | PASS — copy guard, claim inventory guard, 14/14 unit tests |
| `npm run lint` | PASS — TypeScript check |
| `npm run build` | PASS — `dist/index.html` produced |
| `npm audit` | PASS — 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npx playwright test --reporter=line` | PASS — 44/44 browser tests |

The build emits 30.00 kB JavaScript (10.18 kB gzip), 13.76 kB CSS (3.85 kB
gzip), no webfonts, and a 121,876-byte hero image. These are within the product
budgets.

## Accessibility, routes, privacy, and offline use

- Factory URL verification passed `/`, `/demo`, `/plan`, `/privacy`, and
  `/terms`: correct titles, `lang=en`, one h1, one main, image alt text, labels,
  and no console or page errors.
- Fresh Playwright Axe scans found zero serious or critical issues on all five
  routes and the dark demo. The HTTP 404 also had none.
- Keyboard use passed: the first Tab exposed the skip link; Enter focused main;
  the next Tab reached **Export plan**. Dialog focus and Escape return passed.
- Focus used a 3 px outline and 5 px contrasting halo. Reduced-motion mode had
  no active animation or transition durations.
- Every crawled HTTP link returned 200. The contact `mailto:` link is the only
  non-HTTP destination. Titles are route-specific. Privacy and Terms have the
  shared header and footer.
- Valid live flows made only same-origin requests. There were no analytics,
  fetch/XHR, websocket, EventSource, ping, foreign request, or normal-route
  console error. The browser's expected resource message for the deliberate
  404 is not classified as a product error.
- The service worker controlled `/demo`; its update check completed. Offline
  reload retained seven foods and the meal dialog remained operable. The full
  suite passed the waiting-worker update and old-cache replacement test.
- Live headers include a self-only CSP, HSTS, `nosniff`, and strict-origin
  referrer policy. Hashed assets are immutable for one year. HTML, manifest,
  and worker use 30-second revalidation. The manifest MIME is correct.
- Fresh mobile Lighthouse: performance 100, accessibility 100, best practices
  100, SEO 100; FCP 0.90 s, LCP 0.91 s, TBT 0 ms, CLS 0.

No backend health, restart persistence, tenant isolation, or 429 allowance
check applies. The product has no product backend or active billing request.
No installed consumer artifact applies.

## Earlier review finding disposition

| Earlier finding | Current evidence | Status |
| --- | --- | --- |
| F-1-1 dead checkout | Dead link removed; paid scope is separately open as F-7-2. | Partly fixed |
| F-1-2 forged local entitlement | No entitlement path remains; legacy tokens do not gate food capacity. | Fixed |
| F-1-3 incomplete 404 | Real HTTP 404, full shell, legal links, titles, and recovery actions exist; 195 px overflow remains as F-7-3. | Partly fixed |
| F-1-4 and review-2 continuation, incomplete claims/demo disposal | Demo reset, reload, exits, tab closure, no-calorie path, and offline reload are tested. | Fixed |
| F-1-5 and F-1-6, indirect headings and README wording | Current headings and README are direct; copy guard passes. | Fixed |
| F-2-1 stale copy audit | Audit matches current copy and the drift guard passes. | Fixed |
| F-2-2 indirect labels | Current labels and headings name the task. | Fixed |
| F-2-3 unsupported dragging | No drag claim or draggable meal card remains; editing is explicit. | Fixed |
| F-2-4 12 px mobile notes | Essential mobile annotations are at least 14 px. | Fixed |
| F-3-1 unlisted build output | `build-output` exists and passes. | Fixed |
| F-3-2 decorative hero caption | Caption removed; useful image alt remains. | Fixed |
| F-4-1 unlisted sample states | Sample floors, totals, pass classes, text, and meter names are tested. | Fixed |
| F-5-1 incomplete floor/limit state proof | Short, on-plan, and over-limit are proved; promised within-limit is absent. | **Open as F-7-1** |
| F-5-2 incomplete JSON proof | Demo export and real-plan reimport are deep-compared. | Fixed |
| F-5-3 incomplete persistence proof | Food, target, meal, portion, source, and values survive reload. | Fixed |
| F-5-4 records could not be corrected | Food and target editing preserve links, recalculate, return focus, and persist. | Fixed |

## Earlier verification finding disposition

| Earlier finding group | Current evidence | Status |
| --- | --- | --- |
| Initial offline reload and bad precache | Live offline reload works; optimized shell is cached. | Fixed |
| Invalid import could brick the planner | Invalid structure, unsafe IDs, unsafe totals, and malformed JSON are rejected. | Fixed |
| Forged unlock, dead purchase, absent purchase | Forged unlock and dead link are gone; researched paid scope remains absent. | **Open as F-7-2** |
| CSP broke meters and logged errors | Semantic meters use no blocked inline widths; normal routes have no CSP errors. | Fixed |
| Light/dark contrast and empty-planner Axe failures | Current light, dark, empty, demo, legal, and 404 scans have no serious/critical issue. | Fixed |
| Dialog focus, route focus, and label/name mismatch | Autofocus, Escape return, route focus/live region, and wordmark tests pass. | Fixed |
| Closing a new meal created data | Cancellation test passes and creates no meal. | Fixed |
| Wrong icon sizes and incomplete update path | Icons are 192×192 and 512×512; update and old-cache replacement tests pass. | Fixed |
| Destructive actions lacked confirmation | Food, target, and meal deletion use specific confirmation. | Fixed |
| Food/target capacity claims were missing or wrong | Free use beyond eleven foods and the five-target boundary have tagged tests. | Fixed |
| “Added sugar” mislabeled total sugar | Current target says **Total sugar limit**. | Fixed |
| Small touch targets, weak focus, and 200% overflow | 44 px targets and focus pass; normal routes fit 195 px; the 404 does not. | **Open as F-7-3** |
| Unknown routes returned 200 or had metaphor copy | Unknown paths return a plain **Page not found** HTTP 404 with recovery links. | Fixed |
| Cache headers, manifest MIME, social art, and route metadata | Headers, 1200×630 art, route titles/canonicals, sitemap, and MIME are correct. | Fixed |
| Demo data survived ordinary exit | Demo is in memory and resets on reload, navigation, and tab closure. | Fixed |
| Unsafe IDs injected markup | IDs are validated; injection regression test passes. | Fixed |
| Storage failure had no recovery message | Blocked-storage test keeps the dialog open and explains recovery. | Fixed |
| Skip link did not skip | Live keyboard path focuses main and bypasses the header. | Fixed |
| Decimal display contradicted comparison | 0.125 and 0.075 boundary tests use one precision policy. | Fixed |
| Worker update could recreate the old cache | Two-version test leaves only the new cache. | Fixed |
| Whitespace input erased the plan | All required text fields reject whitespace without changing saved data. | Fixed |
| Privacy email had a 20 px touch area | It now measures at least 44 px and has a regression test. | Fixed |
| First screen omitted a price/free fact | **Free to use** is visible before scrolling. | Fixed |
| `1e308` caused `Infinity` and a false pass | Live range recovery and automated unsafe-total tests pass. | Fixed |

## Missed leverage

No AI step is appropriate for deterministic nutrient arithmetic, and sending
meal details to a model would weaken the local-only design. JSON transfer and
printing cover the useful import/export and handoff paths. No missing sync
feature is implied by the brief.

## Evidence

- `/work/.evidence/review-7/live-review.json`
- `/work/.evidence/review-7/live-cold-phone.png`
- `/work/.evidence/review-7/live-cold-desktop.png`
- `/work/.evidence/review-7/live-demo-phone.png`
- `/work/.evidence/review-7/live-404-phone.png`
- `/work/.evidence/review-7/lighthouse-live.json`
- `/work/.evidence/review-7/verify-home/verify.json`
- `/work/.evidence/review-7/verify-demo/verify.json`
- `/work/.evidence/review-7/verify-plan/verify.json`
- `/work/.evidence/review-7/verify-privacy/verify.json`
- `/work/.evidence/review-7/verify-terms/verify.json`

**Final verdict: FAIL.**

# Plan meals around nutrient targets — verification 15

**Final verdict: PASS.** There are zero findings and zero untested public claims for the deployed implementation.

## Candidate and scope

- Work order: `nutrient-floor-planner-verify-15`
- Implementation reviewed: `75f1273057f842e046c59366a28151cb7f71a7c8`
- Documentation handoff: `b0b3278e483dc70193affd0b826be6e8e62e9582`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Verified: 2026-09-06 UTC
- Product code was not changed.

The job is to plan meals against personal nutrient floors and limits. It is for home cooks who want enough fibre or protein without logging every calorie. On a fresh desktop and 390 px phone load, before scrolling, the page says this, names that audience, and offers **Try it with sample data**. The adjacent text says it loads seven foods, three meals, and three targets. The three visible facts state the 10-food free limit and $12 one-time price, local storage, and offline use.

## Demo, plan, and isolation

One click opened the populated sample in a fresh phone context: seven foods, three placed meals, and three targets. The persistent label read **Demo — sample data, nothing is saved**. Its total-sugar target showed **35.1 g** against a **36 g** limit as **within limit**, including in the meter label.

Adding an eighth sample food changed only the demo. **Reset demo** restored the seven-food sample. **Start for real** then showed the independently saved real food and never showed the demo-only food. This proves reset and sandbox separation without changing existing user data.

Normal, invalid, boundary, and recovery paths are covered by the full browser suite: exact threshold comparison; short, on-plan, within-limit, and over-limit states; whitespace validation; finite numeric limits; malformed imports; safe IDs and totals; blocked storage; edit persistence; cancellation; confirmed deletion; target and food capacity; JSON transfer; printing; and purchase restore/forged-token handling.

## Claims and clean checkout

Detached clean checkout: `/tmp/nfp-verify15-clean` at the implementation SHA. `npm ci` installed 58 packages with zero vulnerabilities. Every exact command listed in `.factory/claims.json` was run separately after the documented install. All 17 passed:

| Claim IDs | Result |
| --- | --- |
| demo-week-coverage, sample-totals, sample-floor-status | PASS |
| one-time-upgrade, local-only, offline-use | PASS |
| json-transfer, local-persistence, demo-isolation, demo-reset | PASS |
| target-cap, print-week, food-source, target-comparison | PASS |
| user-chosen-targets, no-calorie-input, build-output | PASS |

The inventory guard confirms one tagged browser test for each claim. A direct cross-check of the landing page, planner, legal pages, README, and demo instructions found no unlisted public promise. Untested-claim count: **0**.

| Check | Result |
| --- | --- |
| `npm test` | PASS — copy audit, claim guard, 14/14 unit tests |
| `npm run lint` | PASS |
| `npm run build` | PASS — produced `dist/index.html` |
| `npx playwright test --reporter=line` | PASS — 45/45 browser tests |
| `npm audit` and `npm audit --omit=dev` | PASS — 0 vulnerabilities |

The production build is 34.09 kB JavaScript raw (11.55 kB gzip) and 14.53 kB CSS raw (3.99 kB gzip), with no third-party fonts.

## Live routes, accessibility, privacy, and offline use

The factory URL check passed fresh live loads of `/`, `/demo`, `/plan`, `/privacy`, and `/terms`: each returned 200, had a route-specific title, `lang=en`, exactly one h1 and main landmark, complete image alt text, labelled buttons, and no console or page errors. The first Tab exposed the skip link and Enter moved focus to main. A reduced-motion context found no non-zero animation or transition duration. The offline demo reloaded after worker setup and still opened the Add a meal dialog.

Playwright Axe found no serious or critical issue on home, demo, planner, Privacy, Terms, or the standalone 404. The designed unknown URL returned HTTP 404 with **Page not found** and recovery links. At the 195 px 200%-zoom equivalent its document width was exactly 195 px, so there was no horizontal overflow. The 390 px primary action and first-screen content fit above the fold.

The live CSP permits only self resources plus the documented Sociobot license endpoint. It has `frame-ancestors 'none'`, HSTS, `nosniff`, and a strict-origin referrer policy. Valid demo and real-plan flows made no analytics or meal-data requests off origin. The optional license verification sends only its token to Sociobot, as tested by `local-only`.

Fresh mobile Lighthouse: Performance **100**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 0.9 s, LCP 1.0 s, TBT 0 ms, CLS 0.

The deployed HTML named the same candidate asset paths as the clean build. The live JavaScript SHA-256 was `1a44a45b4655f199888312a11bb72f63ba918076556bc95dbf39eb91571d266a` and the live CSS SHA-256 was `25e4f43d5fd71d22a77532e05bda6337279ea752f42acfe14b9859c412fde093`; both match the clean candidate build byte-for-byte.

## Earlier findings

All earlier review and verification findings were inspected. Their current disposition is:

| Earlier finding groups | Current disposition |
| --- | --- |
| Empty-planner Axe, demo disposal, unsafe import IDs, storage recovery, metadata, cache size | Fixed; current full suite and live Axe/route checks pass. |
| Skip-link focus, decimal thresholds, worker update, whitespace loss, small privacy target | Fixed; browser suite and fresh keyboard route check pass. |
| Incomplete claims, stale copy audit, unclear labels, hero caption, unsupported drag, small annotations | Fixed; copy and claim guards pass; current UI has no drag claim and fits mobile/200% checks. |
| Complete JSON, persistence, and record correction proof | Fixed; deep transfer, reload persistence, editing, and deletion tests pass. |
| F-7-1 within-limit state | Fixed; live sample visibly says within limit and the tagged comparison claim proves every state. |
| F-7-3 404 200%-zoom overflow | Fixed; live 195 px document width is 195 px. |
| Old dead/forgeable paid path | Fixed; valid paid access requires verification or an unexpired valid cached verdict. |

The external billing offer is not registered yet. The required checkout URL currently returns the stipulated HTTP 404 (`enabled factory product`). This is an expected external-registration state stated in the work order, not a broken product route or a failed sandbox claim. The page does not claim checkout has completed. No product backend exists, so tenant isolation, restart persistence, health, and 429 checks do not apply. No installed CLI, library, desktop, or AI artifact applies.

## Evidence

- `/work/.evidence/verify15/` — fresh factory URL evidence and Lighthouse JSON
- `/tmp/nfp-verify15-clean` — detached clean checkout used for the commands
- `.factory/claims.json` — 17 tested public claims

Finding count: **0**. Untested claim count: **0**.

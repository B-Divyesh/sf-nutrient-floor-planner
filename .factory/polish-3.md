# Polish round 3 — cumulative finding map

Implementation commit: `b97890a`. Deployment:
`278f5400-c9c6-41c8-a096-94c339150ef9`.

Every earlier review and polish report was reread. Each finding below was
checked against the current source, a clean clone, and the deployed site.

| Finding | Change made or retained | Evidence |
| --- | --- | --- |
| F-1-1 — unavailable paid checkout | The planner remains fully free. There is no price, checkout, license, upgrade, or Sociobot billing link. | `@claim:free-to-use`; live `freePlan.paidCopy=false` and `sociobotLinks=0` in [live QA](evidence/polish-3-live-qa.json); [live home](https://nutrient-floor-planner.sociobot.in/). |
| F-1-2 — forged token entitlement | Entitlement and food-cap code remain absent. A forged legacy token has no effect and twelve foods can be saved. | `@claim:free-to-use`; live forged-token flow reports 12 foods in [live QA](evidence/polish-3-live-qa.json); [live planner](https://nutrient-floor-planner.sociobot.in/plan). |
| F-1-3 — incomplete 404 | The direct “Page not found” page keeps the blueprint shell, metadata, favicon, header, navigation, legal links, footer, and both recovery actions. | Playwright `the styled 404 has the full shell, legal links, metadata, and recovery actions`; [live 404 screenshot](evidence/polish-3-live-404-mobile.png); [live unknown route](https://nutrient-floor-planner.sociobot.in/polish-3-page-not-found) returned 404. |
| F-1-4 — incomplete claims and persistent demo | The demo remains in memory, never reads or writes the real plan, and resets on reload, visible exit, hard navigation, tab closure, or Reset demo. The inventory now has 16 one-to-one claim tests and an automated inventory guard. | `@claim:demo-isolation`, `@claim:demo-reset`, `@claim:no-calorie-input`, `@claim:offline-use`, and `npm test`; clean clone passed every exact claim command; live counts 7→8→7, then 7 after hard exit and tab closure in [live QA](evidence/polish-3-live-qa.json); [live demo screenshot](evidence/polish-3-live-demo-mobile.png). |
| F-1-5 — indirect landing headings | The first screen keeps the direct job headline, audience sentence, sample action with outcome, and three factual lines. Section headings name the sample totals, three-step method, and food-value handling. | Playwright `landing first screen remains readable and actionable at 390px`; [live home screenshot](evidence/polish-3-live-home-mobile.png); live QA records the exact h1 and section headings. |
| F-1-6 — long or technical README copy | README remains short and direct, with browser-facing terms and no commercial or IndexedDB jargon. | Clean-clone `npm test`; current [README](../README.md); commercial-copy scan in `@claim:free-to-use`. |
| F-2-1 — stale copy audit | The landing audit now matches the released copy, including removal of the hero caption. `npm test` fails on audited-string drift. | `scripts/check-copy-audit.mjs`; clean-clone `npm test`; [.factory/copy-audit.md](copy-audit.md). |
| F-2-2 — indirect labels and inaccurate README heading | The redundant sample eyebrow remains absent. The values section says “How your food values are used,” and README says “Claims covered by browser tests.” | Live section-heading list in [live QA](evidence/polish-3-live-qa.json); [live home screenshot](evidence/polish-3-live-home-mobile.png); clean-clone copy guard. |
| F-2-3 — nonfunctional dragging | Meal cards remain non-draggable; editing is the explicit keyboard-accessible path. The source guard prevents the unsupported attribute from returning. | `scripts/check-copy-audit.mjs`; live `draggable=0` in [live QA](evidence/polish-3-live-qa.json); full Playwright suite. |
| F-2-4 — 12 px mobile annotations | Essential meal and food annotations remain at least 14 px on narrow screens, with horizontal day scrolling and no page overflow. | Playwright `mobile and 200% zoom-equivalent layouts avoid page overflow`; live `mealTextPx=14` and `foodSourcePx=14`; [live demo screenshot](evidence/polish-3-live-demo-mobile.png). |
| F-3-1 — undeclared README build claim | Added `build-output` to `.factory/claims.json` and a tagged test that inspects the production app shell after Playwright's build step. Added a guard enforcing unique claim IDs, exact commands, and exactly one test tag per claim. | `@claim:build-output produces a complete dist/index.html app shell`; clean-clone exact claim command passed; `npm test` reports 16 one-to-one tests; `npm run build` produced `dist/index.html`. |
| F-3-2 — decorative hero caption | Removed the visible caption while preserving the image's useful alt text and blueprint art. Added regression checks for both conditions. | Playwright `landing first screen remains readable and actionable at 390px`; `scripts/check-copy-audit.mjs`; live QA reports `visibleHeroCaptions=0`; [live home screenshot](evidence/polish-3-live-home-mobile.png). |

## Verification summary

- Clean clone: `/tmp/nutrient-floor-polish3.jwkkQn` at `b97890a`.
- `npm ci`: passed, 0 vulnerabilities.
- `npm test`: 11 unit tests plus copy and 16-claim inventory guards passed.
- `npm run lint`: passed.
- `npm run build`: passed; 9.17 kB gzip JS and 3.74 kB gzip CSS.
- Every exact command in `.factory/claims.json`: 16/16 passed separately.
- `npx playwright test --reporter=line`: 40/40 passed.
- Factory `verify-url.sh`: local and live home/demo passed with no console errors.
- Local Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.16 s, CLS 0, TBT 0.
- Live Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 0.83 s, CLS 0, TBT 18.5 ms.
- Live Axe: zero serious or critical findings on home, demo, planner,
  Privacy, Terms, and 404.

No finding remains unresolved.

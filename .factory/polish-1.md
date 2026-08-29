# Polish round 1 — cumulative finding map

Candidate `287a245befbc7292ddb4bc41ab69030dbeda6a1e` was reviewed in
`.factory/review-1.md`. No earlier `.factory/review-*.md` or
`.factory/polish-*.md` exists in repository history. Older verification
regressions remain covered by the 29-test browser suite.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 — dead $12 checkout | Removed the unavailable purchase, price, license form, food gate, checkout link, and external API permission. The complete planner is no longer sold or gated. | Playwright `removed paid path ignores a legacy forged token and does not gate foods`; live `/` has no commercial copy or `api.sociobot.in` link; [live root](https://nutrient-floor-planner.sociobot.in/); `.factory/evidence/live-polish-1-demo-mobile.png`. |
| F-1-2 — forged token unlocked capacity | Removed all entitlement code and the artificial ten-food limit. A forged legacy token changes nothing; an 11-food live import works with no API request or commercial state. | Playwright forged-token regression; cold live `/plan?cold=forged` returned 11 food rows, zero Sociobot API requests, and zero upgrade/license/purchase text. |
| F-1-3 — incomplete 404 | Rebuilt `404.html` with the normal wordmark, navigation, skip link, footer, Privacy and Terms links, complete metadata, favicon, direct “Page not found” wording, and both requested recovery links. | Playwright `the styled 404 has the full shell, legal links, metadata, and recovery actions`; `.factory/evidence/live-polish-1-404.png`; [live unknown route](https://nutrient-floor-planner.sociobot.in/not-a-real-route) returned HTTP 404. |
| F-1-4 — incomplete claims | Replaced the claim inventory with 13 one-to-one observable tests. Corrected fibre from 33.5 g to 40 g. Added totals, privacy traffic, source, calculation, demo reset, and isolation coverage. Removed every checkout/token claim and made the illustration caption descriptive. | All 13 exact `@claim:*` commands passed from clean clone `7af96d52…`; `@claim:sample-totals`, `@claim:local-only`, `@claim:food-source`, and `@claim:target-comparison`; live demo showed 7 foods, 3 meals, 3 targets, zero foreign requests, and reset to 7 foods. |
| F-1-5 — indirect landing headings | Changed the labels to “Private meal planner,” “See a sample week meet nutrient targets,” and “Sample weekly nutrient totals.” Removed the paid/basic section and renamed the pantry “Your saved foods.” | `.factory/copy-audit.md`; Playwright `landing first screen remains readable and actionable at 390px`; `.factory/evidence/polish-1-landing-mobile.png`; [live landing](https://nutrient-floor-planner.sociobot.in/). |
| F-1-6 — long and technical README copy | Rewrote the README in short, direct sentences. It uses “browser storage,” “Run locally,” and “Run checks,” with no checkout or license language. | `.factory/copy-audit.md`; clean-clone README/claims cross-check; `rg` commercial-copy scan. |

The full browser run also passed offline reload, corrupt and unsafe imports,
blocked storage recovery, dialog focus and Escape, route/back focus, skip-link
focus, cancelled meal creation, deletion confirmation, meter CSP safety, light
and dark axe scans, touch targets, 200% zoom overflow, JSON transfer,
persistence, metadata, and service-worker caching.

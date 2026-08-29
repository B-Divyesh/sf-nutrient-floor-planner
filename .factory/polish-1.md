# Polish round 1 — cumulative finding map

Candidate `287a245befbc7292ddb4bc41ab69030dbeda6a1e` was reviewed in
`.factory/review-1.md`. No earlier `.factory/review-*.md` or
`.factory/polish-*.md` exists in repository history. The cumulative review says
the older verification regressions were fixed; their regression tests remain
in the 29-test browser suite.

## Findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 — dead $12 checkout | Removed the unavailable purchase, price, license form, food gate, checkout link, and external API permission. The complete planner is no longer sold or gated. | Playwright `removed paid path ignores a legacy forged token and does not gate foods`; commercial-copy scan; `.factory/evidence/polish-1-landing-desktop.png`; live `/` check after deploy. |
| F-1-2 — forged token unlocked capacity | Removed all entitlement code and the artificial ten-food limit. A forged legacy token now changes nothing, while an 11-food import and twelfth save work normally. | Playwright `removed paid path ignores a legacy forged token and does not gate foods`; unit tests no longer expose license-dependent capacity functions; live `/plan` check after deploy. |
| F-1-3 — incomplete 404 | Rebuilt `404.html` with the normal wordmark, navigation, skip link, footer, Privacy and Terms links, full metadata, favicon, direct “Page not found” wording, and both requested recovery links. The SPA unknown-route view uses the same wording and actions. | Playwright `the styled 404 has the full shell, legal links, metadata, and recovery actions`; `.factory/evidence/polish-1-404-mobile.png`; live unknown-URL HTTP/status check after deploy. |
| F-1-4 — incomplete claims | Replaced the claim inventory with 13 one-to-one observable tests. Corrected the sample fibre total from 33.5 g to 40 g, tested privacy traffic, source entry, calculations, and demo reset/isolation, and removed every checkout/token claim. The illustration caption is now descriptive. | All 13 exact `@claim:*` commands; `@claim:sample-totals`, `@claim:local-only`, `@claim:food-source`, and `@claim:target-comparison`; clean-clone outputs in handoff; `.factory/evidence/polish-1-landing-mobile.png`. |
| F-1-5 — indirect landing headings | Changed the labels to “Private meal planner,” “See a sample week meet nutrient targets,” and “Sample weekly nutrient totals.” Removed the paid/basic section and replaced indirect pantry language with “Your saved foods.” | `.factory/copy-audit.md`; Playwright `landing first screen remains readable and actionable at 390px`; `.factory/evidence/polish-1-landing-mobile.png`. |
| F-1-6 — long and technical README copy | Rewrote the README in short, direct sentences. It now uses “browser storage,” “Run locally,” and “Run checks,” and contains no checkout or license language. | `.factory/copy-audit.md`; README claim cross-check; clean-clone test commands in handoff. |

## Preserved regression coverage

The browser suite also covers offline reload, corrupt and unsafe imports,
blocked storage recovery, dialog focus and Escape, route focus, skip-link focus,
cancelled meal creation, deletion confirmation, meter CSP safety, light and dark
axe scans, touch targets, 200% zoom overflow, JSON transfer, persistence, and
service-worker caching.

Live evidence fields above are completed after production deployment and cold
verification.

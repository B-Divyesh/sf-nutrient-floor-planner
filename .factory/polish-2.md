# Polish round 2 — cumulative finding map

Repair commit: `0afc906` (before final evidence documentation commit). The
checks below ran in detached clean clone `/tmp/nutrient-floor-polish2.qZBa5f`.
Every command in `.factory/claims.json` was invoked separately and passed.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 — unavailable paid checkout | The prior repair removed unavailable pricing, checkout, license, and capacity-gating code. This round keeps the complete planner free. | Playwright `removed paid path ignores a legacy forged token and does not gate foods`; cold live-root scan recorded after deployment. |
| F-1-2 — forged token entitlement | No entitlement code remains; an old token has no effect on saved foods or UI. | Playwright `removed paid path ignores a legacy forged token and does not gate foods`; cold live `/plan` recheck recorded after deployment. |
| F-1-3 — incomplete 404 | The full 404 shell, direct wording, recovery actions, legal links, metadata, and favicon remain in place. | Playwright `the styled 404 has the full shell, legal links, metadata, and recovery actions`; [mobile 404 screenshot](evidence/polish-2-404-mobile.png); live unknown-route check recorded after deployment. |
| F-1-4 — incomplete claims and false demo persistence | Replaced persistent demo storage with an in-memory sample workspace, expanded the claim inventory to 14 entries, added no-calorie coverage, and extended offline coverage to both demo and planner routes. | Clean clone: every `@claim:*` command passed; `@claim:demo-isolation`, `@claim:offline-use`, and `@claim:no-calorie-input`; [mobile demo screenshot](evidence/polish-2-demo-mobile.png); live demo recheck recorded after deployment. |
| F-1-5 — indirect landing headings | Removed the redundant sample eyebrow and replaced the vague values heading with “How your food values are used.” | `npm test` copy-audit guard; `landing first screen remains readable and actionable at 390px`; [landing screenshot](evidence/polish-2-landing-desktop.png); live-root copy check recorded after deployment. |
| F-1-6 — long or technical README copy | Retained the plain-language rewrite and updated the demo wording to describe its in-memory behavior accurately. | `npm test` copy-audit guard; README and claims cross-check in clean clone; live legal/copy recheck recorded after deployment. |
| F-2-1 — stale copy audit | Regenerated `.factory/copy-audit.md` with the current sample-action sentence and added `scripts/check-copy-audit.mjs` to `npm test`. | Clean-clone `npm test` passed; the guard checks every audited landing string and fails on drift. |
| F-2-2 — indirect labels and inaccurate README heading | Removed “See a sample week meet nutrient targets,” renamed the values section, and changed the README heading to “Claims covered by browser tests.” | `npm test` copy-audit guard; [landing screenshot](evidence/polish-2-landing-desktop.png); live-root and README recheck recorded after deployment. |
| F-2-3 — nonfunctional dragging | Removed `draggable="true"` from meal cards and added a source guard that fails if unsupported dragging returns. Meal editing remains the explicit, keyboard-accessible way to change a day. | Clean-clone `npm test`; `scripts/check-copy-audit.mjs`; live demo DOM recheck recorded after deployment. |
| F-2-4 — 12 px mobile annotations | Raised essential food, portion, day, meal-total, and add-meal annotations to 0.875 rem (14 px) at mobile widths. | Playwright `mobile and 200% zoom-equivalent layouts avoid page overflow`; [mobile demo screenshot](evidence/polish-2-demo-mobile.png); live 390 px recheck recorded after deployment. |

## Local quality evidence

- `npm test`: 7 unit tests passed and copy-audit guard passed.
- `npm run lint`: passed.
- `npm run build`: passed; `dist/` contains `index.html`, 8.72 kB gzip JS and
  3.61 kB gzip CSS.
- `npx playwright test`: 30/30 passed, including light/dark Axe scans,
  privacy request logging, offline reload/editing, routing/focus/404, dialog
  keyboard behavior, and 390 px / 200% zoom-equivalent layouts.

## Live deployment recheck

Deployment `f2d787e6-ccb6-4e66-8862-cd93accae6c0` completed through the
static work-order helper. `verify-url.sh` passed cold home and demo loads; its
reports and screenshots are in `evidence/live-polish-2-home/` and
`evidence/live-polish-2-demo/`. The live browser report is
`evidence/live-polish-2-browser.json`.

| Finding IDs | Live URL checked | Result |
| --- | --- | --- |
| F-1-1, F-1-5, F-2-1, F-2-2 | <https://nutrient-floor-planner.sociobot.in/> | One h1/main, sample action visible, no paid copy, removed eyebrow absent, direct heading present. |
| F-1-2 | <https://nutrient-floor-planner.sociobot.in/plan> | Planner loads with no license or capacity-gate UI. |
| F-1-3 | <https://nutrient-floor-planner.sociobot.in/not-a-real-route> | Page-not-found title, heading, full shell, legal links, and recovery actions load. |
| F-1-4, F-2-3, F-2-4 | <https://nutrient-floor-planner.sociobot.in/?demo=1> | Demo counted 7 → 8 → 7 after hard exit, 7 after tab closure, no draggable meals, and 14 px annotations. |
| F-1-6 | <https://nutrient-floor-planner.sociobot.in/privacy> | Plain-language in-memory demo privacy copy loads with no errors. |

Live Axe found no serious or critical findings on home, demo, Privacy, Terms,
or 404.

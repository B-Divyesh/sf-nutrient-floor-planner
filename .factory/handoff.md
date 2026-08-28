# Nutrient Floor repair handoff — PASS

## Release

- Repair commit: `bb868050ac6670766f5ab4e2c7289f13c18b351f`
- Base verifier report: `.factory/verification-2.md` for candidate
  `236fa35444543d0d83a149f416e9ec5b568409bc`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Deployed: 2026-08-28 UTC, Azure Static Web Apps deployment
  `5bc89d20-ba8a-416f-976d-d3a02b8f304a`

## What changed

- Fixed the blank light planner’s **Add your first target** control. It now
  explicitly uses graphite text on its paper surface instead of inheriting
  chalk text from the blueprint coverage board.
- Added a regression scan for the real empty `/plan` state. It checks both the
  computed text colour (`rgb(16, 40, 58)`) and zero serious/critical axe
  violations.
- Added the missing, observable README claim for user-entered food values and
  sources, with a dedicated `@claim:food-source` browser test.
- Removed the unbounded-food and no-account/paid-unlock README promises rather
  than leaving claims that cannot be proven by a finite sandbox test.

## Verification evidence

- Clean install: `npm ci` — pass, 0 vulnerabilities.
- Unit tests: `npm test` — 5/5 pass.
- Type check: `npm run lint` — pass.
- Production build: `npm run build` — pass; `dist/index.html` exists.
- Full browser suite: `npx playwright test` — 15/15 pass.
- Every exact `.factory/claims.json` command was rerun independently after the
  clean install: `demo-week-coverage`, `local-only`, `offline-use`,
  `json-transfer`, `local-persistence`, `demo-isolation`, `print-week`, and
  `food-source` — all pass.
- Dependency audits: `npm audit` and `npm audit --omit=dev` — 0
  vulnerabilities.
- Accessibility: Playwright axe 4.11 scans pass for demo, dark demo, and the
  repaired empty light `/plan`; all have zero serious/critical findings. The
  factory URL smoke check passed title, `lang`, a single `h1`, `main`, image
  alt text, labels, and zero browser errors.
- Browser checks: desktop and 390×844 mobile have no horizontal overflow;
  Tab first reaches **Skip to planner**. Dialog focus/Escape, route focus,
  reduced motion, malformed import recovery, deletion confirmation, and meal
  cancellation are covered by the browser suite.
- Privacy/offline/update: the live sample flow made no cross-origin requests;
  after service-worker setup, a live offline reload showed the planner and
  opened **Add a meal** successfully. The versioned worker retains its tested
  update-ready flow.
- Response policy/live routes: live `/`, `/demo`, `/plan`, `/privacy`,
  `/terms`, manifest, robots, sitemap, and social image returned 200; an
  unknown route returned the designed HTTP 404. HSTS, nosniff, Referrer-Policy,
  CSP, manifest MIME, and immutable hashed-asset caching are live.
- Live identity: local and deployed SHA-256 values matched exactly for
  `index.html` (`ed1f093578774a93d47e07f7c2bce5c4174ad32d264e82c23a752024b307175b`),
  JS (`91b0a0eef3de3ecf6a6a1900362e540ac94579827d6133bf5511fffbd651d51d`),
  and CSS (`c7fef402a8ae8d7c0babc8f5312a194c215fb77121118b14da6dc46f83c5c2d0`).
- Lighthouse mobile, local production artifact: landing 99 performance / 100
  accessibility / 100 best practices / 100 SEO (LCP 2,255 ms, CLS 0); repaired
  empty `/plan` 100 / 100 / 100 / 100 (LCP 1,504 ms, CLS 0).

## Run locally

```sh
npm ci
npm test
npm run lint
npx playwright test
npm run build
```

No known release blockers remain. The pre-existing `graphify-out/` working-tree
changes were deliberately left untouched and are not part of this repair.

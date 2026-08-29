# Nutrient Floor verification handoff

## Release decision: PASS

Candidate `287a245befbc7292ddb4bc41ab69030dbeda6a1e` is verified at
https://nutrient-floor-planner.sociobot.in as of 2026-08-29 UTC. No
release-blocking or material defects remain. Full evidence is in
`.factory/verification-6.md`.

## What was verified

- The cold first screen plainly states the meal-planning job, names home cooks,
  and presents a fully visible one-click **Try it with sample data** action.
- All 11 exact `.factory/claims.json` commands passed after `npm ci` in a clean,
  detached worktree at the candidate commit.
- Clean gates passed: 7/7 unit tests, TypeScript lint, 23/23 Playwright tests,
  and the exact production build.
- Live HTML, JS, CSS, manifest, 404, hero, icons, and normalized worker match
  the candidate build.
- Live normal planning, boundary/invalid input, recovery, deletion, demo
  isolation, privacy, keyboard, 390 px mobile, dark mode, reduced motion,
  offline reload, and service-worker replacement passed.
- Playwright Axe and `@axe-core/cli` found zero violations. Mobile Lighthouse
  scores are 100 for performance, accessibility, best practices, and SEO.
- Browser request logging found only same-origin requests during meal planning,
  with no valid-page console or page errors. Security and cache headers pass.
- The external Sociobot verification API allowed 30 requests from one client;
  request 31 returned 429 with `Retry-After: 4`.

## Build and performance

`npm run build` creates `dist/`. Production output is 26.38 kB JS (9.38 kB
gzip), 12.49 kB CSS (3.55 kB gzip), and a 121,876-byte hero. Lighthouse measured
FCP 0.9 s, LCP 1.8 s, TBT 50 ms, CLS 0, and 204 KiB total transfer.

## Known gap

Low severity only: the static 404 page uses the metaphor “This sheet is not in
the folder” and does not reuse the normal header/footer. It remains accessible,
returns the correct 404 status, and provides a direct route home. This does not
block release.

## Reproduce

```sh
npm ci
npm test
npm run lint
npx playwright test
npm run build
```

No product code was modified during verification. Pre-existing modified
`graphify-out/` files were preserved and excluded from this handoff commit.

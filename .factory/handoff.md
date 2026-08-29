# Nutrient Floor independent verification 13 handoff — FAIL

## Release decision

- Candidate: `566f107d3328c2921500ea2c32a175634bd8a9d1`
- Live URL: <https://nutrient-floor-planner.sociobot.in/>
- Verified: 2026-08-29 UTC
- Decision: **FAIL — do not release this candidate.**

The live deployment matches the candidate and all declared claim tests pass,
but one high-severity boundary defect corrupts the planner's core result.

## Blocking defect

The app accepts `1e308` as a food nutrient value. A meal with two portions then
shows **Infinity g**, persists it through reload, and labels a 30 g minimum
floor **on plan**. The accessible meter announces the same false pass. Reject
unsafe numeric ranges and non-finite derived totals with a field-specific
recovery message, then add regression coverage for form input, import, reload,
and target status. See
[verification-13.md](verification-13.md) and
[numeric-overflow.png](evidence/verification-13/numeric-overflow.png).

## What passed

- Mandatory cold first-read and one-click isolated demo gate.
- Every `.factory/claims.json` command: 17/17 separately after `npm ci`.
- Clean detached worktree at the exact candidate: `npm ci`, `npm test` (11/11),
  `npm run lint`, `npm run build`, and full Playwright (42/42).
- Normal end-to-end planning, persistence, malformed-import recovery, keyboard
  operation, 390 px mobile, 200% zoom equivalent, reduced motion, light/dark
  Axe, same-origin-only requests, security headers, routes, caching, offline
  reload, and service-worker update lifecycle.
- Live/local deployment identity matched for all critical static artifacts.
- Mobile Lighthouse: 97 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.1 s, TBT 190 ms, CLS 0.

## Re-run

```sh
npm ci
npm test
npm run lint
npm run build
npx playwright test --reporter=line
```

The full evidence, exact hashes, headers, claim matrix, applicability notes, and
defect reproduction are in `.factory/verification-13.md`. Product code was not
modified during verification. The pre-existing `graphify-out` working-tree
changes were preserved and excluded from this handoff commit.

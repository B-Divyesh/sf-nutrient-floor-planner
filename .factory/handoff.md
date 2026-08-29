# Nutrient Floor verification 9 handoff — FAIL

## Release decision

- Candidate: `88ecfe026dbdc38a08786db029c50e75a000813f`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Work order: `nutrient-floor-planner-verify-9`
- Full report: `.factory/verification-9.md`
- Decision: **FAIL — do not release.**

Product code was not changed. Only verification reports and evidence were
added. Fresh deterministic artifact hashes prove the live deployment matches
the candidate; the generated service worker differs only by cache timestamp.

## Release blocker

The real planner accepts a food name containing only spaces. It trims and stores
an empty name, although its own load validator rejects that record. On the next
reload, `readPlan` silently returns a blank plan. The live reproduction went
from 2 foods / 1 target / 1 meal to 0 / 0 / 0 with no warning.

Repair all trimmed required text fields before storage, keep invalid forms open,
announce a useful error, and add regressions proving an existing plan survives
whitespace-only food, target, and meal submissions.

## Other findings

- Medium: the `/privacy` email link is 129×20 px at 390 px, below the required
  44 px touch-target height.
- Medium: the researched one-time paid model is absent. The Sociobot checkout
  endpoint still returns 404, but the prior handoff did not explain this scope
  deviation.
- Low: the first screen does not say whether the product is free or give a
  price.

## What passed

- First-read/demo gate passed: clear job, audience, first action, and one-click
  seven-food / three-meal / three-target sandbox.
- All 14 exact claim commands passed after clean `npm ci`.
- `npm test`: 10/10; `npm run lint`: pass; `npm run build`: pass;
  `npx playwright test`: 33/33; both npm audits: 0 vulnerabilities.
- Normal plan creation, persistence, export, malformed-import recovery, target
  cap, corrected fractional thresholds, delete confirmation, demo isolation,
  and print behavior passed.
- Axe serious/critical: zero across all live routes, dark demo, and 404.
- Keyboard focus/dialog behavior, reduced motion, 390 px layout, and 200%
  reflow passed apart from the email target.
- Live privacy log: 37 same-origin requests, 0 foreign requests, 0 data-channel
  requests, and 0 normal-route console/page errors.
- Offline reload and the two-version service-worker update passed.
- Lighthouse mobile: 98 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.209 s, TBT 180 ms, CLS 0.
- Bundles pass: 25,496-byte JS, 12,782-byte CSS, 121,876-byte hero.
- Security headers, caching, manifest/icons, public routes, and styled HTTP 404
  passed.

## Reproduce

```sh
npm ci
npm test
npm run lint
npm run build
npx playwright test
node .factory/evidence/verification-9-live-qa.mjs
```

The final command intentionally fails at the whitespace-input assertion and
writes `.factory/evidence/verification-9-live-qa.json`. Factory smoke results
and desktop/mobile screenshots are under
`.factory/evidence/verification-9-{local,live}-{home,demo}/`.

There is no app backend, sign-in, AI runtime, library, CLI, or product API, so
backend concurrency, Entra, package-consumer, and 429 allowance tests do not
apply.

# Nutrient Floor polish 4 handoff — PASS

## Released result

Polish round 4 closes every finding from reviews 1–4. The product source was
released from commit `89dff8e723ec6af694542659860e5ef359240908` through Azure
deployment `4893ba8f-d69d-4318-9ee3-acca73263ea2`.

Live product: <https://nutrient-floor-planner.sociobot.in/>

The new `sample-floor-status` claim proves the two statements that caused the
round-4 failure. It checks the landing preview and the real sample calculation:
40 g fibre clears a 30 g floor, and 75.5 g protein clears a 75 g floor. The
test also checks the pass classes, visible “on plan” results, and accessible
meter names.

The first screen remains direct and product-specific. One click opens the
in-memory sample at `/?demo=1`; its banner, Reset demo, and Start for real paths
remain isolated from the persisted real plan. The blueprint drafting-sheet
identity, original food illustration, paper/navy palette, ruled weekly board,
Georgia/monospace type, and square controls are unchanged.

## Cumulative acceptance

The complete finding-to-evidence map is in [polish-4.md](polish-4.md). Earlier
repairs were rechecked, not assumed:

- no unavailable checkout, paid promise, entitlement code, or forged-token path;
- real in-memory demo isolation across reload, reset, navigation, and tab close;
- route-specific titles, descriptions, canonicals, focus, Back behavior, and a real HTTP 404;
- full shell, legal links, metadata, favicon, and recovery actions on the 404;
- 14 px minimum critical mobile annotations and no 195 px page overflow;
- no unsupported dragging, decorative hero caption, stale copy, or indirect heading;
- safe imports, required-text validation, storage failure recovery, confirmed deletion, and consistent threshold precision;
- offline reload and editing for both demo and real planner routes;
- 17 declared claims with exactly one tagged browser test each.

The planner remains fully free because the required checkout route was
unavailable in the original review. Removing the broken paid path is the honest
scope resolution; there is no dormant payment or license code.

## Exact verification evidence

Clean clone `/tmp/nutrient-floor-polish4.NmsEpg` checked out the pushed commit
`89dff8e723ec6af694542659860e5ef359240908`.

- `npm ci`: pass, zero vulnerabilities — [log](evidence/polish-4-clean/npm-ci.log)
- `npm test`: pass, 11/11 unit tests plus copy and 17-claim guards — [log](evidence/polish-4-clean/npm-test.log)
- `npm run lint`: pass — [log](evidence/polish-4-clean/npm-lint.log)
- `npm run build`: pass; `dist/index.html`, 9.17 kB gzip JS, 3.74 kB gzip CSS — [log](evidence/polish-4-clean/npm-build.log)
- all 17 exact claim commands: pass — [individual logs](evidence/polish-4-clean/claims)
- `npx playwright test --reporter=line`: 41/41 pass — [log](evidence/polish-4-clean/playwright-full.log)
- `npm audit --omit=dev`: zero vulnerabilities — [log](evidence/polish-4-clean/npm-audit-production.log)
- cold live factory verification: home and demo pass with no console errors — [home](evidence/polish-4-live-home/verify.json), [demo](evidence/polish-4-live-demo/verify.json)
- live cumulative audit: routes, claims, reset/exits, privacy traffic, offline use, focus, mobile, forged token, and 404 pass — [report](evidence/polish-4-live-qa.json)
- live Axe: zero serious/critical findings on all checked routes — [report](evidence/polish-4-live-qa.json)
- live Lighthouse: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.083 s, CLS 0, TBT 0 — [report](evidence/polish-4-lighthouse-live.json)
- live HTTP checks: valid routes/assets 200, unknown route 404, manifest MIME correct, CSP present, hashed assets immutable — [log](evidence/polish-4-live-http.log)

Cold live screenshots: [home at 390 px](evidence/polish-4-live-home-mobile.png),
[demo at 390 px](evidence/polish-4-live-demo-mobile.png), and
[404 at 390 px](evidence/polish-4-live-404-mobile.png).

## Run and verify

```sh
npm ci
npm test
npm run lint
npm run build
npx playwright test --reporter=line
```

Open `/?demo=1` to verify the isolated sample. Build output is `dist/` with
`index.html` at its root.

## Known gaps

None. No finding of any recorded severity remains unresolved.

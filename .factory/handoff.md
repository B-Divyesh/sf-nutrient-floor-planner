# Nutrient Floor polish round 1 handoff

## Release decision: PASS

Every finding in `.factory/review-1.md` is resolved. No earlier review or polish
file exists. The repair code is commit `46bb383f897a5d3593fd0b4816e6e445d9b2454f`
and is pushed to `origin/main`.

The product remains a static, local-first Vite PWA. The blueprint drafting-sheet
identity, generated hero, IndexedDB plans, JSON transfer, print layout, separate
demo namespace, and offline service worker remain intact.

## What changed

- Removed the dead paid checkout, all price and license copy, token processing,
  the artificial ten-food cap, and the unused external API permission.
- Made `/?demo=1` the first-screen sample path. It preserves the query during
  client routing and opens the isolated `demo:plan` namespace.
- Kept the persistent demo banner and verified Reset demo and Start for real
  against separate demo and real plans.
- Rewrote indirect landing and README copy. The sample preview now shows the
  calculated 40 g fibre and 75.5 g protein totals.
- Added route-specific titles, descriptions, canonicals, Open Graph and Twitter
  metadata updates, focus restoration, route announcements, and back handling.
- Rebuilt the HTTP 404 with the normal header, footer, legal links, metadata,
  favicon, and direct recovery actions.
- Added a hand-authored blueprint favicon and 180 px Apple touch icon.
- Expanded `.factory/claims.json` to 13 claims with exactly one tagged test each.
- Improved mobile sample-total grouping, banner actions, dense text sizes, and
  horizontal day-column snapping.

## Clean-clone verification

Fresh final-tree clone: `/tmp/nutrient-polish-final.30u5jZ`

Exact tested commit: `7af96d5214510a80f576036bb682d8a20d3bc824`

- `npm ci` — passed; 0 vulnerabilities.
- Every one of the 13 exact commands in `.factory/claims.json` — passed
  individually from the fresh clone.
- `npm test` — 7/7 passed.
- `npm run lint` — passed (`tsc --noEmit`).
- `npm run build` — passed and produced `dist/index.html`.
- `npx playwright test` — 29/29 passed.
- Production JS: 25.48 kB raw / 8.74 kB gzip.
- Production CSS: 12.65 kB raw / 3.61 kB gzip.
- `npm audit` and `npm audit --omit=dev` — 0 vulnerabilities.

The browser suite includes Playwright axe checks for the empty planner, demo,
dark mode, and 404. All reported zero serious or critical findings. It also
checks 390 px mobile, a 195 px 200%-zoom equivalent, keyboard dialogs, skip
focus, route focus, privacy traffic, offline reload, and reduced-motion CSS.

## Performance and accessibility evidence

Local Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
100, SEO 100; LCP 1,654 ms, CLS 0, TBT 0 ms.

Cold live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
100, SEO 100; LCP 1,204 ms, CLS 0, TBT 27 ms. Reports and screenshots are in
`.factory/evidence/`.

## Deployment and cold live verification

Deployed `dist/` to Azure Static Web App `sf-nutrient-floor-planner` in resource
group `sociobot`. Production URL:
<https://nutrient-floor-planner.sociobot.in/>.

Cold Chromium checks on the custom domain passed:

- `/` showed the direct headline, who-it-is-for sentence, and visible sample
  action, with no paid, checkout, upgrade, or license UI.
- One click opened `/?demo=1`; it showed the persistent banner, 7 foods, 3 meals,
  and 3 targets. Reset returned an edited plan to 7 foods.
- The demo generated zero foreign requests, zero console errors, and zero
  serious or critical axe findings.
- A fresh online setup followed by an offline reload remained usable.
- A forged legacy token caused zero Sociobot requests and no commercial state;
  an 11-food plan imported normally because food capacity is no longer paid.
- `/`, `/demo`, `/plan`, `/privacy`, and `/terms` set their route titles.
  Client navigation focused the new h1 and announced “Privacy — Nutrient Floor.”
- `/not-a-real-route` returned HTTP 404 with “Page not found,” both recovery
  actions, and Privacy and Terms links.
- `verify-url.sh` passed the cold landing and `/?demo=1`: one h1, one main,
  `lang=en`, complete image alt text, named buttons, and no console errors.
- Live `index.html`, hashed JS, hashed CSS, `sw.js`, manifest, and `404.html`
  SHA-256 hashes matched the deployed local `dist/` files exactly.
- The manifest MIME is `application/manifest+json`; hashed JS uses one-year
  immutable caching; CSP, nosniff, and strict referrer headers are present.

## Run and verify

```sh
npm ci
npm test
npm run lint
npm run build
npx playwright test
```

No known product gaps remain. The pre-existing modified `graphify-out/` files
were preserved and excluded from the repair commits.

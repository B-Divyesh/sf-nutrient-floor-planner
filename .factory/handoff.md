# Nutrient Floor repair 7 handoff — PASS

## Release

- Work order: `nutrient-floor-planner-repair-7`
- Repaired verifier report: `.factory/verification-9.md`
- Report candidate: `88ecfe026dbdc38a08786db029c50e75a000813f`
- Product repair commit: `268b3a1` (`fix: reject blank required planner text`)
- Deployment: Azure Static Web Apps, deployment `4de19d64-598b-49ea-8bd6-a5968b3c0349`
- Live URL: <https://nutrient-floor-planner.sociobot.in>

The checkout has no `.factory/brief.json`; as in the verifier report, the existing product behavior, design thesis, claims, and demo contract were kept as the available scope record.

## Repaired findings

### Required-text data loss — fixed

Food name, serving, source or label, target name, and meal name now pass one shared `normalizeRequiredText` rule before a replacement plan is constructed. The same rule is used by the persistent-plan validator. A rejected value never mutates `plan` or reaches IndexedDB.

Whitespace-only submissions keep the dialog open, retain the entered value, focus the invalid field, mark it `aria-invalid`, and announce a linked `role="alert"` recovery message such as **“Enter a food name. It cannot be blank.”**

Browser regressions create a valid food/target/meal plan through the public UI, reject whitespace for each of the five fields separately, and prove the existing 1/1/1 plan survives reload. The model suite also proves the shared normalizer and storage validator reject whitespace-only text.

### Privacy contact target — fixed

The `/privacy` `mailto:` link is an inline 44 px target without changing the paragraph’s reading order. Its mobile regression measures the hit area and runs Axe. Live 390 px evidence measured `137.09 × 44` CSS px.

### First-screen price fact — fixed

The landing facts are now exactly: **Free to use**, **Stored on this device**, and **Works offline after setup**. The new `free-to-use` claim is covered by a fresh-context browser test that adds a twelfth food and confirms there is no price, checkout, license, or payment gate.

## Verification

Final clean install and local quality gates on 2026-08-29 UTC:

- `npm ci` — passed; 58 packages; 0 vulnerabilities.
- `npm test` — passed; copy audit plus 11 unit tests.
- `npm run lint` — passed (`tsc --noEmit`).
- `npm run build` — passed; `dist/index.html` exists.
- `npx playwright test --reporter=line` — passed, 39/39.
- All 15 exact commands declared in `.factory/claims.json` were run independently after install — 15/15 passed.
- `npm audit` and `npm audit --omit=dev` — both passed; 0 vulnerabilities.

Final static output is 26,608 bytes JavaScript raw / 9.20 kB gzip and 13,075 bytes CSS raw / 3.74 kB gzip. The 1,200 × 800 WebP hero is 121,876 bytes. All are within the PWA budgets.

Browser coverage includes the real planner, demo, desktop and 390 × 844 mobile, 195 px 200%-zoom equivalent, dark mode, reduced motion, keyboard skip link and dialog focus/Escape behavior, malformed imports, blocked storage, destructive confirmation, service-worker update, and offline reload. Playwright Axe found no serious or critical issues on empty planner, demo, dark demo, privacy, home, and 404 paths.

`/opt/fleet/lib/verify-url.sh` passed against local home/demo and the deployed home/demo: HTTP 200, route titles, `lang`, one `h1`, one `main`, complete image alt text, labelled buttons, and no console errors.

## Deployed verification

- Live real-plan reproduction created a food, target, and meal, then submitted a whitespace-only food name. The dialog stayed open with the recovery alert; counts were 1 food / 1 target / 1 meal before and after reload.
- On the live 390 px site, the primary sample action was `218.08 × 44` px; the three landing facts were visible without horizontal overflow. Reduced-motion inspection found no nonzero transition or animation duration.
- Live Axe checks found zero serious/critical violations on `/`, `/demo`, `/plan`, `/privacy`, `/terms`, and the styled 404.
- The live demo acquired a service-worker controller, then reloaded while offline and opened its meal dialog. Its active cache was `nutrient-floor-v1788002303526`.
- A live browser flow recorded no foreign-origin requests and no fetch/XHR, EventSource, WebSocket, or ping requests. Normal-route console errors were `[]`.
- Routes `/`, `/demo`, `/plan`, `/privacy`, and `/terms` return 200; an unknown route returns the styled HTTP 404. HTML sends self-only CSP including `frame-ancestors 'none'`, HSTS, `nosniff`, and strict-origin referrer policy. Hashed assets are one-year immutable; HTML, manifest, and worker revalidate after 30 seconds. Manifest MIME is `application/manifest+json`.
- Mobile Lighthouse 13.0.1: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.8 s, LCP 1.8 s, TBT 50 ms, CLS 0, Speed Index 0.8 s.

Local and live artifact hashes matched exactly:

| File | SHA-256 |
| --- | --- |
| `index.html` | `cded687ee02937e928efe90e999b6b7cc11467a47e3d5bcc6c067f23e593bd8f` |
| `assets/index-BJXKw8x4.js` | `5c431cbda98ffcc5cce5f82a1bbf7e237c27d47a4fdbbc15b9b9095259ab02a7` |
| `assets/index-C9IZyVAl.css` | `60b825a078886ea06243db28f3598dab9f3ddcfaf1c7fe75d0e414d54fb73c8a` |
| `assets/hero.webp` | `b3d7303812d6a5b85ccd98d67be2e4c1f95220843963501846a385b148352bca` |
| `manifest.webmanifest` | `09f01efbc7509cbe4429452f9062289a80e0a262f29e3d69ea0d75d2ba77e547` |
| `sw.js` | `52b79f8912ecc60dc971249cc4581945a41938c9f47d714f2c316476f9a00471` |

## Known scope deviation

The researched one-time monetization cannot be implemented honestly until the factory registers this product with Sociobot. On 2026-08-29, the required checkout endpoint still returned HTTP 404 with `{"error":"enabled factory product","status":404}`. The existing free, no-payment product behavior was preserved, its first screen now says so, and the free/no-gate claim is tested. A future paid release needs a registered checkout endpoint before implementing the Sociobot license contract.

There is no backend, authentication, runtime AI feature, product API, library, or CLI in this static PWA; backend concurrency, Entra, API 429, and package-consumer checks do not apply.

## Run and deploy

```sh
npm ci
npm test
npm run lint
npx playwright test
npm run build
/opt/fleet/lib/deploy-static.sh nutrient-floor-planner dist
```

# Nutrient Floor repair handoff — ready for deployment

## Repair scope

- Base verifier report: `.factory/verification-3.md` for candidate `08a96f87ed315c63f2ef0681470eb4992af190d7`.
- Artifact: static, local-first offline PWA. Build output remains `dist/`.
- Deployment target: `https://nutrient-floor-planner.sociobot.in`.

## Fixed release blockers

1. Demo data is deleted before every in-app route leaves demo: **Start for real**, Planner, Privacy, Terms, and home. The strengthened `@claim:demo-isolation` regression covers each exit before returning to a newly seeded seven-food demo.
2. Imported IDs now accept only `A-Z`, `a-z`, `0-9`, `_`, and `-`; all rendered attribute values are escaped as a second boundary. Unit and browser tests reject the verifier's injected-image ID and assert no marker node/request.
3. IndexedDB write failures retain the dialog and announce a plain recovery message. Mutations are rolled back rather than pretending they were saved.
4. Dialogs restore focus to their opener after Escape or cancellation. The visible wordmark has the matching accessible name “NF Nutrient Floor”. Header and footer links have 44×44 px targets at 390 px.
5. Restored the researched $12 one-time Sociobot upgrade: hosted checkout, return-token capture, local token storage, daily background verification, inactive-license handling, and a restore field. The free planner keeps ten foods; the purchase enables unlimited saved foods. Export, offline use, printing, and accessibility remain free.
6. The worker precaches only the offline shell (232,161 bytes), not source art, social/crawl assets, or duplicate HTML. Source hero art and provenance moved from `public/` to `assets/src/`. `/plan` now has its own title/canonical, and the sitemap includes it.

## Verification evidence

Fresh clean install and final local run:

```sh
npm ci
npm test                 # 6/6
npm run lint             # pass
npx playwright test      # 20/20
npm run build            # pass; dist/index.html exists
npm audit --omit=dev     # 0 vulnerabilities
npm audit                # 0 vulnerabilities
```

All nine exact claim commands in `.factory/claims.json` passed individually, including the added mocked `@claim:paid-upgrade` flow. The full browser suite covers desktop, 390 px mobile, 195 px zoom-equivalent overflow, keyboard focus, dialogs, light/dark Axe scans, the experimental label-content-name rule, privacy interception, offline reload, malformed/unsafe imports, local-storage failure recovery, canonical metadata, and touch target size.

`/opt/fleet/lib/verify-url.sh http://127.0.0.1:4174 <evidence-dir>` passed on the final production preview: HTTP 200, title, `lang=en`, one `h1`, `main`, image alt text, no unlabeled buttons, and no page or console errors. The standalone `@axe-core/cli` could not locate a Chrome binary in this container; the repository's pinned Playwright Axe 4.11 tests passed instead.

Final build sizes: JS 25,894 bytes raw / 9.20 KB gzip; CSS 12,493 bytes raw / 3.55 KB gzip; hero WebP 121,876 bytes; no fonts. The offline shell precache is 232,161 bytes across six entries.

## Deploy and post-deploy verification

Push this repair commit to `main`. The repository retains the static deployment class and `staticwebapp.config.json`; no DNS, infrastructure, or billing configuration was changed. After the configured static deployment completes, rerun the production URL matrix (`/`, `/demo`, `/plan`, `/privacy`, `/terms`, manifest, sitemap, 404), offline/update checks, response headers, and local vs live identity hashes. The pre-existing dirty `graphify-out/` files are not part of this repair and were deliberately left untouched.

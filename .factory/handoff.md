# Nutrient Floor repair handoff — deployed

## Repair scope

- Base verifier report: `.factory/verification-3.md` for candidate `08a96f87ed315c63f2ef0681470eb4992af190d7`.
- Artifact: static, local-first offline PWA. Build output remains `dist/`.
- Repair commit: `a844d96` (`fix: repair verifier release blockers`).
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

## Deployment and live verification

The built `dist/` was deployed to the existing Azure Static Web App using the
factory static deployment configuration. Azure deployment ID:
`51401735-29b0-4ef1-9d5f-d0d156699007`; custom-domain status: `Ready`.

Live `/`, `/demo`, `/plan`, `/privacy`, `/terms`, manifest, robots, and sitemap
return 200; a nonexistent route returns 404. The live headers include HSTS,
`nosniff`, strict-origin referrer policy, and a CSP allowing only self plus the
Sociobot license-verification origin. A live 390 px Playwright run confirmed
that Privacy → Demo starts a fresh seven-food sample, touch targets are 44×44,
the app reloads offline under the service worker, and no page errors or
cross-origin normal-flow requests occur.

Live identity hashes match the deployed local artifact exactly:

| File | SHA-256 |
| --- | --- |
| `index.html` | `77447f145229f68916a22b8cfd4909908ddc7822d1d65892b4057b46e9778bc6` |
| JS | `2da0e976afd27ab112bc06724deb9993cd57f8c62e89ed6b701aa7c27dbc6742` |
| CSS | `640da7549bdc50f69077541c2abe00e7339d8624068121a2a2e7d7937da150e0` |
| Normalized service worker | `9b83afd26e94a3913761070e1af7960ef068c0be0ba1b1aac7f58f114534efc9` |

The repository retains the static deployment class and
`staticwebapp.config.json`. The pre-existing dirty `graphify-out/` files are
not part of this repair and were deliberately left untouched.

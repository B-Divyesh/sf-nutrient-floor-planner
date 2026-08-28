# Nutrient Floor handoff

## Delivered

- Local-first Vite/TypeScript PWA in `dist/`, with IndexedDB-backed separate
  `real:plan` and `demo:plan` namespaces.
- A usable food pantry with per-serving fibre, protein, sugar, and saturated
  fat values plus a visible source field.
- Custom floors and limits, meals built from portions, weekly coverage bars,
  seven-day placement, delete controls, JSON import/export, and a clear empty
  plan path.
- `/demo` sample sandbox with seven foods, three meals, target coverage, reset,
  and start-for-real controls.
- `/privacy`, `/terms`, metadata, manifest, icons, service worker, static SPA
  configuration, robots/sitemap, 404 page, and an optional paid unlock link
  with local license receipt and verification.
- Blueprint drafting-sheet visual system. Original generated image asset is
  `public/assets/hero.webp` (120 KB); prompt provenance is in
  `.factory/design.md` and its sidecar JSON.

## Verification

Run from a clean checkout:

```sh
npm install
npm test
npx playwright test
npm run build
```

Completed locally on 2026-08-28:

- `npm test`: 3 unit tests pass.
- `npx playwright test`: claim checks cover demo weekly coverage, no foreign
  request while adding a food, and offline operation after first load.
- `npm run build`: passes; output is `dist/` with `index.html` at its root.
- Production app JavaScript is 7.36 KB gzip; CSS is 3.22 KB gzip; hero WebP is
  120 KB. These are within the static budgets.
- Browser smoke check at 390px: one h1, demo banner, seven foods, three meals,
  and no console errors.

## Known gaps and next steps

- The browser service worker caches the shell and keeps an open planner usable
  offline after its first visit. Validate install/reload behavior again on the
  production host, whose hashed Vite assets differ from development paths.
- The paid upgrade endpoint is wired to the factory slug and needs the factory
  to register the product before checkout can complete in production.
- Nutrition values are deliberately user supplied or attributed, not a hosted
  food database. This is a planner, not medical advice.

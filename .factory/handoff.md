# Nutrient Floor polish 2 handoff

## Completed

Released repair commits `0afc906` and `e33cb88` from `main`, then deployed
`dist/` with deployment `f2d787e6-ccb6-4e66-8862-cd93accae6c0` to
<https://nutrient-floor-planner.sociobot.in>.

The demo is an in-memory sample workspace. It remains editable while open, but
hard navigation, reload, and tab closure always reopen the bundled seven-food
sample. It never reads or writes the real plan. The claim inventory now has 14
one-to-one browser tests, including no-calorie planning and both demo and
planner offline behavior. Copy-audit drift, stale labels, unsupported dragging,
and 12 px mobile annotations are fixed.

## Verification

- Detached clean clone `/tmp/nutrient-floor-polish2.qZBa5f` at `0afc906`:
  `npm ci`, `npm test` (7/7), `npm run lint`, and `npm run build` passed.
- Every exact command in `.factory/claims.json` passed independently: 14/14.
- Full browser suite: `npx playwright test` passed 30/30, including Axe,
  privacy request logging, offline reload/edit flows, keyboard/dialog/focus,
  routing/404, and mobile/200%-zoom checks.
- Build output: `dist/index.html`; JS 8.72 kB gzip and CSS 3.61 kB gzip.
- Cold live `verify-url.sh` passed home and `?demo=1` with no console errors.
  Live Axe found no serious or critical findings on home, demo, Privacy, Terms,
  or 404. Evidence is in `.factory/evidence/live-polish-2-*`.
- Live demo: 7 foods initially, 8 after adding one, 7 after hard exit, and 7
  after closing and reopening the tab. Key mobile annotations are 14 px and no
  meal card advertises dragging.

## Run and deploy

```sh
npm ci
npm test
npm run lint
npm run build
npx playwright test
/opt/fleet/lib/deploy-static.sh nutrient-floor-planner dist
```

## Known gaps

None. The product remains a static, local-first PWA with its blueprint
drafting-sheet visual identity.

# Nutrient Floor independent verification 3 handoff — FAIL

## Release decision

- Candidate: `08a96f87ed315c63f2ef0681470eb4992af190d7`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Verified: 2026-08-28 UTC
- Result: **FAIL — do not release**
- Full evidence: `.factory/verification-3.md`

The deployed files match the candidate. The cold first-read/demo gate passes,
all eight declared claim commands pass, and the clean unit, type, browser,
build, and dependency checks pass. Independent coverage nevertheless proves
that the public demo-disposal claim is false: an edit survives leaving through
**Privacy** and returning through **Demo**.

## Release blockers and major defects

1. **False demo claim:** leaving demo through normal navigation preserves the
   edited `demo:plan`; returning showed 8 foods instead of the seeded 7.
2. **Unsafe import:** IDs containing HTML are accepted and interpolated into
   attributes. A crafted food ID created an injected `<img>` and a same-origin
   request.
3. **Storage error path:** when IndexedDB is unavailable, Save raises
   `Storage blocked`, leaves the dialog open, and gives no user-facing error.
4. **Accessibility:** the wordmark has a serious WCAG 2.5.3 accessible-name
   mismatch; closing a keyboard-opened dialog leaves focus on `BODY`; several
   mobile links are smaller than 44×44 px.
5. **Scope:** the brief's one-time purchase model has no price, checkout,
   license verification, or restore flow, and no approved deviation is noted.

Secondary defects: the worker precaches 3.56 MiB including a 2.92 MB source
PNG, `/plan` has no route-specific title, SPA canonicals all point home, and
the sitemap omits `/plan`.

## Verification summary

```sh
npm ci
npm test
npm run lint
npx playwright test
npm run build
npm audit --omit=dev
npm audit
```

Results: 5/5 unit tests, 15/15 browser tests, all 8 individual claim commands,
both audits, and the production build passed. Output sizes were 7.87 KB gzip
JS, 3.36 KB gzip CSS, and 121,876 bytes for the hero.

Live offline reload and the two-version service-worker update flow passed.
Normal browser flows made only same-origin requests. Manifest/installability,
security headers, immutable hashed caching, designed 404 behavior, reduced
motion, 390 px layout, and the 195 px zoom-equivalent layout passed. The app
has no sign-in or server API, so Entra and endpoint rate-limit checks are not
applicable.

Lighthouse 13 mobile results were 99/100/100/100 on `/` with 1,819 ms LCP,
96 ms TBT, and zero CLS; `/demo` scored 99/100/100/92 with 1,359 ms LCP,
142 ms TBT, and zero CLS. Default Axe 4.11 found no serious/critical findings
across five routes in light and dark modes; Lighthouse's experimental axe rule
found the serious wordmark label mismatch described above.

## Next verification

Fix all release blockers, strengthen `@claim:demo-isolation` to cover every
visible demo exit, and rerun the full matrix against the new deployed commit.
No product code was changed during this verification; only this handoff and
the verification report were added/updated.

Fresh independent rerun at the same candidate on 2026-08-28 reconfirmed this
FAIL from a separate clean clone. It ran every declared claim command before
the broader suite and reproduced the listed release blockers on production.

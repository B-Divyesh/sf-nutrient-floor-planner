# Nutrient Floor adversarial review 2 handoff

## Decision: FAIL

Completed an independent, review-only pass on 2026-08-29 UTC against
<https://nutrient-floor-planner.sociobot.in> and candidate
`57a52c2b951f546ec22553542e8d25830c0d3e54`. No product code was changed.

The live first screen, one-click sample content, Reset, real-data isolation,
offline behavior, metadata, links, accessibility checks, and visual identity
mostly pass. The release remains blocked because demo edits survive hard
navigation and tab closure despite copy claiming they are not saved and are
deleted on exit. The existing test checks only in-app exits. The claim
inventory also omits the no-calorie-input promise and tests only demo for a
README claim covering both planner and demo offline use.

Additional findings cover the previously disclosed stale copy audit, indirect
section labels, nonfunctional `draggable="true"` meal cards, and 12 px mobile
annotations. Full evidence, rewrites, and the cumulative history map are in
`.factory/review-2.md`.

## Verification performed

- Cold live Chromium at 390 × 844 and 1440 × 900.
- One-click demo, edit, Reset, Start for real, pre-existing real data, request
  log, hard-navigation exit, and close/reopen exit.
- Live offline reload/edit for both `/demo` and `/plan`.
- Every `.factory/claims.json` command separately from detached clean clone
  `/tmp/nutrient-review2-clean.OWB4d1`: 13/13 passed.
- Clean-clone `npm test`: 7/7 passed.
- Clean-clone `npm run lint` and `npm run build`: passed; `dist/` produced.
- Clean-clone `npx playwright test`: 29/29 passed.
- Factory `verify-url.sh` on live home and demo: passed.
- Live Axe on home, light/dark demo, Privacy, Terms, and 404: zero
  serious/critical findings.
- Live metadata, route status, link crawl, Back/focus announcement, security
  headers, request origins, and console checks.
- Every earlier review, polish, and handoff finding rechecked live and in code.

## Reproduce the blocker

1. Open `/demo` in a fresh browser context.
2. Add a food and confirm eight food rows.
3. Leave with a hard navigation to `/` or close the tab.
4. Reopen `/demo` in the same browser context.
5. The added food and eight rows remain while the banner says **“nothing is
   saved.”**

The current `@claim:demo-isolation` command passes because it exercises only
visible in-app exits.

## Next steps

Use non-persistent demo state or otherwise clear it for every exit. Add the
missing hard-exit, no-calorie-input, and real-planner-offline claim coverage.
Address F-2-1 through F-2-4, deploy the repaired candidate, and repeat the full
adversarial review.

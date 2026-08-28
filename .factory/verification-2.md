# Independent product verification 2 — FAIL

## Candidate and verdict

- Candidate commit: `236fa35444543d0d83a149f416e9ec5b568409bc`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Verified: 2026-08-28 UTC
- Artifact: local-first offline PWA
- Product code: not modified

**FAIL — do not release.** The empty real planner has an axe **serious** WCAG
color-contrast failure: its visible **Add your first target** control is almost
indistinguishable from its background (1.03:1). The factory acceptance contract
requires zero serious/critical axe findings. The claim inventory also omits
testable visitor-facing README claims, which the claims contract defines as a
release blocker.

## First read and deployment identity

**First-read/demo gate: PASS.** A cold load says what it does: “Plan meals that
meet your nutrient targets”; who it is for: “For home cooks who want enough
fibre or protein without logging every calorie”; and what to click first:
**Try it with sample data**. That visible one-click link opens `/demo` and
immediately presents seven foods, three placed meals, three targets, the
persistent “Demo — sample data, nothing is saved” banner, **Reset demo**, and
**Start for real**.

The live deployment is the candidate build, not the earlier stale deployment.
Fresh local `dist/` and live SHA-256 values matched exactly for:

| File | SHA-256 |
| --- | --- |
| `index.html` | `493acc44270d6bebdea94e21c3b92b0f330334917ddc4c6641e42a5416fdb5fa` |
| `assets/index-OKDHUwbM.css` | `5bc2be8bdb6bd8594961b838cef93bc89605b24016a18bccc948149666b900d4` |
| `assets/index-kc9JQcei.js` | `91b0a0eef3de3ecf6a6a1900362e540ac94579827d6133bf5511fffbd651d51d` |
| `assets/hero.webp` | `b3d7303812d6a5b85ccd98d67be2e4c1f95220843963501846a385b148352bca` |

The generated worker has a build-time cache timestamp, so its cache identifier
is expected to differ between builds; its live precache list and implementation
match the generated candidate worker.

## Required claim tests

`.factory/claims.json` exists. After clean `npm ci`, every exact command listed
there was run against the product demo entry point. The full serial browser run
also passed all of them (`13/13`).

| Claim | Exact command | Result |
| --- | --- | --- |
| Seven-food plan / three meals | `npx playwright test --grep @claim:demo-week-coverage` | PASS |
| No meal data leaves device | `npx playwright test --grep @claim:local-only` | PASS |
| Works offline after setup | `npx playwright test --grep @claim:offline-use` | PASS |
| JSON export/import | `npx playwright test --grep @claim:json-transfer` | PASS |
| Local persistence | `npx playwright test --grep @claim:local-persistence` | PASS |
| Demo isolation/disposal | `npx playwright test --grep @claim:demo-isolation` | PASS |
| Print weekly sheet | `npx playwright test --grep @claim:print-week` | PASS |

### Claim inventory defect — High / release-blocking

The required cross-check found testable claims in `README.md` with no individual
claim entry and no `@claim:` test:

- “keep as many foods as you need” (an unlimited-food quantitative promise);
- “The planner has no account or paid unlock”; and
- “Values are user-entered and include a source field.”

`print-week` covers printing but does not prove the unlimited-food promise.
The claims contract requires every visitor-facing, testable claim to have its
own inventory entry and observable sandbox test. Add entries/tests or remove
the promises.

## Repository and browser checks

| Check | Result / evidence |
| --- | --- |
| Clean install | PASS — `npm ci`, 0 vulnerabilities |
| Unit tests | PASS — `npm test`, 5/5 |
| Type check | PASS — `npm run lint` (`tsc --noEmit`) |
| Exact production build | PASS — `npm run build`; produced `dist/` |
| Browser/integration suite | PASS — `npx playwright test`, 13/13 |
| Dependency audits | PASS — `npm audit` and `npm audit --omit=dev`, 0 vulnerabilities |
| Factory URL smoke check | PASS — `/opt/fleet/lib/verify-url.sh` on live `/`: HTTP 200, title, `lang=en`, one `h1`, `main`, image alt, labels, and no console/page errors |
| Lighthouse mobile, landing | PASS — Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1,351 ms; CLS 0 |
| Lighthouse mobile, empty `/plan` | Performance 100, Accessibility 96, Best Practices 100, SEO 92; its numeric accessibility score clears 95, but the serious axe finding below still blocks release |

The production bundle is within budget: JS 22.23 KB raw / 7.87 KB gzip, CSS
11.43 KB raw / 3.36 KB gzip, and hero WebP 121,876 bytes. Icons are genuine
192×192 and 512×512 images; Open Graph art is 1200×630.

## End-to-end behavior

**PASS.** In a fresh live demo context, I added a sourced food with boundary
numeric values, added a 1.25-serving meal, added targets until the five-target
limit, attempted a sixth target, imported malformed JSON, and reloaded. Results:

- sample opened at 7 foods / 3 meals / 3 targets;
- after save: 8 foods / 4 meals and coverage recalculated;
- two additions yielded exactly 5 targets; the sixth attempt showed “You can
  save up to five targets.”;
- malformed JSON showed the recovery message and did not replace data; and
- reload retained the valid 8/4/5 plan.

The dialog initially focuses its named food input; Escape closes it. Keyboard
Tab visibly focuses the skip link. SPA navigation moves focus to the target
route `h1` and announces the new title. At 390×844, the demo and all public
routes have no horizontal overflow. Reduced-motion emulation reported zero
active animations/transitions.

**PWA PASS.** On the live URL, after an online demo load and an active service
worker controller, an offline reload displayed the planner heading and usable
**Add a meal** action without console errors or foreign requests. A local
production-artifact update simulation served a changed worker version; the app
showed **An update is ready** and **Update now**, then remained controlled by a
service worker after update. This exercises the deployed update handler without
altering product code.

## Accessibility release blocker — High

Live axe 4.11 scans at 390 px produced no serious/critical violations on `/`,
`/demo`, `/privacy`, `/terms`, or dark `/plan`. The **light, empty `/plan`**
has one serious violation:

```text
color-contrast (serious)
.empty > .button.small[data-action="show-target"]
“Add your first target”
foreground #f8f4e8 on background #f6f0df = 1.03:1
required = 4.5:1
```

This is the real first-target action in the blank personal planner, not an
unused decorative element. It violates the explicit axe serious/critical and
contrast requirements. Correct the light-theme foreground/background pairing
and re-run axe on empty `/plan` as well as demo states.

## Privacy, network, policies, and routes

- PASS: live demo loading, adding data, and offline use made only same-origin
  requests; no analytics, remote nutrition catalogue, CDN font/script, account,
  or payment request was observed.
- PASS: IndexedDB namespaces are separated (`demo:plan` and `real:plan`), and
  leaving demo discards its edits. The product has no sign-in, server API, or
  product-unlock endpoint, so Entra and API rate-limit tests are not applicable.
- PASS: HSTS, `X-Content-Type-Options: nosniff`, Referrer-Policy, and a
  same-origin CSP are delivered with no normal-route CSP errors. Hashed JS/CSS/
  image assets have `Cache-Control: public, max-age=31536000, immutable`; HTML
  and worker use the appropriate short revalidation cache.
- PASS: `/demo`, `/plan`, `/privacy`, `/terms`, manifest, robots, sitemap, and
  social image returned 200. An unknown route returned the designed HTTP 404.
  Live manifest MIME was `application/manifest+json`.

## Required release work

1. Fix the empty-plan target CTA contrast and rerun axe/Lighthouse on `/plan`.
2. Add separate claims/tests for the README promises above, or remove those
   promises. Re-run every exact `claims.json` command from a clean install.
3. Re-verify the corrected commit and live deployment before release.

## Evidence locations

Temporary verifier evidence: `/tmp/nutrient-verify-url/verify.json`,
`/tmp/nutrient-lh-root.json`, and `/tmp/nutrient-lh-plan.json` in this
verification container. No product source files were changed.

# Independent product verification 3 — FAIL

## Candidate and verdict

- Candidate commit: `08a96f87ed315c63f2ef0681470eb4992af190d7`
- Live URL: <https://nutrient-floor-planner.sociobot.in>
- Verified: 2026-08-28 UTC
- Artifact: local-first offline PWA
- Product code: not modified

**FAIL — do not release.** The mandatory demo-disposal claim is false for a
normal way of leaving the demo, even though its too-narrow claim test passes.
Imported plan IDs can inject arbitrary HTML into the planner. The app also
loses keyboard focus after dialogs, fails silently when local storage is
unavailable, and omits the brief's one-time purchase model.

The production deployment is the candidate build. Local `dist/` and live
files matched byte-for-byte, except the generated service-worker timestamp;
the worker matched after normalizing that timestamp.

## Mandatory first-read and demo gate

**PASS.** A fresh desktop context at `/` showed, without scrolling:

- what it does: “Plan meals that meet your nutrient targets.”
- for whom: “For home cooks who want enough fibre or protein without logging
  every calorie.”
- what to click first: **Try it with sample data**, followed by “Loads a
  seven-food plan.”

The one-click action opens `/demo` with seven foods, three placed meals, three
targets, and the persistent demo banner. The cold load returned HTTP 200 and
had no console or page errors.

## Required claims

`.factory/claims.json` exists. After a clean `npm ci`, every exact listed
command was run individually from a detached worktree at the candidate commit.
All eight commands reported `1 passed`. A second aggregate run with tracing
reported `8 passed`; traces are under
`/tmp/nfp-qa-08a96f87/test-results/*/trace.zip` in the verifier container.

| Claim | Exact command | Declared test result | Independent outcome |
| --- | --- | --- | --- |
| Demo week coverage | `npx playwright test --grep @claim:demo-week-coverage` | PASS | PASS — 7 foods, 3 meals, 3 targets |
| Local only | `npx playwright test --grep @claim:local-only` | PASS | PASS — no cross-origin requests during local or live flows |
| Offline use | `npx playwright test --grep @claim:offline-use` | PASS | PASS — live offline reload and meal dialog worked |
| JSON transfer | `npx playwright test --grep @claim:json-transfer` | PASS | PASS for a genuine export/import |
| Local persistence | `npx playwright test --grep @claim:local-persistence` | PASS | PASS — created targets, food, and meal survived reload |
| Demo isolation/disposal | `npx playwright test --grep @claim:demo-isolation` | PASS | **FAIL** — leaving by Privacy and returning retained the edit |
| Print week | `npx playwright test --grep @claim:print-week` | PASS | PASS — browser print invoked |
| Food value/source | `npx playwright test --grep @claim:food-source` | PASS | PASS — entered value and source rendered |

### Release-blocking claim defect

The demo claim promises: “Demo data uses a separate local space and is
discarded when you leave.” The privacy page repeats that demo data “is
discarded when you leave.” In fresh local and production contexts:

1. Open `/demo` and add **Navigation beans**.
2. Use the header's **Privacy** link, which leaves demo mode.
3. Use the header's **Demo** link to return.
4. The edited demo contains 8 foods and still shows **Navigation beans**.

The declared test exercises only **Start for real**, whose handler explicitly
deletes `demo:plan`. It does not test the other visible navigation paths out of
demo mode. The public claim is therefore broader than its test and false.

## Clean build and automated checks

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 58 packages, 0 vulnerabilities |
| `npm test` | PASS — 5/5 unit tests |
| `npm run lint` | PASS — TypeScript `--noEmit` |
| `npx playwright test` | PASS — 15/15 browser tests |
| `npm run build` | PASS — `dist/` produced |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm audit` | PASS — 0 vulnerabilities |
| Factory `verify-url.sh` | PASS — 200, title/lang/main/alt, no console errors |

Production bundle output:

- JS: 22,225 bytes raw / 7.87 KB gzip
- CSS: 11,503 bytes raw / 3.36 KB gzip
- hero WebP: 121,876 bytes
- fonts: none

These pass the initial JS, CSS, hero, and font budgets.

## End-to-end behavior

### Passed

- Started a blank real plan, rejected an empty target, rejected a `0 g`
  target, and accepted the `0.1 g` minimum.
- Rejected a negative nutrient amount. Saved a sourced food with `0.2 g`
  fibre, then placed a half portion in a Tuesday meal. The exact `0.1 g`
  boundary met its floor.
- Added five targets; a sixth attempt produced “You can save up to five
  targets.”
- The targets, food, and meal survived reload. Invalid JSON syntax and an
  incomplete plan record were rejected without corrupting the saved plan.
- Canceling food deletion preserved the food and meal. Repository tests also
  covered deletion consequences, canceled meal creation, export/import, and
  print.
- Demo and real plans use different IndexedDB keys. **Start for real** clears
  demo edits as tested, but ordinary navigation does not.

### Critical — false demo-disposal claim

The independently reproduced claim failure above is release-blocking under the
claims and demo-sandbox contracts.

### High — imported plan IDs allow HTML injection

`isPlan` accepts any non-empty ID up to 80 characters, while food, target, and
meal IDs are interpolated into HTML attributes without escaping. A structurally
accepted JSON plan whose food ID contained:

```text
x"><img src="/qa-injected" alt="Injected marker
```

displayed “Plan imported,” created an actual injected `<img>` node, and caused
a request to `/qa-injected`. The CSP prevents common inline-script and foreign
image payloads, reducing exploitability, but imported files can still alter the
DOM and generate same-origin requests. Restrict ID characters and escape every
attribute insertion before accepting imported data.

### High — core storage failure has no error or recovery state

With IndexedDB unavailable, initial reading falls back to a blank plan. Saving
a valid target then raises the page error `Storage blocked`, leaves the dialog
open, and shows an empty toast. The user receives no explanation and no next
step. Storage denial and quota failure are core error paths for a local-only
PWA and must be handled visibly.

### High — accessibility regressions remain

- Default Axe 4.11 scans found zero serious/critical violations across `/`,
  `/demo`, `/plan`, `/privacy`, and `/terms` in both light and dark modes.
  Lighthouse's additional experimental axe rule did find a **serious** WCAG
  2.5.3 `label-content-name-mismatch`: visible wordmark text “NF Nutrient
  Floor” is not contained by its accessible name “Nutrient Floor home.”
- A keyboard-opened meal dialog correctly focuses **Meal name**, and Escape
  closes it, but focus then lands on `BODY` instead of returning to **Add a
  meal**. This loses the user's place.
- At 390 px, the header **Demo** link measured 28×44 px and footer **Privacy**
  and **Terms** links measured 49×14 and 35×14 px. They do not meet the required
  44×44 CSS-pixel target size.

The first Tab does reach a visible skip link. Representative focus styling is
a 3 px solid outline plus a 5 px contrasting halo. Route navigation moves
focus to the new `h1`. Native dialogs trap focus, the 195 CSS-pixel
zoom-equivalent test has no page overflow, and reduced-motion mode reported no
active transitions or animations.

### High — researched one-time purchase model is absent

The supplied brief specifies one-time monetization. The candidate has no
price, buy link, license capture/verification, restore flow, or documented
reason for deviating from that requirement. The earlier broken paid flow was
removed rather than replaced with the required Sociobot billing integration.
Because there is no product endpoint or unlock call, API rate-limit testing is
not applicable to this candidate; the missing paid path itself is the scope
finding.

### Medium — avoidable 3.56 MiB service-worker precache

The generated worker precaches 3,738,028 bytes across 14 entries. It includes
the 2,918,822-byte unoptimized `hero-source.png`, its provenance sidecar, the
482,671-byte 512 icon, the social image, robots, and sitemap, and requests both
`/` and `/index.html`. Render-critical budgets pass, but first-visit PWA setup
downloads far more than the offline product needs. Keep source artwork outside
`public/` and precache the optimized shell only.

### Medium — route metadata is incomplete

- `/plan` reuses the landing title instead of a route-specific planner title.
- Every SPA route keeps the homepage canonical. Lighthouse scored `/demo` SEO
  92 and explicitly failed `canonical` because it points to the homepage.
- `sitemap.xml` omits the real `/plan` route.

## Privacy, policies, PWA, and deployment

- Fresh local and live normal/demo flows made only same-origin requests. No
  analytics, remote font/script, nutrition upload, or other third-party call
  occurred. The crafted-import same-origin request is documented above.
- The product has no sign-in; Microsoft Entra tenant checks do not apply.
- Live headers include HSTS, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and a same-origin CSP.
  No CSP or runtime errors occurred in ordinary use.
- HTML, manifest, and worker use 30-second revalidation. Hashed JS, CSS, and
  assets use `public, max-age=31536000, immutable`. The manifest MIME is
  `application/manifest+json`.
- `/`, `/demo`, `/plan`, `/privacy`, and `/terms` return 200. A nonexistent
  path returns the designed HTTP 404. All rendered internal links resolve; the
  sole non-HTTP link is the documented `mailto:` contact.
- Manifest parsing and Chrome installability checks returned no errors. Icons
  are the declared 192×192 and 512×512; the social image is 1200×630.
- A fresh live context loaded `/demo` online, became service-worker controlled,
  reloaded offline, displayed the planner, and opened **Add a meal** with no
  errors. A two-version local production simulation showed **An update is
  ready**, applied **Update now**, rendered the second shell, removed the old
  cache, and remained controlled.

Deployment identity hashes:

| File | SHA-256 |
| --- | --- |
| `index.html` | `ed1f093578774a93d47e07f7c2bce5c4174ad32d264e82c23a752024b307175b` |
| JS | `91b0a0eef3de3ecf6a6a1900362e540ac94579827d6133bf5511fffbd651d51d` |
| CSS | `c7fef402a8ae8d7c0babc8f5312a194c215fb77121118b14da6dc46f83c5c2d0` |
| Hero | `b3d7303812d6a5b85ccd98d67be2e4c1f95220843963501846a385b148352bca` |
| Normalized worker | `c6443f309c296c7fb0413e5446d10504f35183d8aefd7318a63d2129523b0491` |

## Performance and visual evidence

Lighthouse 13 mobile against production:

| Route | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 99 | 100 | 100 | 100 | 1,819 ms | 96 ms | 0 |
| `/demo` | 99 | 100 | 100 | 92 | 1,359 ms | 142 ms | 0 |

INP is unavailable in a navigation-only lab run; max potential input delay was
140 ms on `/` and 190 ms on `/demo`. Desktop and 390×844 mobile were visually
inspected with no page-level horizontal overflow. Evidence files in this
container include `/tmp/nfp-first-read-desktop.png`,
`/tmp/nfp-live-mobile-demo.png`, `/tmp/nfp-verify-url/verify.json`,
`/tmp/nfp-lh-root.json`, and `/tmp/nfp-lh-demo.json`.

## Required release work

1. Make every route out of demo discard the demo namespace, or narrow the
   public claim and test every promised exit path.
2. Reject unsafe imported IDs and escape all values used in HTML attributes.
3. Handle IndexedDB write failures with a plain, announced recovery message.
4. Restore dialog focus, fix the accessible wordmark name and 44×44 targets,
   then rerun standard and experimental axe rules.
5. Implement the brief's one-time Sociobot purchase/restore flow, or document
   and approve a scope change.
6. Trim the worker precache and correct route titles, canonicals, and sitemap.

Re-run independent verification on the repaired commit and its deployment.

## Fresh verifier rerun confirmation

This report was independently rerun from a separate clean detached clone at
`08a96f87ed315c63f2ef0681470eb4992af190d7` on 2026-08-28 UTC. All eight
exact claim commands passed again before the broader suite; `npm test` (5/5),
`npm run lint`, `npx playwright test` (15/15), `npm run build`, and both npm
audits passed. Fresh production checks again reproduced the demo data retained
after Privacy → Demo (8 foods), imported-ID markup rendering (one same-origin
marker request), unavailable-IndexedDB error, lost Escape focus, and undersize
mobile links. The production hashes in this report were freshly recalculated
and still match the candidate build.

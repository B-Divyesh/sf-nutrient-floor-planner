# Nutrient Floor review 4 handoff — FAIL

## What was done

An independent adversarial first-read review was completed against the live
site and clean clone `0883d3c12a7ce705b2c597535e09d5bb6eb0a8a0`. Product code
was not modified. The report is in [review-4.md](review-4.md).

## Verification

- Fresh 390 px and desktop live first reads were clear and actionable.
- The live one-click demo, reset, real-plan exit, same-origin request log, and
  offline reload/edit behavior were checked.
- A clean clone passed `npm ci`, `npm test`, `npm run lint`, `npm run build`,
  all 16 exact claims commands, and the full 40-test Playwright suite.
- Routes, titles, metadata, links, focus/back behavior, 404, and visual
  identity were checked live.

## Remaining gap

The result is **FAIL** on F-4-1 only. The landing preview states that 40 g
fibre is above a 30 g floor and 75.5 g protein is above a 75 g floor, but no
matching claims entry/test verifies the sample floor values and pass states.
Add a `sample-floor-status` claim and observable `/demo` test, or remove those
status statements.

## Run

```sh
npm ci
npm test
npm run lint
npm run build
npx playwright test --reporter=line
```

# Nutrient Floor

Plan meals that meet your nutrient targets.

For home cooks who want more fibre or protein, or less sugar, without a calorie diary.
Save your foods, choose weekly floors or limits, and place meals on a week.

Try the sample plan at `/?demo=1` or `/demo`. It opens with seven foods, three
meals, and three targets. Demo changes use separate browser storage. They never
touch your real plan. Leaving the demo deletes its changes.

## Run locally

```sh
npm ci
npm run dev
```

Open `http://localhost:5173`. Use **Start for real**, or open `/plan`, to create
your plan.

## Run checks

```sh
npm test
npm run lint
npx playwright test
npm run build
```

The build output is `dist/`, with `index.html` at its root. Deploy it as a
static single-page application. Keep the included `staticwebapp.config.json`.

## Data and privacy

Foods, targets, and meals stay in browser storage on your device. The planner
uses no analytics and sends no meal data elsewhere. You can export or import
the complete plan as JSON.

The planner and demo work offline after setup. You can also print the weekly
plan. Read `/privacy` and `/terms` for details.

## How totals work

You enter each food value and its source. The planner compares those values
with the targets you choose. It does not supply recommended target values.
Check labels before relying on a total.

## Claims verified in the demo

- The sample opens with seven foods, three placed meals, and three targets.
- The sample week totals 40 g fibre and 75.5 g protein.
- The planner uses no analytics and sends no meal data elsewhere.
- The planner works offline after setup.
- You can export or import your complete plan.
- Your plan stays on this device.
- Demo changes stay separate and are deleted when you leave.
- The planner saves up to five targets.
- The planner prints a weekly plan.
- Food values are entered by you and saved with a source.
- The planner compares entered food values with targets you choose.
- The planner does not supply recommended target values.

Every claim and its exact Playwright command is in `.factory/claims.json`.

# Nutrient Floor

Plan meals that meet your nutrient targets.

Nutrient Floor is for home cooks who want to clear a fibre or protein floor,
or keep sugar below a limit, without keeping a calorie diary. It stores a small
trusted food list and weekly meal plan in the browser on your device.

Try the isolated sample plan at `/demo` or `/?demo=1`. It loads seven foods,
three meals, and three targets. Demo changes use a separate IndexedDB namespace
and never touch your real plan.

## Run

```sh
npm ci
npm run dev
```

Open `http://localhost:5173`. Use **Start for real** in the demo, or open
`/plan`, to create a private plan. Values are user-entered and include a source
field; check labels before relying on a value.

## Verify

```sh
npm test
npm run lint
npx playwright test
npm run build
```

The build output is `dist/`, with `index.html` at its root. Deploy it as a
static single-page application and preserve the included `staticwebapp.config.json`.

## Data and privacy

Food values, targets, and meals are stored in IndexedDB on your device. Export
or import the full plan as JSON. Nutrient Floor has no analytics or food
catalogue network calls. The demo and normal planner work offline after setup.

The planner has no account or paid unlock. You can print the weekly sheet and
keep as many foods as you need. See `/privacy` and `/terms`.

## Claims verified in the demo

- Loads a seven-food plan with three placed meals.
- No meal data leaves this device.
- Works offline after setup.
- Export or import your plan.
- Your plan stays on this device.
- Demo data uses a separate local space and is discarded when you leave.
- Prints a weekly sheet.

Each claim and its Playwright command are recorded in `.factory/claims.json`.

# Copy audit

Audited 2026-08-29. Counts split on visible words. No sentence exceeds 22
words, and no banned marketing word appears. `npm test` runs
`scripts/check-copy-audit.mjs` and fails if any audited landing string drifts.

## Landing page

| Visible text | Words | Result |
| --- | ---: | --- |
| Private meal planner | 3 | pass |
| Plan meals that meet your nutrient targets. | 7 | pass |
| For home cooks who want enough fibre or protein without logging every calorie. | 13 | pass |
| Try it with sample data | 5 | pass |
| Loads seven foods, three meals, and three targets. | 8 | pass |
| Free to use | 3 | pass |
| Stored on this device | 4 | pass |
| Works offline after setup | 4 | pass |
| Ingredients arranged across a blue kitchen planning sheet. | 8 | pass |
| Sample weekly nutrient totals | 4 | pass |
| Save familiar foods, choose targets, and place meal portions on a week. | 12 | pass |
| Fibre | 1 | pass |
| 40 g | 2 | pass |
| above the 30 g floor | 5 | pass |
| Protein | 1 | pass |
| 75.5 g | 2 | pass |
| above the 75 g floor | 5 | pass |
| Plan a week in three steps | 6 | pass |
| Set a target | 3 | pass |
| Choose a floor or limit in grams. | 7 | pass |
| Save your foods | 3 | pass |
| Enter values and a source from the label. | 8 | pass |
| Place meals | 2 | pass |
| See gaps before you cook. | 5 | pass |
| How your food values are used | 6 | pass |
| The planner compares your food values with your targets. | 9 | pass |
| Check labels before relying on the totals. | 7 | pass |
| Private meal planning around your nutrient targets. | 7 | pass |

Navigation, footer link labels, the factory credit, and version are short
labels rather than sentences. They use direct names: Demo, Planner, Privacy,
Terms, Built by Param Factory, and v1.4.

## Terminology

| Concept | Product word |
| --- | --- |
| Minimum weekly nutrient target | floor |
| Maximum weekly nutrient target | limit |
| Planned dish | meal |
| Saved ingredient with values | food |
| Quantity of a food in a meal | portion |
| Values copied from a package or reference | food values |
| Isolated sample workspace | demo |

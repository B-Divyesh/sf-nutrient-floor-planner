import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const [source, audit] = await Promise.all([
  readFile(`${root}src/main.ts`, 'utf8'),
  readFile(`${root}.factory/copy-audit.md`, 'utf8')
]);

// Keep this list deliberately visible and literal. Any landing-copy edit must
// update the proof-of-simplicity record in the same change.
const landingCopy = [
  'Private meal planner',
  'Plan meals that meet your nutrient targets.',
  'For home cooks who want enough fibre or protein without logging every calorie.',
  'Try it with sample data',
  'Loads seven foods, three meals, and three targets.',
  'Free to use',
  'Stored on this device',
  'Works offline after setup',
  'Ingredients arranged across a blue kitchen planning sheet.',
  'Foods arranged on a kitchen planning illustration.',
  'Sample weekly nutrient totals',
  'Save familiar foods, choose targets, and place meal portions on a week.',
  'Fibre',
  '40 g',
  'above the 30 g floor',
  'Protein',
  '75.5 g',
  'above the 75 g floor',
  'Plan a week in three steps',
  'Set a target',
  'Choose a floor or limit in grams.',
  'Save your foods',
  'Enter values and a source from the label.',
  'Place meals',
  'See gaps before you cook.',
  'How your food values are used',
  'The planner compares your food values with your targets.',
  'Check labels before relying on the totals.',
  'Private meal planning around your nutrient targets.'
];

const missingFromSource = landingCopy.filter(copy => !source.toLowerCase().includes(copy.toLowerCase()));
const missingFromAudit = landingCopy.filter(copy => !audit.includes(copy));
if (missingFromSource.length || missingFromAudit.length) {
  const details = [
    missingFromSource.length && `missing from source: ${missingFromSource.join(' | ')}`,
    missingFromAudit.length && `missing from audit: ${missingFromAudit.join(' | ')}`
  ].filter(Boolean).join('\n');
  throw new Error(`Landing copy audit drifted.\n${details}`);
}

if (source.includes('draggable=')) {
  throw new Error('Meal cards advertise browser dragging without a supported drop interaction.');
}

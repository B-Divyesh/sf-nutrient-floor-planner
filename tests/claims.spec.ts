import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function addFood(page: import('@playwright/test').Page, name = 'Test beans') {
  await page.getByRole('button', { name: 'Add food' }).click();
  await expect(page.getByRole('dialog', { name: 'Add a food and its serving.' })).toBeVisible();
  await page.getByLabel('Food name').fill(name);
  await page.getByRole('textbox', { name: 'Serving Example: ½ cup dry' }).fill('1 cup');
  await page.getByLabel('Source or label').fill('Package label');
  await page.getByRole('button', { name: 'Save food' }).click();
  await expect(page.getByText(name)).toBeVisible();
}

async function addTarget(page: import('@playwright/test').Page, name: string) {
  await page.getByRole('button', { name: 'Add target' }).click();
  await expect(page.getByRole('dialog', { name: 'Add a nutrient floor or limit.' })).toBeVisible();
  await page.getByLabel('Target name').fill(name);
  await page.getByLabel('Grams per week').fill('10');
  await page.getByRole('button', { name: 'Save target' }).click();
  await expect(page.getByText(name, { exact: true })).toBeVisible();
}

function planWithFoods(count: number) {
  return {
    targets: [],
    foods: Array.from({ length: count }, (_, index) => ({
      id: `food-${index + 1}`,
      name: `Imported food ${index + 1}`,
      serving: '1 cup',
      source: 'Package label',
      nutrients: { fibre: 1, protein: 1, sugar: 0, saturatedFat: 0 }
    })),
    meals: [],
    updatedAt: new Date().toISOString()
  };
}

async function importPlan(page: import('@playwright/test').Page, plan: object) {
  await page.getByLabel('Import plan').setInputFiles({
    name: 'plan.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(plan))
  });
}

async function readExport(page: Page) {
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export plan' }).click();
  const exported = await download;
  const stream = await exported.createReadStream();
  let text = '';
  for await (const part of stream!) text += part.toString();
  return { text, plan: JSON.parse(text) };
}

async function createPersistedBaselinePlan(page: Page) {
  await page.goto('/plan');
  await addFood(page, 'Baseline food');
  await addTarget(page, 'Baseline target');
  await page.getByRole('button', { name: 'Add a meal' }).first().click();
  await page.getByLabel('Meal name').fill('Baseline meal');
  await page.getByLabel('Baseline food per 1 cup').fill('1');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await expect(page.locator('.food')).toHaveCount(1);
  await expect(page.locator('.target')).toHaveCount(1);
  await expect(page.locator('.meal')).toHaveCount(1);
}

test('@claim:demo-week-coverage loads a seven-food plan with three placed meals', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Build a week that meets your targets.' })).toBeVisible();
  await expect(page.locator('.food')).toHaveCount(7);
  await expect(page.locator('.meal')).toHaveCount(3);
  await expect(page.locator('.target')).toHaveCount(3);
  await expect(page.getByText('Fibre floor')).toBeVisible();
});

test('@claim:sample-totals shows the calculated fibre and protein totals', async ({ page }) => {
  await page.goto('/');
  const preview = page.locator('.mini-board');
  await expect(preview).toContainText('40 g');
  await expect(preview).toContainText('75.5 g');
  await page.goto('/?demo=1');
  await expect(page.getByText('40 g', { exact: true })).toBeVisible();
  await expect(page.getByText('75.5 g', { exact: true })).toBeVisible();
});

test('@claim:sample-floor-status shows both sample floors and their passing results', async ({ page }) => {
  await page.goto('/');
  const preview = page.locator('.mini-board');
  await expect(preview).toContainText('40 g');
  await expect(preview).toContainText('above the 30 g floor');
  await expect(preview).toContainText('75.5 g');
  await expect(preview).toContainText('above the 75 g floor');

  await page.goto('/demo');
  const fibre = page.locator('.target', { hasText: 'Fibre floor' });
  await expect(fibre).toHaveClass(/pass/);
  await expect(fibre.getByText('floor · 30 g', { exact: true })).toBeVisible();
  await expect(fibre.getByText('40 g', { exact: true })).toBeVisible();
  await expect(fibre.getByText('on plan', { exact: true })).toBeVisible();
  await expect(fibre.getByRole('meter')).toHaveAccessibleName('Fibre floor: 40 grams against a 30 gram floor, on plan');

  const protein = page.locator('.target', { hasText: 'Protein floor' });
  await expect(protein).toHaveClass(/pass/);
  await expect(protein.getByText('floor · 75 g', { exact: true })).toBeVisible();
  await expect(protein.getByText('75.5 g', { exact: true })).toBeVisible();
  await expect(protein.getByText('on plan', { exact: true })).toBeVisible();
  await expect(protein.getByRole('meter')).toHaveAccessibleName('Protein floor: 75.5 grams against a 75 gram floor, on plan');
});

test('@claim:local-only demo sends no data off this origin', async ({ page }) => {
  const foreign: string[] = [];
  const dataTransfers: string[] = [];
  const requestsAfterLoad: string[] = [];
  let loaded = false;
  page.on('request', request => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') foreign.push(request.url());
    if (['fetch', 'xhr', 'eventsource', 'websocket', 'ping'].includes(request.resourceType())) dataTransfers.push(request.url());
    if (loaded) requestsAfterLoad.push(request.url());
  });
  await page.goto('/demo');
  loaded = true;
  await addFood(page);
  expect(foreign).toEqual([]);
  expect(dataTransfers).toEqual([]);
  expect(requestsAfterLoad).toEqual([]);
});

test('@claim:offline-use reloads and stays usable offline after setup in the demo and planner', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Build a week that meets your targets.' })).toBeVisible();
  await page.getByRole('button', { name: 'Add a meal' }).first().click();
  await expect(page.getByRole('dialog', { name: 'Add a meal.' })).toBeVisible();
  await page.keyboard.press('Escape');
  await context.setOffline(false);
  await page.goto('/plan');
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Build a week that meets your targets.' })).toBeVisible();
  await page.getByRole('button', { name: 'Add a meal' }).first().click();
  await expect(page.getByRole('dialog', { name: 'Add a meal.' })).toBeVisible();
});

test('an activated service worker removes the previous cache before reloading', async ({ browser }) => {
  const workerPath = resolve('dist/sw.js');
  const originalWorker = await readFile(workerPath, 'utf8');
  const initialCache = originalWorker.match(/const CACHE = '([^']+)'/)?.[1];
  expect(initialCache).toBeTruthy();
  const updatedCache = `${initialCache}-update-test`;
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('/demo');
    await page.evaluate(() => navigator.serviceWorker.ready);
    if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await expect.poll(() => page.evaluate(() => caches.keys())).toEqual([initialCache]);

    await writeFile(workerPath, originalWorker.replace(initialCache!, updatedCache));
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
    const updateButton = page.getByRole('button', { name: 'Update now' });
    await expect(updateButton).toBeVisible();
    await Promise.all([
      page.waitForEvent('framenavigated', frame => frame === page.mainFrame()),
      updateButton.click()
    ]);

    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await expect.poll(() => page.evaluate(() => caches.keys())).toEqual([updatedCache]);
    await expect(page.getByRole('heading', { name: 'Build a week that meets your targets.' })).toBeVisible();
  } finally {
    await writeFile(workerPath, originalWorker);
    await context.close();
  }
});

test('@claim:json-transfer exports and reimports the complete plan as JSON', async ({ page }) => {
  await page.goto('/demo');
  const exported = await readExport(page);
  expect(exported.plan.foods).toHaveLength(7);
  expect(exported.plan.targets).toHaveLength(3);
  expect(exported.plan.meals).toHaveLength(3);

  await page.goto('/plan');
  await page.getByLabel('Import plan').setInputFiles({ name: 'plan.json', mimeType: 'application/json', buffer: Buffer.from(exported.text) });
  await expect(page.getByText('Plan imported.')).toBeVisible();
  const reexported = await readExport(page);
  expect(reexported.plan).toEqual(exported.plan);
});

test('@claim:local-persistence saves foods, targets, and meal portions through a reload', async ({ page }) => {
  await page.goto('/plan');
  await page.getByRole('button', { name: 'Add food' }).click();
  await page.getByLabel('Food name').fill('Persistent beans');
  await page.getByRole('textbox', { name: 'Serving Example: ½ cup dry' }).fill('¾ cup');
  await page.getByLabel('Source or label').fill('Jar label');
  await page.locator('input[name="fibre"]').fill('7.5');
  await page.locator('input[name="protein"]').fill('3.5');
  await page.getByRole('button', { name: 'Save food' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Add target' }).click();
  await page.getByLabel('Target name').fill('Weekly bean fibre');
  await page.getByLabel('Grams per week').fill('10');
  await page.getByRole('button', { name: 'Save target' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Add a meal' }).first().click();
  await page.getByLabel('Meal name').fill('Bean lunch');
  await page.getByLabel('Persistent beans per ¾ cup').fill('1.5');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await expect(page.getByRole('button', { name: 'Bean lunch', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Persistent beans', { exact: true })).toBeVisible();
  await expect(page.getByText('per ¾ cup · Jar label')).toBeVisible();
  await expect(page.getByText('7.5g fibre')).toBeVisible();
  const target = page.locator('.target', { hasText: 'Weekly bean fibre' });
  await expect(target.getByText('floor · 10 g', { exact: true })).toBeVisible();
  await expect(target.getByText('11.25 g', { exact: true })).toBeVisible();
  await expect(target.getByText('on plan', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Bean lunch', exact: true })).toBeVisible();
  await expect(page.locator('.meal', { hasText: 'Bean lunch' })).toContainText('1.5× Persistent beans');
});

test('@claim:demo-isolation resets demo edits after visible exits, hard navigation, and tab closure', async ({ page, browser }) => {
  const exits = [
    async () => page.getByRole('button', { name: 'Start for real' }).click(),
    async () => page.getByRole('link', { name: 'Planner', exact: true }).click(),
    async () => page.getByRole('link', { name: 'Privacy' }).first().click(),
    async () => page.getByRole('link', { name: 'NF Nutrient Floor' }).click(),
    async () => page.getByRole('link', { name: 'Terms' }).click()
  ];
  for (const leave of exits) {
    await page.goto('/demo');
    await addFood(page, 'Demo-only beans');
    await leave();
    await expect(page).not.toHaveURL(/\/demo$/);
    await page.goto('/demo');
    await expect(page.locator('.food')).toHaveCount(7);
    await expect(page.getByText('Demo-only beans')).toHaveCount(0);
  }
  await page.goto('/demo');
  await addFood(page, 'Reloaded-page beans');
  await page.reload();
  await expect(page.locator('.food')).toHaveCount(7);
  await expect(page.getByText('Reloaded-page beans')).toHaveCount(0);

  await page.goto('/demo');
  await addFood(page, 'Hard-navigation beans');
  await page.goto('/');
  await page.goto('/demo');
  await expect(page.locator('.food')).toHaveCount(7);
  await expect(page.getByText('Hard-navigation beans')).toHaveCount(0);

  await addFood(page, 'Closed-tab beans');
  const context = page.context();
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto('/demo');
  await expect(reopened.locator('.food')).toHaveCount(7);
  await expect(reopened.getByText('Closed-tab beans')).toHaveCount(0);
  await reopened.close();
});

test('@claim:demo-reset restores the bundled sample without touching real data', async ({ page }) => {
  await page.goto('/plan');
  await addFood(page, 'Real-plan beans');
  await page.goto('/?demo=1');
  await addFood(page, 'Demo-only beans');
  await expect(page.locator('.food')).toHaveCount(8);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('.food')).toHaveCount(7);
  await expect(page.getByText('Demo-only beans')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page.getByText('Real-plan beans')).toBeVisible();
});

test('@claim:free-to-use ignores a legacy forged token and does not gate foods', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sb_license:nutrient-floor-planner', 'forged-review-token'));
  await page.goto('/plan');
  await importPlan(page, planWithFoods(11));
  await expect(page.locator('.food')).toHaveCount(11);
  await addFood(page, 'Twelfth food');
  await expect(page.locator('.food')).toHaveCount(12);
  await expect(page.getByText(/upgrade|license|purchase/i)).toHaveCount(0);
  await expect(page.locator('a[href*="api.sociobot.in"]')).toHaveCount(0);
});

test('@claim:target-cap blocks a sixth target after five saves', async ({ page }) => {
  await page.goto('/plan');
  for (let index = 1; index <= 5; index++) await addTarget(page, `Target ${index}`);
  await expect(page.locator('.target')).toHaveCount(5);
  await page.getByRole('button', { name: 'Add target' }).click();
  await expect(page.getByRole('status')).toContainText('You can save up to 5 targets.');
  await expect(page.getByRole('dialog', { name: 'Add a nutrient floor or limit.' })).toHaveCount(0);
  await expect(page.locator('.target')).toHaveCount(5);
});

test('@claim:print-week invokes the browser print action', async ({ page }) => {
  await page.addInitScript(() => { (window as Window & { printed?: number }).print = () => { window.printed = (window.printed || 0) + 1; }; });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Print week' }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { printed?: number }).printed)).toBe(1);
});

test('@claim:food-source saves user-entered food values with their source', async ({ page }) => {
  await page.goto('/plan');
  await page.getByRole('button', { name: 'Add food' }).click();
  await page.getByLabel('Food name').fill('Labelled beans');
  await page.getByRole('textbox', { name: 'Serving Example: ½ cup dry' }).fill('1 cup');
  await page.getByLabel('Source or label').fill('Tin label');
  await page.locator('input[name="fibre"]').fill('7.5');
  await page.getByRole('button', { name: 'Save food' }).click();
  await expect(page.getByText('per 1 cup · Tin label')).toBeVisible();
  await expect(page.getByText('7.5g fibre')).toBeVisible();
});

test('@claim:target-comparison compares floors and limits with short, on-plan, within-limit, and over-limit states', async ({ page }) => {
  await page.goto('/plan');
  await page.getByRole('button', { name: 'Add food' }).click();
  await page.getByLabel('Food name').fill('Fibre and sugar cereal');
  await page.getByRole('textbox', { name: 'Serving Example: ½ cup dry' }).fill('1 bowl');
  await page.getByLabel('Source or label').fill('Box label');
  await page.locator('input[name="fibre"]').fill('8');
  await page.locator('input[name="sugar"]').fill('3');
  await page.getByRole('button', { name: 'Save food' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  for (const target of [
    { label: 'Fibre floor gap', key: 'Fibre', kind: 'Minimum floor', value: '20' },
    { label: 'Fibre floor met', key: 'Fibre', kind: 'Minimum floor', value: '16' },
    { label: 'Sugar limit met', key: 'Sugar', kind: 'Maximum limit', value: '6' },
    { label: 'Sugar limit gap', key: 'Sugar', kind: 'Maximum limit', value: '5' }
  ]) {
    await page.getByRole('button', { name: 'Add target' }).click();
    await page.getByLabel('Target name').fill(target.label);
    await page.locator('dialog select[name="key"]').selectOption({ label: target.key });
    await page.locator('dialog select[name="kind"]').selectOption({ label: target.kind });
    await page.getByLabel('Grams per week').fill(target.value);
    await page.getByRole('button', { name: 'Save target' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
  await page.getByRole('button', { name: 'Add a meal' }).first().click();
  await page.getByLabel('Meal name').fill('Cereal breakfast');
  await page.getByLabel('Fibre and sugar cereal per 1 bowl').fill('2');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await expect(page.getByRole('button', { name: 'Cereal breakfast', exact: true })).toBeVisible();

  const floorGap = page.locator('.target', { hasText: 'Fibre floor gap' });
  await expect(floorGap).toHaveClass(/gap/);
  await expect(floorGap.getByText('16 g', { exact: true })).toBeVisible();
  await expect(floorGap.getByText('4 g short', { exact: true })).toBeVisible();
  await expect(floorGap.getByRole('meter')).toHaveAccessibleName('Fibre floor gap: 16 grams against a 20 gram floor, 4 g short');

  const floorMet = page.locator('.target', { hasText: 'Fibre floor met' });
  await expect(floorMet).toHaveClass(/pass/);
  await expect(floorMet.getByText('on plan', { exact: true })).toBeVisible();

  const limitMet = page.locator('.target', { hasText: 'Sugar limit met' });
  await expect(limitMet).toHaveClass(/pass/);
  await expect(limitMet.getByText('6 g', { exact: true })).toBeVisible();
  await expect(limitMet.getByText('on plan', { exact: true })).toBeVisible();

  const limitGap = page.locator('.target', { hasText: 'Sugar limit gap' });
  await expect(limitGap).toHaveClass(/gap/);
  await expect(limitGap.getByText('1 g over', { exact: true })).toBeVisible();
  await expect(limitGap.getByRole('meter')).toHaveAccessibleName('Sugar limit gap: 6 grams against a 5 gram limit, 1 g over');
});

test('food and target edits preserve meal portions, return focus, recalculate totals, and persist', async ({ page }) => {
  await page.goto('/plan');
  await page.getByRole('button', { name: 'Add food' }).click();
  await page.getByLabel('Food name').fill('Editable lentils');
  await page.getByRole('textbox', { name: 'Serving Example: ½ cup dry' }).fill('1 cup');
  await page.getByLabel('Source or label').fill('Tin label');
  await page.locator('input[name="fibre"]').fill('8');
  await page.getByRole('button', { name: 'Save food' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Add target' }).click();
  await page.getByLabel('Target name').fill('Editable fibre floor');
  await page.getByLabel('Grams per week').fill('10');
  await page.getByRole('button', { name: 'Save target' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Add a meal' }).first().click();
  await page.getByLabel('Meal name').fill('Lentil lunch');
  await page.getByLabel('Editable lentils per 1 cup').fill('1');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await expect(page.getByRole('button', { name: 'Lentil lunch', exact: true })).toBeVisible();

  const editFood = page.getByRole('button', { name: 'Edit Editable lentils' });
  await editFood.focus();
  await expect(editFood).toBeFocused();
  await page.keyboard.press('Enter');
  const foodDialog = page.getByRole('dialog', { name: 'Edit this food and its serving.' });
  await expect(foodDialog).toBeVisible();
  await expect(page.getByLabel('Food name')).toHaveValue('Editable lentils');
  await expect(page.getByLabel('Source or label')).toHaveValue('Tin label');
  await expect(page.locator('input[name="fibre"]')).toHaveValue('8');
  await page.getByLabel('Food name').fill('Corrected lentils');
  await page.getByLabel('Source or label').fill('Corrected label');
  await page.locator('input[name="fibre"]').fill('12');
  await page.getByRole('button', { name: 'Save food changes' }).click();
  await expect(page.getByRole('button', { name: 'Edit Corrected lentils' })).toBeFocused();
  await expect(page.locator('.meal', { hasText: 'Lentil lunch' })).toContainText('1× Corrected lentils');
  await expect(page.locator('.target', { hasText: 'Editable fibre floor' }).getByText('12 g', { exact: true })).toBeVisible();

  const editTarget = page.getByRole('button', { name: 'Edit Editable fibre floor' });
  await editTarget.click();
  const targetDialog = page.getByRole('dialog', { name: 'Edit this nutrient floor or limit.' });
  await expect(targetDialog).toBeVisible();
  await expect(page.getByLabel('Target name')).toHaveValue('Editable fibre floor');
  await expect(targetDialog.locator('select[name="key"]')).toHaveValue('fibre');
  await expect(targetDialog.locator('select[name="kind"]')).toHaveValue('min');
  await expect(page.getByLabel('Grams per week')).toHaveValue('10');
  await page.getByLabel('Target name').fill('Corrected fibre floor');
  await page.getByLabel('Grams per week').fill('13');
  await page.getByRole('button', { name: 'Save target changes' }).click();
  await expect(page.getByRole('button', { name: 'Edit Corrected fibre floor' })).toBeFocused();
  await expect(page.locator('.target', { hasText: 'Corrected fibre floor' }).getByText('1 g short', { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText('Corrected lentils', { exact: true })).toBeVisible();
  await expect(page.getByText('per 1 cup · Corrected label')).toBeVisible();
  await expect(page.locator('.meal', { hasText: 'Lentil lunch' })).toContainText('1× Corrected lentils');
  await expect(page.locator('.target', { hasText: 'Corrected fibre floor' }).getByText('1 g short', { exact: true })).toBeVisible();
});

for (const threshold of [
  {
    name: 'maximum',
    target: { id: 'tiny-sugar', key: 'sugar', label: 'Tiny sugar limit', value: 0.1, kind: 'max', unit: 'g' },
    amount: 1.25,
    total: '0.125 g',
    difference: '0.025 g over',
    accessibleName: 'Tiny sugar limit: 0.125 grams against a 0.1 gram limit, 0.025 g over'
  },
  {
    name: 'minimum',
    target: { id: 'tiny-fibre', key: 'fibre', label: 'Tiny fibre floor', value: 0.1, kind: 'min', unit: 'g' },
    amount: 0.75,
    total: '0.075 g',
    difference: '0.025 g short',
    accessibleName: 'Tiny fibre floor: 0.075 grams against a 0.1 gram floor, 0.025 g short'
  }
] as const) {
  test(`uses one precision policy at the 0.1 times ${threshold.amount} ${threshold.name} threshold`, async ({ page }) => {
    await page.goto('/plan');
    const nutrient = threshold.target.key;
    await importPlan(page, {
      targets: [threshold.target],
      foods: [{
        id: `tiny-${nutrient}-food`,
        name: `Tiny ${nutrient} food`,
        serving: '1 serving',
        source: 'Package label',
        nutrients: { fibre: nutrient === 'fibre' ? 0.1 : 0, protein: 0, sugar: nutrient === 'sugar' ? 0.1 : 0, saturatedFat: 0 }
      }],
      meals: [{ id: `tiny-${nutrient}-meal`, name: `Tiny ${nutrient} meal`, day: 0, portions: [{ foodId: `tiny-${nutrient}-food`, amount: threshold.amount }] }],
      updatedAt: new Date().toISOString()
    });

    const row = page.locator('.target', { hasText: threshold.target.label });
    await expect(row).toHaveClass(/gap/);
    await expect(row.getByText(threshold.total, { exact: true })).toBeVisible();
    await expect(row.getByText(threshold.difference, { exact: true })).toBeVisible();
    await expect(row.getByRole('meter')).toHaveAccessibleName(threshold.accessibleName);
  });
}

test('@claim:user-chosen-targets starts without recommended target values', async ({ page }) => {
  await page.goto('/plan');
  await page.getByRole('button', { name: 'Add your first target' }).click();
  await expect(page.getByLabel('Grams per week')).toHaveValue('');
  await expect(page.getByText(/recommended|diagnosis|medical target/i)).toHaveCount(0);
});

test('@claim:no-calorie-input plans a meal with supported nutrient values and no calorie field', async ({ page }) => {
  await page.goto('/plan');
  await page.getByRole('button', { name: 'Add food' }).click();
  await expect(page.getByLabel(/calories/i)).toHaveCount(0);
  await page.getByLabel('Food name').fill('No-calorie lentils');
  await page.getByRole('textbox', { name: 'Serving Example: ½ cup dry' }).fill('1 cup');
  await page.getByLabel('Source or label').fill('Tin label');
  await page.locator('input[name="fibre"]').fill('8');
  await page.getByRole('button', { name: 'Save food' }).click();
  await addTarget(page, 'Fibre target');
  await page.getByRole('button', { name: 'Add a meal' }).first().click();
  await page.getByLabel('Meal name').fill('Lentil lunch');
  await page.getByLabel('No-calorie lentils per 1 cup').fill('1');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await expect(page.getByText('8 g', { exact: true })).toBeVisible();
});

test('@claim:build-output produces a complete dist/index.html app shell', async () => {
  const builtHtml = await readFile(resolve('dist/index.html'), 'utf8');
  expect(builtHtml).toContain('<!doctype html>');
  expect(builtHtml).toContain('<div id="app"></div>');
  expect(builtHtml).toMatch(/<script type="module" crossorigin src="\/assets\/index-[^"]+\.js"><\/script>/);
});

test('empty light planner has no serious or critical axe violations', async ({ page }) => {
  await page.goto('/plan');
  await expect(page.getByRole('button', { name: 'Add your first target' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add your first target' })).toHaveCSS('color', 'rgb(16, 40, 58)');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(violation => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});

test('rejects invalid imports before storage and remains recoverable after reload', async ({ page }) => {
  await page.goto('/plan');
  await page.getByLabel('Import plan').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"foods":[{}],"targets":[],"meals":[],"updatedAt":"x"}') });
  await expect(page.getByText('That file is not a valid Nutrient Floor plan. Choose an exported JSON file.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Build a week that meets your targets.' })).toBeVisible();
});

test('rejects an overflowing food value with a field-specific recovery message and never persists a false pass', async ({ page }) => {
  await page.goto('/plan');
  await page.getByRole('button', { name: 'Add your first target' }).click();
  await page.getByLabel('Target name').fill('Boundary fibre');
  await page.getByLabel('Grams per week').fill('30');
  await page.getByRole('button', { name: 'Save target' }).click();
  await expect(page.getByText('Boundary fibre', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Add food' }).click();
  await page.getByLabel('Food name').fill('Boundary food');
  await page.getByRole('textbox', { name: 'Serving Example: ½ cup dry' }).fill('1 serving');
  await page.getByLabel('Source or label').fill('Test label');
  const fibre = page.locator('dialog input[name="fibre"]');
  await fibre.fill('1e308');
  expect(await fibre.evaluate(input => ({ valid: input.validity.valid, rangeOverflow: input.validity.rangeOverflow }))).toEqual({ valid: false, rangeOverflow: true });
  await page.getByRole('button', { name: 'Save food' }).click();

  const dialog = page.getByRole('dialog', { name: 'Add a food and its serving.' });
  await expect(dialog).toBeVisible();
  await expect(fibre).toHaveAttribute('aria-invalid', 'true');
  await expect(dialog.getByRole('alert')).toHaveText('Fibre must be no more than 100,000 grams per serving.');
  await expect(page.getByText('Boundary food', { exact: true })).toHaveCount(0);

  await page.reload();
  const target = page.locator('.target', { hasText: 'Boundary fibre' });
  await expect(target).toHaveClass(/gap/);
  await expect(target.getByText('0 g', { exact: true })).toBeVisible();
  await expect(target.getByText('30 g short', { exact: true })).toBeVisible();
  await expect(target.getByRole('meter')).toHaveAccessibleName('Boundary fibre: 0 grams against a 30 gram floor, 30 g short');
  await expect(page.getByText(/Infinity/)).toHaveCount(0);
});

test('rejects finite imports whose derived weekly total would overflow the supported range', async ({ page }) => {
  await createPersistedBaselinePlan(page);
  const unsafePlan = {
    targets: [{ id: 'boundary-fibre', key: 'fibre', label: 'Boundary fibre', value: 30, kind: 'min', unit: 'g' }],
    foods: [{ id: 'boundary-food', name: 'Boundary food', serving: '1 serving', source: 'Test label', nutrients: { fibre: 100000, protein: 0, sugar: 0, saturatedFat: 0 } }],
    meals: [{ id: 'boundary-meal', name: 'Boundary meal', day: 0, portions: [{ foodId: 'boundary-food', amount: 11 }] }],
    updatedAt: new Date().toISOString()
  };
  await importPlan(page, unsafePlan);
  await expect(page.getByText('That file is not a valid Nutrient Floor plan. Choose an exported JSON file.')).toBeVisible();
  await expect(page.getByText('Boundary food', { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('Baseline food', { exact: true })).toBeVisible();
  await expect(page.getByText('Baseline target', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Baseline meal', exact: true })).toBeVisible();
  await expect(page.getByText(/Infinity/)).toHaveCount(0);
});

for (const invalidCase of [
  { name: 'food name', kind: 'food', field: 'name', message: 'Enter a food name. It cannot be blank.' },
  { name: 'serving', kind: 'food', field: 'serving', message: 'Enter a serving. It cannot be blank.' },
  { name: 'source', kind: 'food', field: 'source', message: 'Enter a source or label. It cannot be blank.' },
  { name: 'target label', kind: 'target', field: 'label', message: 'Enter a target name. It cannot be blank.' },
  { name: 'meal name', kind: 'meal', field: 'name', message: 'Enter a meal name. It cannot be blank.' }
] as const) {
  test(`rejects whitespace-only ${invalidCase.name} without corrupting the saved plan`, async ({ page }) => {
    await createPersistedBaselinePlan(page);

    if (invalidCase.kind === 'food') {
      await page.getByRole('button', { name: 'Add food' }).click();
      await page.getByLabel('Food name').fill(invalidCase.field === 'name' ? '   ' : 'Rejected food');
      await page.getByRole('textbox', { name: 'Serving Example: ½ cup dry' }).fill(invalidCase.field === 'serving' ? '   ' : '1 cup');
      await page.getByLabel('Source or label').fill(invalidCase.field === 'source' ? '   ' : 'Package label');
      await page.getByRole('button', { name: 'Save food' }).click();
    } else if (invalidCase.kind === 'target') {
      await page.getByRole('button', { name: 'Add target' }).click();
      await page.getByLabel('Target name').fill('   ');
      await page.getByLabel('Grams per week').fill('30');
      await page.getByRole('button', { name: 'Save target' }).click();
    } else {
      await page.getByRole('button', { name: 'Add a meal' }).first().click();
      await page.getByLabel('Meal name').fill('   ');
      await page.getByLabel('Baseline food per 1 cup').fill('1');
      await page.getByRole('button', { name: 'Save meal' }).click();
    }

    const dialog = page.getByRole('dialog');
    const invalidInput = dialog.locator(`input[name="${invalidCase.field}"]`);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('alert')).toHaveText(invalidCase.message);
    await expect(invalidInput).toHaveValue('   ');
    await expect(invalidInput).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('.food')).toHaveCount(1);
    await expect(page.locator('.target')).toHaveCount(1);
    await expect(page.locator('.meal')).toHaveCount(1);

    await page.reload();
    await expect(page.getByText('Baseline food', { exact: true })).toBeVisible();
    await expect(page.getByText('Baseline target', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Baseline meal', exact: true })).toBeVisible();
    await expect(page.locator('.food')).toHaveCount(1);
    await expect(page.locator('.target')).toHaveCount(1);
    await expect(page.locator('.meal')).toHaveCount(1);
  });
}

test('dialog focus, escape, and meal cancellation do not leak data', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Add a meal' }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Add a meal.' });
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel('Meal name')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Add a meal' }).first()).toBeFocused();
  await expect(page.locator('.meal')).toHaveCount(3);
});

test('skip link moves keyboard focus into the planner on desktop and 390px mobile', async ({ browser }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto('/demo');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to planner' })).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
    await expect(page.locator('main#main')).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Export plan' })).toBeFocused();
    await context.close();
  }
});

test('unsafe imported IDs do not create nodes or requests', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/plan');
  const plan = await page.evaluate(() => ({ targets: [], foods: [], meals: [], updatedAt: new Date().toISOString() }));
  plan.foods = [{ id: 'x\"><img src="/qa-injected" alt="marker', name: 'Bad food', serving: '1 cup', source: 'Test', nutrients: { fibre: 1, protein: 0, sugar: 0, saturatedFat: 0 } }];
  await page.getByLabel('Import plan').setInputFiles({ name: 'unsafe.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(plan)) });
  await expect(page.getByText('That file is not a valid Nutrient Floor plan. Choose an exported JSON file.')).toBeVisible();
  await expect(page.locator('img[alt="marker"]')).toHaveCount(0);
  expect(requests.filter(url => url.endsWith('/qa-injected'))).toEqual([]);
});

test('blocked browser storage keeps the dialog open and explains recovery', async ({ browser }) => {
  const context = await browser.newContext();
  await context.addInitScript(() => Object.defineProperty(window, 'indexedDB', { value: { open: () => { throw new Error('Storage blocked'); } } }));
  const page = await context.newPage();
  await page.goto('/plan');
  await page.getByRole('button', { name: 'Add your first target' }).click();
  await page.getByLabel('Target name').fill('Fibre floor');
  await page.getByLabel('Grams per week').fill('30');
  await page.getByRole('button', { name: 'Save target' }).click();
  await expect(page.getByRole('dialog', { name: 'Add a nutrient floor or limit.' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Browser storage is unavailable. Your changes were not saved. Enable site storage, then try again.');
  await context.close();
});

test('route metadata, direct demo query, and touch targets are specific and usable on mobile', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  for (const [path, title, canonical] of [
    ['/demo', 'Demo — Nutrient Floor', 'https://nutrient-floor-planner.sociobot.in/demo'],
    ['/?demo=1', 'Demo — Nutrient Floor', 'https://nutrient-floor-planner.sociobot.in/demo'],
    ['/plan', 'Planner — Nutrient Floor', 'https://nutrient-floor-planner.sociobot.in/plan'],
    ['/privacy', 'Privacy — Nutrient Floor', 'https://nutrient-floor-planner.sociobot.in/privacy'],
    ['/terms', 'Terms — Nutrient Floor', 'https://nutrient-floor-planner.sociobot.in/terms']
  ]) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
  }
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.getByText('Demo — sample data, nothing is saved.')).toBeVisible();
  for (const target of [page.getByRole('link', { name: 'Demo' }), page.getByRole('link', { name: 'Privacy' }).last(), page.getByRole('link', { name: 'Terms' })]) {
    const box = await target.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await context.close();
});

test('privacy contact link has a 44px mobile target and no serious or critical axe issues', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/privacy');
  const contact = page.getByRole('link', { name: 'hello@sociobot.in' });
  const box = await contact.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(violation => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  await context.close();
});

test('SPA navigation, back, focus, announcements, and unknown routes work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Your meal plan stays on this device.' })).toBeFocused();
  await expect(page.locator('#route-live')).toContainText('Privacy — Nutrient Floor');
  await expect(page.locator('#route-live')).toHaveCSS('position', 'absolute');
  await expect(page.locator('#route-live')).toHaveCSS('clip', 'rect(0px, 0px, 0px, 0px)');
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Plan meals that meet your nutrient targets.' })).toBeFocused();
  await expect(page.locator('#route-live')).toContainText('Nutrient Floor — Plan meals around nutrient targets');
  await page.goto('/not-a-real-route');
  await expect(page).toHaveTitle('Page not found — Nutrient Floor');
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open the sample plan' })).toHaveAttribute('href', '/?demo=1');
  await expect(page.getByRole('link', { name: 'Go to the planner' })).toHaveAttribute('href', '/plan');
});

test('meter uses semantic markup without CSP inline styles and deletions require confirmation', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/demo');
  await expect(page.locator('meter')).toHaveCount(3);
  await expect(page.locator('[style*="width"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Delete Rolled oats' }).click();
  await expect(page.getByRole('dialog', { name: 'Remove Rolled oats?' })).toBeVisible();
  await expect(page.getByText(/remove portions from 1 meal/)).toBeVisible();
  await page.getByRole('button', { name: 'Keep it' }).click();
  await expect(page.getByText('Rolled oats', { exact: true })).toBeVisible();
  expect(errors.filter(error => /Content Security Policy|CSP/.test(error))).toEqual([]);
});

test('demo has no serious or critical axe violations', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('heading', { name: 'Build a week that meets your targets.' }).waitFor();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(violation => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});

test('dark demo has no serious or critical axe violations', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto('/demo');
  await page.getByRole('heading', { name: 'Build a week that meets your targets.' }).waitFor();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(violation => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  await context.close();
});

test('wordmark passes the experimental label-content-name rule', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['experimental']).analyze();
  expect(results.violations.filter(violation => violation.id === 'label-content-name-mismatch')).toEqual([]);
});

test('mobile and 200% zoom-equivalent layouts avoid page overflow', async ({ browser }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 195, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto('/demo');
    await page.getByRole('heading', { name: 'Build a week that meets your targets.' }).waitFor();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    expect(await page.locator('.meal p').first().evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(14);
    expect(await page.locator('.food small').first().evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(14);
    await context.close();
  }
});

test('the styled 404 has the full shell, legal links, metadata, and recovery actions', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Nutrient Floor');
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open the sample plan' })).toHaveAttribute('href', '/?demo=1');
  await expect(page.getByRole('link', { name: 'Go to the planner' })).toHaveAttribute('href', '/plan');
  await expect(page.getByRole('link', { name: 'Privacy' }).last()).toHaveAttribute('href', '/privacy');
  await expect(page.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://nutrient-floor-planner.sociobot.in/404.html');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(violation => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});

test('landing first screen remains readable and actionable at 390px', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Plan meals that meet your nutrient targets.' })).toBeVisible();
  await expect(page.getByText('For home cooks who want enough fibre or protein without logging every calorie.')).toBeVisible();
  await expect(page.locator('.hero-art img')).toHaveAttribute('alt', 'Ingredients arranged across a blue kitchen planning sheet.');
  await expect(page.locator('.hero-art figcaption')).toHaveCount(0);
  const action = page.getByRole('link', { name: 'Try it with sample data' });
  await expect(action).toBeVisible();
  const box = await action.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await context.close();
});

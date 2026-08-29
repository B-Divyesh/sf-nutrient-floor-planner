import { expect, test } from '@playwright/test';
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

test('@claim:json-transfer exports complete JSON and imports it', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export plan' }).click();
  const exported = await download;
  const text = await exported.createReadStream().then(async stream => {
    let result = ''; for await (const part of stream!) result += part.toString(); return result;
  });
  const parsed = JSON.parse(text);
  expect(parsed.foods).toHaveLength(7);
  expect(parsed.meals).toHaveLength(3);
  await page.getByLabel('Import plan').setInputFiles({ name: 'plan.json', mimeType: 'application/json', buffer: Buffer.from(text) });
  await expect(page.getByText('Plan imported.')).toBeVisible();
});

test('@claim:local-persistence saved foods survive a reload', async ({ page }) => {
  await page.goto('/plan');
  await addFood(page, 'Persistent beans');
  await page.reload();
  await expect(page.getByText('Persistent beans')).toBeVisible();
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

test('removed paid path ignores a legacy forged token and does not gate foods', async ({ page }) => {
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

test('@claim:target-comparison compares entered values with a chosen target', async ({ page }) => {
  await page.goto('/plan');
  await page.getByRole('button', { name: 'Add food' }).click();
  await page.getByLabel('Food name').fill('Fibre cereal');
  await page.getByRole('textbox', { name: 'Serving Example: ½ cup dry' }).fill('1 bowl');
  await page.getByLabel('Source or label').fill('Box label');
  await page.locator('input[name="fibre"]').fill('8');
  await page.getByRole('button', { name: 'Save food' }).click();
  await addTarget(page, 'Weekly fibre');
  await page.getByRole('button', { name: 'Add a meal' }).first().click();
  await page.getByLabel('Meal name').fill('Cereal breakfast');
  await page.getByLabel('Fibre cereal per 1 bowl').fill('2');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await expect(page.getByText('16 g', { exact: true })).toBeVisible();
  await expect(page.getByText('on plan', { exact: true })).toBeVisible();
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
  const action = page.getByRole('link', { name: 'Try it with sample data' });
  await expect(action).toBeVisible();
  const box = await action.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await context.close();
});

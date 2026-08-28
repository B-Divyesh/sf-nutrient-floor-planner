import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function addFood(page: import('@playwright/test').Page, name = 'Test beans') {
  await page.getByRole('button', { name: 'Add food' }).click();
  await expect(page.getByRole('dialog', { name: 'Add a food and its serving.' })).toBeVisible();
  await page.getByLabel('Food name').fill(name);
  await page.getByRole('textbox', { name: 'Serving Example: ½ cup dry' }).fill('1 cup');
  await page.getByLabel('Source or label').fill('Package label');
  await page.getByRole('button', { name: 'Save food' }).click();
  await expect(page.getByText(name)).toBeVisible();
}

test('@claim:demo-week-coverage loads a seven-food plan with three placed meals', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Build a week that clears your targets.' })).toBeVisible();
  await expect(page.locator('.food')).toHaveCount(7);
  await expect(page.locator('.meal')).toHaveCount(3);
  await expect(page.getByText('Fibre floor')).toBeVisible();
});

test('@claim:local-only demo sends no data off this origin', async ({ page }) => {
  const foreign: string[] = [];
  page.on('request', request => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') foreign.push(request.url()); });
  await page.goto('/demo');
  await addFood(page);
  expect(foreign).toEqual([]);
});

test('@claim:offline-use reloads and stays usable offline after setup', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Build a week that clears your targets.' })).toBeVisible();
  await page.getByRole('button', { name: 'Add a meal' }).first().click();
  await expect(page.getByRole('dialog', { name: 'Add a meal.' })).toBeVisible();
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

test('@claim:demo-isolation discards demo edits through every visible exit', async ({ page }) => {
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
});

test('@claim:paid-upgrade restores a valid one-time license and shows its checkout', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/nutrient-floor-planner/verify?license=returned-token', route => route.fulfill({ json: { valid: true, reason: 'ok' } }));
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Buy the $12 upgrade' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/nutrient-floor-planner/checkout');
  await page.goto('/?license=returned-token');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('Upgrade active on this device.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open your upgraded planner' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('sb_license:nutrient-floor-planner'))).toBe('returned-token');
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
  await expect(page.getByRole('heading', { name: 'Build a week that clears your targets.' })).toBeVisible();
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

test('route metadata and touch targets are specific and usable on mobile', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  for (const [path, title, canonical] of [
    ['/demo', 'Demo — Nutrient Floor', 'https://nutrient-floor-planner.sociobot.in/demo'],
    ['/plan', 'Planner — Nutrient Floor', 'https://nutrient-floor-planner.sociobot.in/plan']
  ]) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
  }
  await page.goto('/demo');
  for (const target of [page.getByRole('link', { name: 'Demo' }), page.getByRole('link', { name: 'Privacy' }).last(), page.getByRole('link', { name: 'Terms' })]) {
    const box = await target.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await context.close();
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
  await page.getByRole('heading', { name: 'Build a week that clears your targets.' }).waitFor();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(violation => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});

test('dark demo has no serious or critical axe violations', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto('/demo');
  await page.getByRole('heading', { name: 'Build a week that clears your targets.' }).waitFor();
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
    await page.getByRole('heading', { name: 'Build a week that clears your targets.' }).waitFor();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await context.close();
  }
});

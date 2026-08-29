import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const origin = 'https://nutrient-floor-planner.sociobot.in';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const consoleErrors = [];
const foreignRequests = [];
const dataRequests = [];
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => consoleErrors.push(String(error)));
page.on('request', request => {
  if (new URL(request.url()).origin !== origin) foreignRequests.push(request.url());
  if (['fetch', 'xhr', 'eventsource', 'websocket', 'ping'].includes(request.resourceType())) dataRequests.push(request.url());
});

const results = {};
try {
  await page.goto(`${origin}/?repair=6-live-qa`, { waitUntil: 'networkidle' });
  const action = page.getByRole('link', { name: 'Try it with sample data' });
  await expect(action).toBeVisible();
  results.firstScreen = {
    h1: await page.getByRole('heading', { level: 1 }).innerText(),
    actionHeight: (await action.boundingBox())?.height,
    scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth)
  };
  const homeAxe = await new AxeBuilder({ page }).analyze();
  results.homeSeriousCritical = homeAxe.violations.filter(item => ['serious', 'critical'].includes(item.impact || '')).map(item => item.id);

  await action.click();
  await expect(page.getByText('Demo — sample data, nothing is saved.')).toBeVisible();
  results.demo = {
    foods: await page.locator('.food').count(),
    meals: await page.locator('.meal').count(),
    targets: await page.locator('.target').count()
  };
  results.reducedMotionDurations = await page.evaluate(() => [...document.querySelectorAll('*')].flatMap(element => {
    const style = getComputedStyle(element);
    return [style.animationDuration, style.transitionDuration];
  }).filter(value => value !== '0s'));
  const demoAxe = await new AxeBuilder({ page }).analyze();
  results.demoSeriousCritical = demoAxe.violations.filter(item => ['serious', 'critical'].includes(item.impact || '')).map(item => item.id);
  await page.screenshot({ path: '.factory/evidence/repair-6-live-mobile-390.png', fullPage: true });

  await page.goto(`${origin}/demo?repair=6-keyboard`);
  await page.keyboard.press('Tab');
  results.firstTab = await page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.keyboard.press('Enter');
  await expect(page.locator('main#main')).toBeFocused();
  results.skipTarget = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Export plan' })).toBeFocused();
  results.afterSkip = await page.evaluate(() => document.activeElement?.textContent?.trim());

  const thresholdPlans = [
    {
      id: 'maximum', key: 'sugar', label: 'Tiny sugar limit', kind: 'max', amount: 1.25,
      expectedTotal: '0.125 g', expectedDifference: '0.025 g over',
      expectedName: 'Tiny sugar limit: 0.125 grams against a 0.1 gram limit, 0.025 g over'
    },
    {
      id: 'minimum', key: 'fibre', label: 'Tiny fibre floor', kind: 'min', amount: 0.75,
      expectedTotal: '0.075 g', expectedDifference: '0.025 g short',
      expectedName: 'Tiny fibre floor: 0.075 grams against a 0.1 gram floor, 0.025 g short'
    }
  ];
  results.thresholds = [];
  await page.goto(`${origin}/plan?repair=6-thresholds`);
  for (const threshold of thresholdPlans) {
    const nutrients = { fibre: 0, protein: 0, sugar: 0, saturatedFat: 0 };
    nutrients[threshold.key] = 0.1;
    const plan = {
      targets: [{ id: `${threshold.id}-target`, key: threshold.key, label: threshold.label, value: 0.1, kind: threshold.kind, unit: 'g' }],
      foods: [{ id: `${threshold.id}-food`, name: `${threshold.id} food`, serving: '1 serving', source: 'Package label', nutrients }],
      meals: [{ id: `${threshold.id}-meal`, name: `${threshold.id} meal`, day: 0, portions: [{ foodId: `${threshold.id}-food`, amount: threshold.amount }] }],
      updatedAt: new Date().toISOString()
    };
    await page.getByLabel('Import plan').setInputFiles({ name: `${threshold.id}.json`, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(plan)) });
    const row = page.locator('.target', { hasText: threshold.label });
    await expect(row).toHaveClass(/gap/);
    await expect(row.getByText(threshold.expectedTotal, { exact: true })).toBeVisible();
    await expect(row.getByText(threshold.expectedDifference, { exact: true })).toBeVisible();
    await expect(row.getByRole('meter')).toHaveAccessibleName(threshold.expectedName);
    results.thresholds.push({ id: threshold.id, text: (await row.innerText()).replaceAll('\n', ' | '), accessibleName: await row.getByRole('meter').getAttribute('aria-label') });
  }

  await page.goto(`${origin}/demo?repair=6-offline`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Build a week that meets your targets.' })).toBeVisible();
  await page.getByRole('button', { name: 'Add a meal' }).first().click();
  await expect(page.getByRole('dialog', { name: 'Add a meal.' })).toBeVisible();
  results.offline = 'reloaded demo and opened meal dialog';
  await context.setOffline(false);

  results.consoleErrors = consoleErrors;
  results.foreignRequests = foreignRequests;
  results.dataRequests = dataRequests;
  await writeFile('.factory/evidence/repair-6-live-qa.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));

  expect(results.firstScreen.actionHeight).toBeGreaterThanOrEqual(44);
  expect(results.firstScreen.scrollWidth).toBeLessThanOrEqual(390);
  expect(results.homeSeriousCritical).toEqual([]);
  expect(results.demoSeriousCritical).toEqual([]);
  expect(results.demo).toEqual({ foods: 7, meals: 3, targets: 3 });
  expect(results.reducedMotionDurations).toEqual([]);
  expect(results.firstTab).toBe('Skip to planner');
  expect(results.skipTarget).toBe('main');
  expect(results.afterSkip).toBe('Export plan');
  expect(results.consoleErrors).toEqual([]);
  expect(results.foreignRequests).toEqual([]);
  expect(results.dataRequests).toEqual([]);
} finally {
  await context.setOffline(false);
  await browser.close();
}

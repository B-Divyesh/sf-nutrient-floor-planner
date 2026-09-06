import { strict as assert } from 'node:assert';
import { writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const origin = 'https://nutrient-floor-planner.sociobot.in';
const browser = await chromium.launch();
const result = { checkedAt: new Date().toISOString() };

async function addFood(page, name) {
  await page.getByRole('button', { name: 'Add food' }).click();
  await page.getByLabel('Food name').fill(name);
  await page.getByRole('textbox', { name: 'Serving Example: ½ cup dry' }).fill('1 cup');
  await page.getByLabel('Source or label').fill('Package label');
  await page.getByRole('button', { name: 'Save food' }).click();
  await page.getByText(name, { exact: true }).waitFor();
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const desktopPage = await desktop.newPage();
const desktopErrors = [];
desktopPage.on('pageerror', error => desktopErrors.push(String(error)));
desktopPage.on('console', message => { if (message.type() === 'error') desktopErrors.push(message.text()); });
await desktopPage.goto(`${origin}/?cold=repair-9`, { waitUntil: 'networkidle' });
assert.equal(await desktopPage.title(), 'Nutrient Floor — Plan meals around nutrient targets');
assert.equal(await desktopPage.getByRole('heading', { level: 1 }).textContent(), 'Plan meals that meet your nutrient targets.');
assert.equal(await desktopPage.getByRole('link', { name: 'Try it with sample data' }).isVisible(), true);
assert.equal(await desktopPage.locator('.facts li').count(), 3);
assert.equal(await desktopPage.getByRole('link', { name: 'Buy the $12 upgrade on Sociobot' }).getAttribute('href'), 'https://api.sociobot.in/api/v1/products/nutrient-floor-planner/checkout');
assert.deepEqual(desktopErrors, []);
result.desktop = {
  h1: await desktopPage.getByRole('heading', { level: 1 }).textContent(),
  audience: await desktopPage.locator('.lede').textContent(),
  firstAction: await desktopPage.getByRole('link', { name: 'Try it with sample data' }).textContent(),
  facts: await desktopPage.locator('.facts li').allTextContents(),
  width: await desktopPage.evaluate(() => document.documentElement.scrollWidth),
  errors: desktopErrors
};
await desktop.close();

const phone = await browser.newContext({ viewport: { width: 390, height: 844 } });
const phonePage = await phone.newPage();
await phonePage.goto(`${origin}/plan`, { waitUntil: 'networkidle' });
await addFood(phonePage, 'Real-plan repair beans');
await phonePage.goto(`${origin}/?cold=repair-9-phone`, { waitUntil: 'networkidle' });
for (const locator of [
  phonePage.getByRole('heading', { level: 1 }),
  phonePage.locator('.lede'),
  phonePage.getByRole('link', { name: 'Try it with sample data' }),
  phonePage.locator('.facts')
]) {
  const box = await locator.boundingBox();
  assert.ok(box && box.y + box.height <= 844);
}
await phonePage.getByRole('link', { name: 'Try it with sample data' }).click();
await phonePage.getByRole('heading', { name: 'Build a week that meets your targets.' }).waitFor();
assert.equal(await phonePage.locator('.food').count(), 7);
assert.equal(await phonePage.locator('.meal').count(), 3);
assert.equal(await phonePage.locator('.target').count(), 3);
assert.equal(await phonePage.getByLabel('Demo mode').isVisible(), true);
const sugar = phonePage.locator('.target', { hasText: 'Total sugar limit' });
assert.equal(await sugar.getByText('within limit', { exact: true }).isVisible(), true);
assert.equal(await sugar.getByRole('meter').getAttribute('aria-label'), 'Total sugar limit: 35.1 grams against a 36 gram limit, within limit');
const passingLimit = await sugar.getByText('within limit', { exact: true }).textContent();
await addFood(phonePage, 'Demo-only repair beans');
assert.equal(await phonePage.locator('.food').count(), 8);
await phonePage.getByRole('button', { name: 'Reset demo' }).click();
assert.equal(await phonePage.locator('.food').count(), 7);
assert.equal(await phonePage.getByText('Demo-only repair beans').count(), 0);
await phonePage.getByRole('button', { name: 'Start for real' }).click();
await phonePage.getByText('Real-plan repair beans', { exact: true }).waitFor();
assert.equal(await phonePage.getByText('Demo-only repair beans').count(), 0);
result.phoneDemo = {
  sampleFoods: 7,
  sampleMeals: 3,
  sampleTargets: 3,
  passingLimit,
  demoReset: true,
  realPlanPreserved: true
};
await phone.close();

const keyboard = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const keyboardPage = await keyboard.newPage();
await keyboardPage.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
await keyboardPage.keyboard.press('Tab');
assert.equal(await keyboardPage.evaluate(() => document.activeElement?.classList.contains('skip')), true);
await keyboardPage.keyboard.press('Enter');
assert.equal(await keyboardPage.evaluate(() => document.activeElement?.id), 'main');
const motion = await keyboardPage.evaluate(() => [...document.querySelectorAll('*')].some(element => {
  const style = getComputedStyle(element);
  return [...style.transitionDuration.split(','), ...style.animationDuration.split(',')].some(value => Number.parseFloat(value) > 0);
}));
assert.equal(motion, false);
await keyboardPage.evaluate(() => navigator.serviceWorker.ready);
if (!await keyboardPage.evaluate(() => Boolean(navigator.serviceWorker.controller))) await keyboardPage.reload();
await keyboard.setOffline(true);
await keyboardPage.reload();
await keyboardPage.getByRole('heading', { name: 'Build a week that meets your targets.' }).waitFor();
await keyboardPage.getByRole('button', { name: 'Add a meal' }).first().click();
assert.equal(await keyboardPage.getByRole('dialog', { name: 'Add a meal.' }).isVisible(), true);
result.keyboardMotionOffline = { skipFocus: true, reducedMotion: true, offlineDialog: true };
await keyboard.close();

const accessibility = {};
for (const path of ['/', '/demo', '/plan', '/privacy', '/terms', '/404.html']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
  const scan = await new AxeBuilder({ page }).analyze();
  accessibility[path] = scan.violations.filter(violation => ['serious', 'critical'].includes(violation.impact || '')).map(violation => violation.id);
  assert.deepEqual(accessibility[path], []);
  await context.close();
}
result.accessibility = accessibility;

const narrow = await browser.newContext({ viewport: { width: 195, height: 844 } });
const narrowPage = await narrow.newPage();
const notFoundResponse = await narrowPage.goto(`${origin}/repair-9-page-not-found`, { waitUntil: 'networkidle' });
assert.equal(notFoundResponse?.status(), 404);
assert.equal(await narrowPage.getByRole('heading', { level: 1 }).textContent(), 'Page not found');
const narrowWidth = await narrowPage.evaluate(() => document.documentElement.scrollWidth);
assert.ok(narrowWidth <= 195);
result.notFound = { status: notFoundResponse?.status(), viewportWidth: 195, documentWidth: narrowWidth };
await narrow.close();

await browser.close();
await writeFile(new URL('./repair-9-live-qa.json', import.meta.url), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));

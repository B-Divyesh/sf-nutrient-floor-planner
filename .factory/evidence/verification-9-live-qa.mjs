import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const origin = 'https://nutrient-floor-planner.sociobot.in';
const output = '.factory/evidence/verification-9-live-qa.json';
const results = { consoleErrors: [], requests: [], foreignRequests: [], dataRequests: [], axe: {}, routeUndersizedControls: {} };
const browser = await chromium.launch();

function watch(page) {
  page.on('console', message => {
    if (message.type() === 'error') results.consoleErrors.push(message.text());
  });
  page.on('pageerror', error => results.consoleErrors.push(String(error)));
  page.on('request', request => {
    const item = { url: request.url(), type: request.resourceType(), method: request.method() };
    results.requests.push(item);
    if (new URL(item.url).origin !== origin) results.foreignRequests.push(item);
    if (['fetch', 'xhr', 'eventsource', 'websocket', 'ping'].includes(item.type)) results.dataRequests.push(item);
  });
}

async function scan(page, name) {
  const report = await new AxeBuilder({ page }).analyze();
  results.axe[name] = report.violations
    .filter(item => ['serious', 'critical'].includes(item.impact || ''))
    .map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.length }));
}

async function importPlan(page, plan, name = 'plan.json') {
  await page.getByLabel('Import plan').setInputFiles({
    name,
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(plan))
  });
}

try {
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await mobile.newPage();
  watch(page);
  const homeResponse = await page.goto(`${origin}/?verification=9-cold`, { waitUntil: 'networkidle' });
  const action = page.getByRole('link', { name: 'Try it with sample data' });
  const actionBox = await action.boundingBox();
  results.firstRead = {
    status: homeResponse?.status(),
    title: await page.title(),
    h1: await page.getByRole('heading', { level: 1 }).innerText(),
    audience: await page.locator('.lede').innerText(),
    action: await action.innerText(),
    actionBox,
    actionAboveFold: Boolean(actionBox && actionBox.y + actionBox.height <= 844),
    facts: await page.locator('.facts li').allInnerTexts(),
    hero: await page.locator('.hero-art img').evaluate(image => ({
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      alt: image.alt
    })),
    scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth)
  };
  results.homeHeaders = await homeResponse?.allHeaders();
  await scan(page, 'home-mobile-reduced');
  await page.screenshot({ path: '.factory/evidence/verification-9-home-mobile.png', fullPage: true });

  await action.click();
  await expect(page.getByText('Demo — sample data, nothing is saved.')).toBeVisible();
  results.demo = {
    url: page.url(),
    foods: await page.locator('.food').count(),
    meals: await page.locator('.meal').count(),
    targets: await page.locator('.target').count(),
    scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth),
    motionDurations: await page.evaluate(() => [...document.querySelectorAll('*')].flatMap(element => {
      const style = getComputedStyle(element);
      return [style.animationDuration, style.transitionDuration];
    }).filter(value => value !== '0s')),
    undersizedControls: await page.locator('a, button, label.file-button, input:not([type="file"]), select').evaluateAll(elements => elements
      .filter(element => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      })
      .map(element => {
        const rect = element.getBoundingClientRect();
        return { text: element.getAttribute('aria-label') || element.textContent?.trim() || element.tagName, width: rect.width, height: rect.height };
      })
      .filter(item => item.width < 44 || item.height < 44))
  };
  await scan(page, 'demo-mobile-reduced');
  await page.screenshot({ path: '.factory/evidence/verification-9-demo-mobile.png', fullPage: true });

  await page.goto(`${origin}/demo?verification=9-keyboard`);
  await page.keyboard.press('Tab');
  results.keyboard = { firstTab: await page.evaluate(() => document.activeElement?.textContent?.trim()) };
  results.keyboard.firstFocusStyle = await page.locator('.skip').evaluate(element => {
    const style = getComputedStyle(element);
    return { outline: style.outline, top: style.top };
  });
  await page.keyboard.press('Enter');
  results.keyboard.skipTarget = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press('Tab');
  results.keyboard.afterSkip = await page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.getByRole('button', { name: 'Add a meal' }).first().focus();
  await page.keyboard.press('Enter');
  results.keyboard.dialogInitialFocus = await page.evaluate(() => document.activeElement?.getAttribute('name'));
  await page.keyboard.press('Escape');
  results.keyboard.dialogClosed = await page.getByRole('dialog').count() === 0;
  results.keyboard.returnedToOpener = await page.getByRole('button', { name: 'Add a meal' }).first().evaluate(element => document.activeElement === element);

  await page.goto(`${origin}/plan?verification=9-normal`);
  await page.getByRole('button', { name: 'Add your first target' }).click();
  await page.getByLabel('Target name').fill('Weekly fibre');
  await page.getByLabel('Grams per week').fill('30');
  await page.getByRole('button', { name: 'Save target' }).click();
  await page.getByRole('button', { name: 'Add target' }).click();
  await page.getByLabel('Target name').fill('Weekly sugar');
  await page.locator('select[name="key"]').selectOption('sugar');
  await page.locator('select[name="kind"]').selectOption('max');
  await page.getByLabel('Grams per week').fill('10');
  await page.getByRole('button', { name: 'Save target' }).click();
  await page.getByRole('button', { name: 'Add food' }).click();
  await page.getByLabel('Food name').fill('Home chickpea bowl');
  await page.getByRole('textbox', { name: 'Serving Example: ½ cup dry' }).fill('1 bowl');
  await page.getByLabel('Source or label').fill('Packet at home');
  await page.locator('input[name="fibre"]').fill('12');
  await page.locator('input[name="protein"]').fill('14.5');
  await page.locator('input[name="sugar"]').fill('2');
  await page.getByRole('button', { name: 'Save food' }).click();
  await page.getByRole('button', { name: 'Add a meal' }).first().click();
  await page.getByLabel('Meal name').fill('Wednesday chickpea lunch');
  await page.locator('select[name="day"]').selectOption('2');
  await page.getByLabel('Home chickpea bowl per 1 bowl').fill('2');
  await page.getByRole('button', { name: 'Save meal' }).click();
  await expect(page.locator('.meal')).toHaveCount(1);
  const fibreRow = page.locator('.target', { hasText: 'Weekly fibre' });
  const sugarRow = page.locator('.target', { hasText: 'Weekly sugar' });
  results.normalFlow = {
    foods: await page.locator('.food').count(),
    meals: await page.locator('.meal').count(),
    targets: await page.locator('.target').count(),
    fibreText: (await fibreRow.innerText()).replaceAll('\n', ' | '),
    sugarText: (await sugarRow.innerText()).replaceAll('\n', ' | ')
  };
  await page.reload();
  results.normalFlow.persistedAfterReload = await page.getByText('Home chickpea bowl', { exact: true }).count() === 1;
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export plan' }).click();
  const download = await downloadPromise;
  const exportedText = await download.createReadStream().then(async stream => {
    let text = '';
    for await (const chunk of stream) text += chunk.toString();
    return text;
  });
  const exported = JSON.parse(exportedText);
  results.normalFlow.exportCounts = { foods: exported.foods.length, meals: exported.meals.length, targets: exported.targets.length };

  await page.getByLabel('Import plan').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
  results.invalidImport = {
    message: await page.getByRole('status').innerText(),
    preservedFood: await page.getByText('Home chickpea bowl', { exact: true }).count() === 1
  };

  const thresholdPlans = [
    { id: 'maximum', key: 'sugar', label: 'Tiny sugar limit', kind: 'max', amount: 1.25, total: '0.125 g', difference: '0.025 g over' },
    { id: 'minimum', key: 'fibre', label: 'Tiny fibre floor', kind: 'min', amount: 0.75, total: '0.075 g', difference: '0.025 g short' }
  ];
  results.thresholds = [];
  for (const threshold of thresholdPlans) {
    const nutrients = { fibre: 0, protein: 0, sugar: 0, saturatedFat: 0 };
    nutrients[threshold.key] = 0.1;
    const plan = {
      targets: [{ id: `${threshold.id}-target`, key: threshold.key, label: threshold.label, value: 0.1, kind: threshold.kind, unit: 'g' }],
      foods: [{ id: `${threshold.id}-food`, name: `${threshold.id} food`, serving: '1 serving', source: 'Package label', nutrients }],
      meals: [{ id: `${threshold.id}-meal`, name: `${threshold.id} meal`, day: 0, portions: [{ foodId: `${threshold.id}-food`, amount: threshold.amount }] }],
      updatedAt: new Date().toISOString()
    };
    await importPlan(page, plan, `${threshold.id}.json`);
    const row = page.locator('.target', { hasText: threshold.label });
    results.thresholds.push({
      id: threshold.id,
      class: await row.getAttribute('class'),
      text: (await row.innerText()).replaceAll('\n', ' | '),
      meterName: await row.getByRole('meter').getAttribute('aria-label')
    });
  }

  await page.goto(`${origin}/plan?verification=9-whitespace`);
  await page.getByRole('button', { name: 'Add food' }).click();
  await page.getByLabel('Food name').fill('   ');
  await page.getByRole('textbox', { name: 'Serving Example: ½ cup dry' }).fill('1 cup');
  await page.getByLabel('Source or label').fill('Package label');
  await page.getByRole('button', { name: 'Save food' }).click();
  await page.waitForTimeout(300);
  results.whitespaceFood = {
    dialogClosed: await page.getByRole('dialog').count() === 0,
    foodCount: await page.locator('.food').count(),
    foodTexts: await page.locator('.food').allInnerTexts()
  };
  await page.reload();
  results.whitespaceFood.afterReload = {
    foodCount: await page.locator('.food').count(),
    targetCount: await page.locator('.target').count(),
    mealCount: await page.locator('.meal').count()
  };

  for (const route of ['/', '/demo', '/plan', '/privacy', '/terms']) {
    await page.goto(`${origin}${route}`);
    await page.getByRole('heading', { level: 1 }).waitFor();
    results.routeUndersizedControls[route] = await page.locator('a, button, label.file-button, input:not([type="file"]), select').evaluateAll(elements => elements
      .filter(element => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      })
      .map(element => {
        const rect = element.getBoundingClientRect();
        return { text: element.getAttribute('aria-label') || element.textContent?.trim() || element.tagName, width: rect.width, height: rect.height };
      })
      .filter(item => item.width < 44 || item.height < 44));
    await scan(page, `light-${route}`);
  }
  results.consoleErrorsBefore404 = [...results.consoleErrors];
  const notFoundResponse = await page.goto(`${origin}/verification-9-not-found`);
  results.notFound = { status: notFoundResponse?.status(), title: await page.title(), h1: await page.getByRole('heading', { level: 1 }).innerText() };
  await scan(page, '404');
  await mobile.close();

  const dark = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
  const darkPage = await dark.newPage();
  await darkPage.goto(`${origin}/demo?verification=9-dark`);
  await darkPage.getByRole('heading', { level: 1 }).waitFor();
  const darkReport = await new AxeBuilder({ page: darkPage }).analyze();
  results.axe['demo-dark'] = darkReport.violations
    .filter(item => ['serious', 'critical'].includes(item.impact || ''))
    .map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.length }));
  await dark.close();

  const narrow = await browser.newContext({ viewport: { width: 195, height: 844 } });
  const narrowPage = await narrow.newPage();
  await narrowPage.goto(`${origin}/demo?verification=9-zoom`);
  await narrowPage.getByRole('heading', { level: 1 }).waitFor();
  results.zoom200 = {
    viewport: 195,
    scrollWidth: await narrowPage.evaluate(() => document.documentElement.scrollWidth),
    mealTextPx: await narrowPage.locator('.meal p').first().evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize)),
    foodSmallPx: await narrowPage.locator('.food small').first().evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))
  };
  await narrow.close();

  const offline = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const offlinePage = await offline.newPage();
  await offlinePage.goto(`${origin}/demo?verification=9-offline`);
  await offlinePage.evaluate(() => navigator.serviceWorker.ready);
  if (!await offlinePage.evaluate(() => Boolean(navigator.serviceWorker.controller))) await offlinePage.reload();
  results.offline = { controllerBefore: await offlinePage.evaluate(() => Boolean(navigator.serviceWorker.controller)) };
  await offline.setOffline(true);
  await offlinePage.reload();
  results.offline.heading = await offlinePage.getByRole('heading', { level: 1 }).innerText();
  await offlinePage.getByRole('button', { name: 'Add a meal' }).first().click();
  results.offline.dialog = await offlinePage.getByRole('dialog', { name: 'Add a meal.' }).isVisible();
  results.offline.cacheKeys = await offlinePage.evaluate(() => caches.keys());
  await offline.setOffline(false);
  await offline.close();

  await writeFile(output, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));

  expect(results.firstRead.status).toBe(200);
  expect(results.firstRead.actionAboveFold).toBe(true);
  expect(results.firstRead.hero.naturalWidth).toBeGreaterThan(0);
  expect(results.firstRead.scrollWidth).toBeLessThanOrEqual(390);
  expect(results.demo.foods).toBe(7);
  expect(results.demo.meals).toBe(3);
  expect(results.demo.targets).toBe(3);
  expect(results.demo.motionDurations).toEqual([]);
  expect(results.demo.undersizedControls).toEqual([]);
  expect(results.keyboard.firstTab).toBe('Skip to planner');
  expect(results.keyboard.skipTarget).toBe('main');
  expect(results.keyboard.afterSkip).toBe('Export plan');
  expect(results.keyboard.dialogInitialFocus).toBe('name');
  expect(results.keyboard.dialogClosed).toBe(true);
  expect(results.keyboard.returnedToOpener).toBe(true);
  expect(results.normalFlow.persistedAfterReload).toBe(true);
  expect(results.normalFlow.exportCounts).toEqual({ foods: 1, meals: 1, targets: 2 });
  expect(results.invalidImport.preservedFood).toBe(true);
  expect(results.thresholds.map(item => item.text)).toEqual([
    'Tiny sugar limit | limit · 0.1 g | 0.125 g | 0.025 g over | ×',
    'Tiny fibre floor | floor · 0.1 g | 0.075 g | 0.025 g short | ×'
  ]);
  expect(results.whitespaceFood.dialogClosed).toBe(false);
  expect(Object.values(results.axe).flat()).toEqual([]);
  expect(Object.values(results.routeUndersizedControls).flat()).toEqual([]);
  expect(results.notFound.status).toBe(404);
  expect(results.zoom200.scrollWidth).toBeLessThanOrEqual(195);
  expect(results.offline.dialog).toBe(true);
  expect(results.consoleErrorsBefore404).toEqual([]);
  expect(results.foreignRequests).toEqual([]);
  expect(results.dataRequests).toEqual([]);
} finally {
  await browser.close();
}

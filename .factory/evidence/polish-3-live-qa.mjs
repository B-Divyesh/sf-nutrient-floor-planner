import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const origin = 'https://nutrient-floor-planner.sociobot.in';
const output = '.factory/evidence/polish-3-live-qa.json';
const results = {
  consoleErrors: [],
  foreignRequests: [],
  dataRequests: [],
  axe: {},
  routes: {}
};
const browser = await chromium.launch();

function watch(page) {
  page.on('console', message => {
    if (message.type() === 'error') results.consoleErrors.push(message.text());
  });
  page.on('pageerror', error => results.consoleErrors.push(String(error)));
  page.on('request', request => {
    const item = { url: request.url(), type: request.resourceType(), method: request.method() };
    if (new URL(item.url).origin !== origin) results.foreignRequests.push(item);
    if (['fetch', 'xhr', 'eventsource', 'websocket', 'ping'].includes(item.type)) results.dataRequests.push(item);
  });
}

async function axe(page, name) {
  const report = await new AxeBuilder({ page }).analyze();
  results.axe[name] = report.violations
    .filter(item => ['serious', 'critical'].includes(item.impact || ''))
    .map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.length }));
}

async function addFood(page, name) {
  await page.getByRole('button', { name: 'Add food' }).click();
  await page.getByLabel('Food name').fill(name);
  await page.getByRole('textbox', { name: 'Serving Example: ½ cup dry' }).fill('1 cup');
  await page.getByLabel('Source or label').fill('Live verification label');
  await page.locator('input[name="fibre"]').fill('8');
  await page.getByRole('button', { name: 'Save food' }).click();
  await expect(page.getByText(name, { exact: true })).toBeVisible();
}

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  watch(page);

  const homeResponse = await page.goto(`${origin}/?polish=3-cold`, { waitUntil: 'networkidle' });
  const action = page.getByRole('link', { name: 'Try it with sample data' });
  const actionBox = await action.boundingBox();
  results.home = {
    status: homeResponse?.status(),
    title: await page.title(),
    h1: await page.getByRole('heading', { level: 1 }).innerText(),
    audience: await page.locator('.lede').innerText(),
    facts: await page.locator('.facts li').allInnerTexts(),
    actionAboveFold: Boolean(actionBox && actionBox.y + actionBox.height <= 844),
    alt: await page.locator('.hero-art img').getAttribute('alt'),
    visibleHeroCaptions: await page.locator('.hero-art figcaption').count(),
    disallowedPaidCopy: /\$12|checkout|upgrade|license|purchase/i.test(await page.locator('body').innerText()),
    sectionHeadings: await page.getByRole('heading', { level: 2 }).allInnerTexts(),
    scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth),
    version: await page.getByRole('contentinfo').innerText()
  };
  await axe(page, 'home-mobile-reduced');
  await page.screenshot({ path: '.factory/evidence/polish-3-live-home-mobile.png', fullPage: true });

  await action.click();
  await expect(page.getByText('Demo — sample data, nothing is saved.')).toBeVisible();
  results.demo = {
    url: page.url(),
    foods: await page.locator('.food').count(),
    meals: await page.locator('.meal').count(),
    targets: await page.locator('.target').count(),
    draggable: await page.locator('[draggable="true"]').count(),
    mealTextPx: await page.locator('.meal p').first().evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize)),
    foodSourcePx: await page.locator('.food small').first().evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize)),
    localStorageKeys: await page.evaluate(() => Object.keys(localStorage))
  };
  await axe(page, 'demo-mobile-reduced');
  await page.screenshot({ path: '.factory/evidence/polish-3-live-demo-mobile.png', fullPage: true });

  await addFood(page, 'Live reset marker');
  results.demo.afterAdd = await page.locator('.food').count();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  results.demo.afterReset = await page.locator('.food').count();
  await addFood(page, 'Live reload marker');
  await page.reload();
  results.demo.afterReload = await page.locator('.food').count();
  await addFood(page, 'Live exit marker');
  await page.goto(`${origin}/?polish=3-hard-exit`);
  await page.goto(`${origin}/?demo=1&polish=3-hard-return`);
  results.demo.afterHardExit = await page.locator('.food').count();

  await addFood(page, 'Live close marker');
  await page.close();
  const reopened = await context.newPage();
  watch(reopened);
  await reopened.goto(`${origin}/?demo=1&polish=3-tab-return`);
  results.demo.afterTabClose = await reopened.locator('.food').count();

  for (const [path, title] of [
    ['/demo', 'Demo — Nutrient Floor'],
    ['/plan', 'Planner — Nutrient Floor'],
    ['/privacy', 'Privacy — Nutrient Floor'],
    ['/terms', 'Terms — Nutrient Floor']
  ]) {
    await reopened.goto(`${origin}${path}`);
    results.routes[path] = {
      status: (await reopened.request.get(`${origin}${path}`)).status(),
      title: await reopened.title(),
      h1: await reopened.locator('h1').count(),
      main: await reopened.locator('main').count(),
      canonical: await reopened.locator('link[rel="canonical"]').getAttribute('href'),
      expectedTitle: title
    };
    await axe(reopened, path);
  }

  results.consoleErrorsBefore404 = [...results.consoleErrors];
  const missingResponse = await reopened.goto(`${origin}/polish-3-page-not-found`);
  results.notFound = {
    status: missingResponse?.status(),
    title: await reopened.title(),
    h1: await reopened.getByRole('heading', { level: 1 }).innerText(),
    header: await reopened.getByRole('banner').count(),
    footer: await reopened.getByRole('contentinfo').count(),
    privacy: await reopened.getByRole('link', { name: 'Privacy' }).last().getAttribute('href'),
    terms: await reopened.getByRole('link', { name: 'Terms' }).getAttribute('href'),
    demoAction: await reopened.getByRole('link', { name: 'Open the sample plan' }).getAttribute('href'),
    plannerAction: await reopened.getByRole('link', { name: 'Go to the planner' }).getAttribute('href')
  };
  results.notFoundConsoleErrors = results.consoleErrors.slice(results.consoleErrorsBefore404.length);
  await axe(reopened, '404');
  await reopened.screenshot({ path: '.factory/evidence/polish-3-live-404-mobile.png', fullPage: true });
  await context.close();

  const legacy = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await legacy.addInitScript(() => localStorage.setItem('sb_license:nutrient-floor-planner', 'forged-live-review-token'));
  const legacyPage = await legacy.newPage();
  watch(legacyPage);
  await legacyPage.goto(`${origin}/plan?polish=3-forged-token`);
  const importedPlan = {
    targets: [],
    foods: Array.from({ length: 11 }, (_, index) => ({
      id: `live-food-${index + 1}`,
      name: `Live imported food ${index + 1}`,
      serving: '1 cup',
      source: 'Live verification label',
      nutrients: { fibre: 1, protein: 1, sugar: 0, saturatedFat: 0 }
    })),
    meals: [],
    updatedAt: new Date().toISOString()
  };
  await legacyPage.getByLabel('Import plan').setInputFiles({ name: 'live-plan.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(importedPlan)) });
  await addFood(legacyPage, 'Live twelfth food');
  results.freePlan = {
    foods: await legacyPage.locator('.food').count(),
    paidCopy: /\$12|checkout|upgrade|license|purchase/i.test(await legacyPage.locator('body').innerText()),
    sociobotLinks: await legacyPage.locator('a[href*="api.sociobot.in"]').count()
  };
  await legacy.close();

  const offline = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const offlinePage = await offline.newPage();
  for (const path of ['/?demo=1&polish=3-offline', '/plan?polish=3-offline']) {
    await offline.setOffline(false);
    await offlinePage.goto(`${origin}${path}`);
    await offlinePage.evaluate(() => navigator.serviceWorker.ready);
    if (!await offlinePage.evaluate(() => Boolean(navigator.serviceWorker.controller))) await offlinePage.reload();
    await offline.setOffline(true);
    await offlinePage.reload();
    await expect(offlinePage.getByRole('heading', { name: 'Build a week that meets your targets.' })).toBeVisible();
    await offlinePage.getByRole('button', { name: 'Add a meal' }).first().click();
    await expect(offlinePage.getByRole('dialog', { name: 'Add a meal.' })).toBeVisible();
    await offlinePage.keyboard.press('Escape');
  }
  results.offline = { demoAndPlannerReloadedAndEdited: true };
  await offline.setOffline(false);
  await offline.close();

  await writeFile(output, JSON.stringify(results, null, 2));

  expect(results.home.status).toBe(200);
  expect(results.home.actionAboveFold).toBe(true);
  expect(results.home.visibleHeroCaptions).toBe(0);
  expect(results.home.disallowedPaidCopy).toBe(false);
  expect(results.home.sectionHeadings).toEqual(['Sample weekly nutrient totals', 'Plan a week in three steps', 'How your food values are used']);
  expect(results.home.scrollWidth).toBeLessThanOrEqual(390);
  expect(results.home.version).toContain('v1.4');
  expect([results.demo.foods, results.demo.meals, results.demo.targets]).toEqual([7, 3, 3]);
  expect(results.demo.draggable).toBe(0);
  expect(results.demo.mealTextPx).toBeGreaterThanOrEqual(14);
  expect(results.demo.foodSourcePx).toBeGreaterThanOrEqual(14);
  expect(results.demo.localStorageKeys).toEqual([]);
  expect([results.demo.afterAdd, results.demo.afterReset, results.demo.afterReload, results.demo.afterHardExit, results.demo.afterTabClose]).toEqual([8, 7, 7, 7, 7]);
  expect(results.freePlan).toEqual({ foods: 12, paidCopy: false, sociobotLinks: 0 });
  expect(Object.values(results.routes).every(route => route.status === 200 && route.title === route.expectedTitle && route.h1 === 1 && route.main === 1)).toBe(true);
  expect(results.notFound).toMatchObject({ status: 404, title: 'Page not found — Nutrient Floor', h1: 'Page not found', header: 1, footer: 1, privacy: '/privacy', terms: '/terms', demoAction: '/?demo=1', plannerAction: '/plan' });
  expect(Object.values(results.axe).flat()).toEqual([]);
  expect(results.consoleErrorsBefore404).toEqual([]);
  expect(results.notFoundConsoleErrors).toEqual(['Failed to load resource: the server responded with a status of 404 ()']);
  expect(results.foreignRequests).toEqual([]);
  expect(results.dataRequests).toEqual([]);

  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}

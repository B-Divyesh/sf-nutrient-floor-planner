import { expect, test } from '@playwright/test';

test('@claim:demo-week-coverage sample data shows a usable weekly plan', async ({ page }) => {
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
  await page.getByRole('button', { name: 'Add food' }).click();
  await page.getByLabel('Food name').fill('Test beans');
  await page.getByLabel('Serving').fill('1 cup');
  await page.getByLabel('Source or label').fill('Package label');
  await page.getByRole('button', { name: 'Save food' }).click();
  await expect(page.getByText('Test beans')).toBeVisible();
  expect(foreign).toEqual([]);
});

test('@claim:offline-use demo stays usable after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Add a meal' }).first().click();
  await expect(page.getByRole('heading', { name: 'Edit this meal.' })).toBeVisible();
});

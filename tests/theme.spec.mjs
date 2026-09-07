import { test, expect } from '@playwright/test';

test('original home layout and persistent controls survive Astro navigation', async ({ page }, testInfo) => {
  const errors = [];
  const missing = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.url().startsWith(testInfo.project.use.baseURL) && response.status() >= 400) missing.push(response.url()); });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.home-hero-manifesto')).toBeVisible();
  await expect(page.locator('.home-bento')).toBeVisible();
  await expect(page.locator('.aside-column-left')).toBeVisible();
  await expect(page.locator('.aside-column-right')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('home-desktop.png'), fullPage: true });

  await page.locator('#nav-music-button').click();
  await expect(page.locator('#mistlane-music-panel')).toHaveAttribute('aria-hidden', 'false');
  await page.locator('#nav-music-button').click();
  await page.evaluate(() => window.scrollTo(0, 1100));
  await page.locator('#mistlane-settings-toggle').click();
  await expect(page.locator('#mistlane-settings-panel')).toHaveAttribute('aria-hidden', 'false');
  await page.locator('[data-color-mode="dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: testInfo.outputPath('appearance-desktop.png') });
  await page.locator('[data-color-mode="light"]').click();
  await page.locator('#mistlane-settings-panel [data-close-settings]').click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => { window.testOriginalAudio = document.querySelector('#mistlane-global-audio'); });
  await page.locator('.home-hero-primary').click();
  await expect(page).toHaveURL(/\/about\/$/);
  await expect(page.locator('.about-redesign')).toBeVisible();
  expect(await page.evaluate(() => window.testOriginalAudio === document.querySelector('#mistlane-global-audio'))).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('about-desktop.png'), fullPage: true });
  expect(missing).toEqual([]);
  expect(errors).toEqual([]);
});

test('article typography, code, equations and mobile layout', async ({ page }, testInfo) => {
  await page.goto('/posts/Nowcoder%20Weekly%20Contest%20-%20Round%20156/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#post-info .post-title')).toContainText('Round-156');
  await expect(page.locator('#post-meta .post-meta-date-created')).toHaveText('2026-08-14');
  await expect(page.locator('#article-container figure.highlight').first()).toBeVisible();
  expect(await page.locator('#article-container .katex').count()).toBeGreaterThan(0);
  expect(await page.locator('#card-toc .toc-link').count()).toBeGreaterThan(0);
  await page.screenshot({ path: testInfo.outputPath('article-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.home-hero-manifesto')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('home-mobile.png'), fullPage: true });
  await page.locator('#toggle-menu').click();
  await expect(page.locator('#sidebar-menus')).toBeVisible();
});

import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('friend link code templates retain separate lines', async ({ page }) => {
  await page.goto('/link/', { waitUntil: 'domcontentloaded' });
  const blocks = page.locator('.link-exchange-code figure.highlight');
  await expect(blocks).toHaveCount(2);
  await expect(blocks.nth(0).locator('td.code .line')).toHaveCount(5);
  await expect(blocks.nth(1).locator('td.code .line')).toHaveCount(4);
  await expect(blocks.nth(0).locator('td.code .line').nth(1)).toHaveText('link: https://blog.mistlane.top');
  await expect(blocks.nth(1).locator('td.code .line').nth(1)).toHaveText('link: https://your-site.example');
});

test('friend directory is complete before JavaScript and preserves external avatars', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(new URL('/link/', testInfo.project.use.baseURL).href, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.link-directory-hero-copy')).toBeVisible();
    await expect(page.locator('.link-directory-section-heading')).toHaveCount(2);
    await expect(page.locator('.link-directory-stats strong').first()).toHaveText('8');
    await expect(page.locator('.flink-item-icon img[src="https://zenithx76-cell.github.io/img/my_head.png"]')).toHaveCount(1);
    expect(await page.locator('.flink-item-icon img').evaluateAll(images => images.every(img => img.hasAttribute('width') && img.hasAttribute('height') && img.loading === 'lazy'))).toBe(true);
  } finally { await context.close(); }
});

test('comment accessibility enhancement follows dynamically rendered controls', async ({ page }) => {
  await page.goto('/link/', { waitUntil: 'domcontentloaded' });
  // A local fixture avoids depending on comment service availability or posting data.
  await page.locator('#post-comment').evaluate(root => {
    const fixture = document.createElement('div');
    fixture.id = 'comment-a11y-fixture';
    fixture.innerHTML = '<textarea></textarea><a class="__markdown" href="https://www.markdownguide.org/">?</a><button class="tk-action-link"><span class="tk-action-icon"><svg><path d="M51.9 384.9"></path></svg></span></button><img class="tk-avatar-img" src="/img/friend_404.gif">';
    root.append(fixture);
  });
  const fixture = page.locator('#comment-a11y-fixture');
  await expect(fixture.locator('textarea')).toHaveAttribute('aria-label', '评论内容');
  await expect(fixture.locator('button')).toHaveAttribute('aria-label', '回复评论');
  await expect(fixture.locator('a')).toHaveAttribute('aria-label', 'Markdown 语法帮助');
  await expect(fixture.locator('img')).toHaveAttribute('width', '48');
});

// Astro preview does not apply Vercel headers. Exercise them on document responses.
test.beforeEach(async ({ page }) => {
  const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const headers = Object.fromEntries(config.headers.find((rule) => rule.source === '/(.*)').headers.map(({ key, value }) => [key.toLowerCase(), value]));
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() !== 'document' || new URL(route.request().url()).hostname !== '127.0.0.1') return route.continue();
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), ...headers } });
  });
});

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
  expect(await page.evaluate(() => performance.getEntriesByType('resource').filter((entry) => entry.name.includes('/fonts/mistlane/')).length)).toBe(0);
  await expect(page.locator('head link[rel="preload"][as="image"]')).toHaveAttribute('href', /\/optimized\/.*\.webp/);
  expect(await page.locator('#aside-content img').evaluateAll((images) => images.every((image) => image.width > 0 && image.hasAttribute('width') && image.hasAttribute('height')))).toBe(true);
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
  await page.locator('#mistlane-motion-toggle').check();
  await expect(page.locator('.petal-layer, .day-rain-layer, .night-star-layer')).toHaveCount(0);
  await page.locator('#mistlane-motion-toggle').uncheck();
  await expect(page.locator('.day-rain-layer')).toHaveCount(1);
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

test('Svelte search loads on demand, retries failures and survives navigation', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && /hydration|react|svelte/i.test(message.text())) errors.push(message.text());
  });
  let requests = 0;
  await page.route('**/data/search.json', async route => {
    requests++;
    if (requests === 1) return route.fulfill({ status: 503, body: 'Temporarily unavailable' });
    return route.continue();
  });
  await page.goto('/');
  expect(requests).toBe(0);
  await page.locator('#search-button .search').click();
  await expect(page.getByRole('dialog', { name: '站内搜索' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('加载失败');
  await page.getByRole('button', { name: '重试', exact: true }).click();
  await page.getByRole('searchbox', { name: '搜索文章' }).fill('Round');
  await expect(page.locator('.search-result-title').filter({ hasText: 'Round-156' })).toBeVisible();
  await expect(page.locator('.search-result-title').filter({ hasText: '155' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('search-desktop.png') });
  await page.evaluate(() => { window.originalSearchIsland = document.querySelector('#local-search'); window.originalAudio = document.querySelector('#mistlane-global-audio'); });
  await page.locator('.search-result-title').filter({ hasText: '156' }).click();
  await expect(page).toHaveURL(/Round%20156/);
  await expect(page.getByRole('dialog', { name: '站内搜索' })).toBeHidden();
  expect(await page.evaluate(() => window.originalSearchIsland === document.querySelector('#local-search') && window.originalAudio === document.querySelector('#mistlane-global-audio'))).toBe(true);
  await page.locator('#search-button .search').click();
  await page.getByRole('searchbox', { name: '搜索文章' }).fill('不存在的文章xyz');
  await expect(page.locator('#local-search-stats')).toHaveText('找到 0 篇文章');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: '站内搜索' })).toBeHidden();
  expect(requests).toBe(2);
  expect(errors).toEqual([]);
});

test('React preferences persist across reloads and reset without duplicate handlers', async ({ page }) => {
  await page.goto('/');
  const showSettings = async () => {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await page.evaluate(() => window.scrollTo(0, 1100));
    await page.locator('#mistlane-settings-toggle').click();
    await expect(page.locator('#mistlane-settings-panel')).toHaveAttribute('aria-hidden', 'false');
  };
  await showSettings();
  await page.locator('[data-color-mode="dark"]').click();
  await page.locator('#mistlane-motion-toggle').check();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-reduce-motion', 'true');
  await showSettings();
  await page.locator('#mistlane-settings-reset').click();
  await expect(page.locator('[data-color-mode="auto"]')).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('#mistlane-motion-toggle')).not.toBeChecked();
  await page.keyboard.press('Escape');
  await expect(page.locator('#mistlane-settings-toggle')).toBeFocused();
});

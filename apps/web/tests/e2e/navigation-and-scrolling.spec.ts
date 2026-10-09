import { expect, test } from '@playwright/test';

// The development server compiles a page the first time it is opened.
const FIRST_COMPILE_TIMEOUT_MS = 30_000;

test.describe('navigation and scrolling', () => {
  test('moving between screens shows the loader inside the shell, then the page', async ({
    page,
  }) => {
    await page.goto('/w/payments-uk/home');
    const sidebar = page.getByRole('navigation', { name: 'Primary' });

    await sidebar.getByRole('link', { name: 'Analytics' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Analytics' })).toBeVisible({
      timeout: FIRST_COMPILE_TIMEOUT_MS,
    });
    await expect(sidebar).toBeVisible();

    await sidebar.getByRole('link', { name: 'Audit' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Audit log' })).toBeVisible({
      timeout: FIRST_COMPILE_TIMEOUT_MS,
    });
    await expect(page.getByRole('status', { name: 'Loading page' })).toHaveCount(0);
  });

  test('scrollbars are hidden while the content still scrolls', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 600 });
    await page.goto('/w/payments-uk/services/business?service=svc-card-payments');
    await expect(page.getByRole('heading', { level: 2, name: 'Card payments' })).toBeVisible();
    // The console scrolls inside its main region, below the fixed top bar.
    const main = page.getByRole('main');

    expect(await main.evaluate((element) => getComputedStyle(element).scrollbarWidth)).toBe('none');

    await main.hover();
    await page.mouse.wheel(0, 800);
    await expect.poll(() => main.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  });
});

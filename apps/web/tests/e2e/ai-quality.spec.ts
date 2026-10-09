import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

test.describe('replay and AI quality', () => {
  test('shows accuracy, calibration, misses and model routes', async ({ page }) => {
    await page.goto('/w/payments-uk/ai-quality');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Replay and AI quality' }),
    ).toBeVisible();
    await expect(page.getByText('72%', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('img', {
        name: 'Calibration chart: predicted confidence against actual accuracy',
      }),
    ).toBeVisible();
    await expect(page.getByText('Primary · Claude Enterprise')).toBeVisible();
    await expect(page.getByText('Regression in calibration on Bedrock model A')).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });

  test('opens the replay that justified a route approval and inspects its misses', async ({
    page,
  }) => {
    await page.goto('/w/payments-uk/ai-quality');

    await page.getByRole('link', { name: 'Replay evidence for Claude Enterprise' }).click();
    await page.waitForURL(/ai-quality\/replays\/replay-october-baseline/);
    await expect(page.getByRole('heading', { level: 1, name: 'October baseline' })).toBeVisible();
    await page.getByRole('tab', { name: /Misses/ }).click();

    await expect(page).toHaveURL(/outcome=missed/);
    await expect(page.getByRole('article')).toHaveCount(5);
    await expectNoAccessibilityViolations(page);
  });

  test('mirrors the page in Arabic', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'relyxus-locale', value: 'ar', url: baseURL ?? '' }]);
    await page.goto('/w/payments-uk/ai-quality');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(
      page.getByRole('heading', { level: 1, name: 'إعادة التشغيل وجودة الذكاء الاصطناعي' }),
    ).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});

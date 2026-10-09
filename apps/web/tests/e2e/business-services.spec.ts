import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

test.describe('business services and tolerances', () => {
  test('explains time to breach and its dependencies for card payments', async ({ page }) => {
    await page.goto('/w/payments-uk/services/business?service=svc-card-payments');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Business services and tolerances' }),
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Time to breach for Card payments' }),
    ).toBeVisible();
    await expect(page.getByText('Impact formula changed from v7 to v8')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Current posture' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });

  test('opens a technical dependency in the dependency map', async ({ page }) => {
    await page.goto('/w/payments-uk/services/business?service=svc-card-payments');

    await page.getByRole('link', { name: 'payments-api' }).click();

    await expect(page).toHaveURL(/services\?service=payments-api&tab=dependencies/);
    await expect(page.getByRole('heading', { name: 'Depends on' })).toBeVisible();
  });

  test('moves between technical and business services', async ({ page }) => {
    await page.goto('/w/payments-uk/services?service=payments-api');

    await page
      .getByRole('navigation', { name: 'Services views' })
      .getByRole('link', { name: 'Business services' })
      .click();

    await expect(page).toHaveURL(/services\/business\?service=svc-card-payments/);
    await expect(page.getByRole('heading', { level: 2, name: 'Card payments' })).toBeVisible();
  });

  test('mirrors the page in Arabic', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'relyxus-locale', value: 'ar', url: baseURL ?? '' }]);
    await page.goto('/w/payments-uk/services/business?service=svc-settlement');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(
      page.getByRole('heading', { level: 1, name: 'خدمات الأعمال وحدود التحمّل' }),
    ).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});

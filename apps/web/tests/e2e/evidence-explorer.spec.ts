import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

test.describe('evidence explorer', () => {
  test('shows evidence, hypothesis context and raw detail for INC-2041', async ({ page }) => {
    await page.goto(
      '/w/payments-uk/incidents/INC-2041/evidence?hypothesis=hypothesis-config-regression',
    );

    await expect(page.getByRole('heading', { level: 1, name: 'Evidence Explorer' })).toBeVisible();
    await expect(page.getByText('INC-2041 · Card authorisation failures in UK')).toBeVisible();
    await expect(page.getByRole('toolbar', { name: 'Evidence filters' })).toBeVisible();
    await expect(page.getByRole('link', { name: /5xx rate spike/ })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Configuration regression in payments-api' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Raw evidence' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Query' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });

  test('opens from the war room hypothesis link with the hypothesis filter applied', async ({
    page,
  }) => {
    await page.goto('/w/payments-uk/incidents/INC-2041');
    await page.getByRole('link', { name: 'Open evidence' }).first().click();

    await expect(page).toHaveURL(/hypothesis=hypothesis-config-regression/);
    await expect(page.getByRole('heading', { level: 1, name: 'Evidence Explorer' })).toBeVisible();
  });

  test('mirrors the explorer in Arabic', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'relyxus-locale', value: 'ar', url: baseURL ?? '' }]);
    await page.goto('/w/payments-uk/incidents/INC-2041/evidence');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1, name: 'مستكشف الأدلة' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});

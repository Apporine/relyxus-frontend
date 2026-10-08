import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

test.describe('command centre', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/w/payments-uk/home');
    await expect(page.getByRole('heading', { level: 1, name: 'Command Centre' })).toBeVisible();
  });

  test('shows the attention strip, incident table and side panels from the mock API', async ({
    page,
  }) => {
    await expect(
      page.getByRole('heading', { level: 2, name: 'Needs your attention' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Card authorisation failures in UK' })).toHaveCount(
      2,
    );
    await expect(page.getByRole('link', { name: 'Restart payments-api' })).toBeVisible();

    await expect(page.getByRole('heading', { level: 2, name: 'Active incidents' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'INC-2041' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'INC-2038' })).toBeVisible();

    await expect(page.getByRole('heading', { level: 2, name: 'Decisions' })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Restart payments-api' }),
    ).toBeVisible();

    await expect(page.getByRole('heading', { level: 2, name: 'Regulator clocks' })).toBeVisible();
    await expect(page.getByText('DORA initial notice · INC-2041')).toBeVisible();

    const operationalHealth = page.getByRole('region', { name: 'Operational health' });
    await expect(operationalHealth).toBeVisible();
    await expect(operationalHealth.getByText('Card authorisation', { exact: true })).toBeVisible();
    await expect(page.getByText('12 of 13 healthy')).toBeVisible();
    await expect(page.getByText('11 incidents')).toBeVisible();
  });

  test('links declare incident to the declaration route', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Declare incident' })).toHaveAttribute(
      'href',
      '/w/payments-uk/incidents/new',
    );
  });

  test('has no WCAG 2.2 AA violations in English or Arabic', async ({ page, context, baseURL }) => {
    await expectNoAccessibilityViolations(page);

    await context.addCookies([{ name: 'relyxus-locale', value: 'ar', url: baseURL ?? '' }]);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'مركز القيادة' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});

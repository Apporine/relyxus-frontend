import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

test.describe('services and dependency map', () => {
  test('shows the service list beside the focused dependency map', async ({ page }) => {
    await page.goto('/w/payments-uk/services?service=payments-api');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Services and dependency map' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'payments-api' })).toBeVisible();

    const map = page.getByRole('group', { name: 'Dependency map of payments-api' });
    await expect(map.getByRole('link', { name: /card-router/ })).toBeVisible();
    await expect(map.getByRole('link', { name: /checkout-web/ })).toBeVisible();
    await expect(map.getByText('Northwind Acquiring')).toBeVisible();
    await expect(page.getByText('Vendor outage: Northwind Acquiring')).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });

  test('moves the focus to a neighbour from the map', async ({ page }) => {
    await page.goto('/w/payments-uk/services?service=payments-api');

    await page
      .getByRole('group', { name: 'Dependency map of payments-api' })
      .getByRole('link', { name: /card-router/ })
      .click();

    await expect(page).toHaveURL(/service=card-router/);
    await expect(page.getByRole('heading', { level: 2, name: 'card-router' })).toBeVisible();
  });

  test('groups dependents beyond what the map shows and lists them all as text', async ({
    page,
  }) => {
    await page.goto('/w/payments-uk/services?service=customer-auth');

    await page.getByRole('button', { name: '5 more depend on it' }).click();

    await expect(page).toHaveURL(/tab=dependencies/);
    const dependedOnBy = page.locator('section', {
      has: page.getByRole('heading', { name: 'Depended on by' }),
    });
    await expect(dependedOnBy.getByRole('link')).toHaveCount(10);
  });

  test('reaches dependency evidence from the war room in one interaction', async ({ page }) => {
    await page.goto('/w/payments-uk/incidents/INC-2041');

    await page.getByRole('link', { name: 'Dependencies of payments-api' }).click();

    await expect(page).toHaveURL(/services\?service=payments-api&tab=dependencies/);
    await expect(page.getByRole('heading', { name: 'Depends on' })).toBeVisible();
  });

  test('confirms a discovered service', async ({ page }) => {
    await page.goto('/w/payments-uk/services?service=ledger-sync');

    await page.getByRole('button', { name: 'Confirm service' }).click();

    await expect(
      page
        .getByRole('region', { name: /Notifications/ })
        .getByText('ledger-sync confirmed in the catalogue'),
    ).toBeVisible();
    await expect(page.getByText('Discovered service waiting for confirmation')).toBeHidden();
  });

  test('mirrors the page in Arabic', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'relyxus-locale', value: 'ar', url: baseURL ?? '' }]);
    await page.goto('/w/payments-uk/services?service=payments-api');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(
      page.getByRole('heading', { level: 1, name: 'الخدمات وخريطة الاعتماديات' }),
    ).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'خريطة اعتماديات payments-api' }).getByRole('link', {
        name: /card-router/,
      }),
    ).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});

import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

test.describe('incident list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/w/payments-uk/incidents');
    await expect(page.getByRole('link', { name: /INC-2041/ })).toBeVisible();
  });

  test('shows summary metrics, filters and the active incident table', async ({ page }) => {
    await expect(page.getByText('SEV1', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('active now').first()).toBeVisible();
    await expect(page.getByRole('toolbar', { name: 'Incident list filters' })).toBeVisible();
    await expect(page.getByRole('link', { name: /INC-2041/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /INC-2038/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /INC-2031/ })).toHaveCount(0);
  });

  test('shows resolved incidents when the view filter changes', async ({ page }) => {
    await page.goto('/w/payments-uk/incidents?status=resolved');
    await expect(page.getByRole('link', { name: /INC-2031/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /INC-2041/ })).toHaveCount(0);
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
    await expect(page.getByRole('heading', { level: 1, name: 'الحوادث' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});

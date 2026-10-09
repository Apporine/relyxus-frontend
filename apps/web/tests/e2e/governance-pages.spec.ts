import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

const pages = [
  { path: 'policies/approval-routing', heading: 'Approval routing' },
  { path: 'policies/notification-rules', heading: 'Notification rules' },
  { path: 'compliance/rules', heading: 'Regulatory rule library' },
  { path: 'compliance/reports/report-inc-2041-dora-initial', heading: 'DORA initial notice' },
  { path: 'incidents/INC-1998/review', heading: 'Post-incident review' },
] as const;

test.describe('governance sub-pages', () => {
  for (const { path, heading } of pages) {
    test(`${heading} renders with no WCAG 2.2 AA violations`, async ({ page }) => {
      await page.goto(`/w/payments-uk/${path}`);

      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expectNoAccessibilityViolations(page);
    });
  }

  test('opens the draft regulator report from the Compliance Centre', async ({ page }) => {
    await page.goto('/w/payments-uk/compliance');

    await page.getByRole('link', { name: 'Draft' }).click();

    await page.waitForURL(/compliance\/reports\/report-inc-2041-dora-initial/);
    await expect(page.getByRole('button', { name: 'Request review' })).toBeDisabled();
  });

  test('moves between policies pages from the area navigation', async ({ page }) => {
    await page.goto('/w/payments-uk/policies');

    await page
      .getByRole('navigation', { name: 'Policies views' })
      .getByRole('link', { name: 'Notification rules' })
      .click();

    await page.waitForURL(/policies\/notification-rules/);
    await expect(page.getByRole('heading', { level: 1, name: 'Notification rules' })).toBeVisible();
  });

  test('mirrors the report editor in Arabic', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'relyxus-locale', value: 'ar', url: baseURL ?? '' }]);
    await page.goto('/w/payments-uk/compliance/reports/report-inc-2041-dora-initial');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('button', { name: 'طلب مراجعة' })).toBeDisabled();
    await expectNoAccessibilityViolations(page);
  });
});

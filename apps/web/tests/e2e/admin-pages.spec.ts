import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

const pages = [
  { path: 'status-pages', heading: 'Status pages' },
  { path: 'users', heading: 'Users, teams, roles and access' },
  { path: 'security', heading: 'Security and data controls' },
  { path: 'support-access', heading: 'Support access' },
  { path: 'platform', heading: 'Platform operations' },
  { path: 'promotion', heading: 'Configuration versions and promotion' },
] as const;

test.describe('admin and status pages', () => {
  for (const { path, heading } of pages) {
    test(`${heading} renders with no WCAG 2.2 AA violations`, async ({ page }) => {
      await page.goto(`/w/payments-uk/settings/${path}`);

      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expectNoAccessibilityViolations(page);
    });
  }

  test('moves between admin pages from the area navigation', async ({ page }) => {
    await page.goto('/w/payments-uk/settings/incident-types');

    await page
      .getByRole('navigation', { name: 'Admin views' })
      .getByRole('link', { name: 'Security and data' })
      .click();

    await page.waitForURL(/settings\/security/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Security and data controls' }),
    ).toBeVisible();
  });

  test('mirrors security controls in Arabic', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'relyxus-locale', value: 'ar', url: baseURL ?? '' }]);
    await page.goto('/w/payments-uk/settings/security');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(
      page.getByRole('heading', { level: 1, name: 'ضوابط الأمن والبيانات' }),
    ).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});

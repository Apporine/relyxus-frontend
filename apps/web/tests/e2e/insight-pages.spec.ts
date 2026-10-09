import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

const pages = [
  { path: 'analytics', heading: 'Analytics', content: 'Reliability drill-downs' },
  { path: 'audit', heading: 'Audit log', content: 'approval.granted' },
  { path: 'integrations', heading: 'Integrations', content: 'Prometheus prod' },
  { path: 'compliance', heading: 'Compliance Centre', content: 'Evidence packs' },
] as const;

test.describe('analytics, audit, integrations and compliance', () => {
  for (const { path, heading, content } of pages) {
    test(`${heading} renders with no WCAG 2.2 AA violations`, async ({ page }) => {
      await page.goto(`/w/payments-uk/${path}`);

      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expect(page.getByText(content, { exact: true }).first()).toBeVisible();
      await expectNoAccessibilityViolations(page);
    });
  }

  test('filters the audit log by category in the URL', async ({ page }) => {
    await page.goto('/w/payments-uk/audit');

    await page.getByRole('tab', { name: 'Approvals' }).click();

    await expect(page).toHaveURL(/event=approval/);
    await expect(page.getByText('approval.granted')).toBeVisible();
    await expect(page.getByText('incident.updated')).toBeHidden();
  });

  test('mirrors the Compliance Centre in Arabic', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'relyxus-locale', value: 'ar', url: baseURL ?? '' }]);
    await page.goto('/w/payments-uk/compliance');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1, name: 'مركز الامتثال' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});

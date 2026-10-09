import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

const pages = [
  {
    path: 'policies',
    heading: 'Policies and autonomy',
    selected: /policy=policy-payments-restart/,
  },
  {
    path: 'runbooks',
    heading: 'Runbooks and playbooks',
    selected: /runbook=runbook-payments-rollback/,
  },
  {
    path: 'settings/incident-types',
    heading: 'Incident types, fields and forms',
    selected: /type=type-production-outage/,
  },
] as const;

test.describe('policies, runbooks and incident types', () => {
  for (const { path, heading, selected } of pages) {
    test(`${heading} selects its first item with no WCAG 2.2 AA violations`, async ({ page }) => {
      await page.goto(`/w/payments-uk/${path}`);

      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expect(page).toHaveURL(selected);
      await expectNoAccessibilityViolations(page);
    });
  }

  test('opens the Admin overview from the sidebar', async ({ page }) => {
    await page.goto('/w/payments-uk/home');
    await page.getByRole('link', { name: 'Admin', exact: true }).click();

    await page.waitForURL(/\/settings$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Admin' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Organisation' })).toBeVisible();
  });

  test('mirrors policies in Arabic', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'relyxus-locale', value: 'ar', url: baseURL ?? '' }]);
    await page.goto('/w/payments-uk/policies');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(
      page.getByRole('heading', { level: 1, name: 'السياسات والاستقلالية' }),
    ).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});

import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

const pages = [
  { path: '/w/payments-uk/settings', heading: 'Admin' },
  { path: '/w/payments-uk/me', heading: 'Personal settings' },
  { path: '/wall/payments-uk', heading: 'Relyxus Operations' },
  { path: '/onboarding', heading: 'Set up Relyxus' },
] as const;

test.describe('admin overview, personal settings, wall mode and onboarding', () => {
  for (const { path, heading } of pages) {
    test(`${heading} renders with no WCAG 2.2 AA violations`, async ({ page }) => {
      await page.goto(path);

      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expectNoAccessibilityViolations(page);
    });
  }

  test('opens personal settings from the account menu', async ({ page }) => {
    await page.goto('/w/payments-uk/home');
    await page.getByRole('button', { name: /Account menu/ }).click();
    await page.getByRole('menuitem', { name: 'Personal settings' }).click();

    await page.waitForURL(/\/me/);
    await expect(page.getByRole('heading', { level: 1, name: 'Personal settings' })).toBeVisible();
  });

  test('switches the interface language from personal settings', async ({ page }) => {
    await page.goto('/w/payments-uk/me?section=language');

    await page.getByRole('radio', { name: 'العربية' }).click();

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1, name: 'الإعدادات الشخصية' })).toBeVisible();
  });

  test('wall mode has no console navigation', async ({ page }) => {
    await page.goto('/wall/payments-uk');

    await expect(page.getByRole('heading', { level: 1, name: 'Relyxus Operations' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: /Primary/ })).toHaveCount(0);
  });
});

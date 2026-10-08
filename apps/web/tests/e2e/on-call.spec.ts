import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

test.describe('on-call', () => {
  test('shows schedules, detail and escalation for payments primary', async ({ page }) => {
    await page.goto('/w/payments-uk/on-call?schedule=payments-primary');

    await expect(
      page.getByRole('heading', { level: 1, name: 'On-call and escalation' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Payments primary/ })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Payments primary' })).toBeVisible();
    await expect(page.getByText('A. Rahman until 18:00 UTC')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Escalation chain' })).toBeVisible();
    await expect(page.getByText('Head of SRE')).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });

  test('opens from the sidebar and selects the first schedule', async ({ page }) => {
    await page.goto('/w/payments-uk/home');
    await page.getByRole('link', { name: 'On-call' }).click();

    await expect(page).toHaveURL(/schedule=payments-primary/);
    await expect(page.getByText('Sara Malik 18:00 to 02:00')).toBeVisible();
  });

  test('mirrors the page in Arabic', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'relyxus-locale', value: 'ar', url: baseURL ?? '' }]);
    await page.goto('/w/payments-uk/on-call?schedule=payments-primary');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1, name: 'المناوبة والتصعيد' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});

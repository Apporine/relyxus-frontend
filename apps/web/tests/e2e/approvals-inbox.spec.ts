import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

test.describe('approvals inbox', () => {
  test('opens from the command centre and shows the restart approval detail', async ({ page }) => {
    await page.goto('/w/payments-uk/home');
    await page.getByRole('link', { name: 'Review' }).first().click();

    await expect(page).toHaveURL(/approval=approval-restart-payments-api/);
    await expect(page.getByRole('heading', { level: 1, name: 'Approvals' })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Restart payments-api' }),
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Command' }).getByText('kubectl rollout restart'),
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Consequence ladder' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reject with reason' })).toBeEnabled();
    await expect(
      page.getByRole('button', { name: 'Approve Restart payments-api in PROD' }),
    ).toBeDisabled();
  });

  test('requires a reason before rejecting a production action', async ({ page }) => {
    await page.goto('/w/payments-uk/approvals?approval=approval-scale-settlement-staging');

    await page.getByRole('button', { name: 'Reject with reason' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Reject Scale settlement-worker' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Reject request' }).click();
    await expect(page.getByText('Enter a reason before rejecting.')).toBeVisible();

    await page.getByLabel('Reason').fill('Need load test window confirmation from platform team.');
    await page.getByRole('button', { name: 'Reject request' }).click();
    await expect(page.getByText('Rejected. The proposer can see your reason.')).toBeVisible();
  });

  test('mirrors the inbox in Arabic', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'relyxus-locale', value: 'ar', url: baseURL ?? '' }]);
    await page.goto('/w/payments-uk/approvals?approval=approval-restart-payments-api');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1, name: 'الموافقات' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });

  test('has no WCAG 2.2 AA violations in English', async ({ page }) => {
    await page.goto('/w/payments-uk/approvals?approval=approval-restart-payments-api');
    await expect(page.getByRole('heading', { level: 1, name: 'Approvals' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});

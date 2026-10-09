import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

// Figma frames 37 and 38 are drawn at 390 by 844.
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

test.describe('mobile incident summary and approval', () => {
  test('summarises the incident with the pending decision and no violations', async ({ page }) => {
    await page.goto('/w/payments-uk/incidents/INC-2041/summary');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Card authorisation failures in UK' }),
    ).toBeVisible();
    await expect(page.getByText('Configuration regression in payments-api')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open approval' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Acknowledge' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });

  test('acknowledges from the phone', async ({ page }) => {
    await page.goto('/w/payments-uk/incidents/INC-2041/summary');
    const acknowledge = page.getByRole('button', { name: 'Acknowledge' });
    await expect(acknowledge).toBeEnabled();

    await acknowledge.click();

    await expect(page.getByText(/Acknowledged by .* at/)).toBeVisible();
  });

  test('opens the approval with its consequences and deliberate decision controls', async ({
    page,
  }) => {
    await page.goto('/w/payments-uk/incidents/INC-2041/summary');
    await page.getByRole('link', { name: 'Open approval' }).click();

    await page.waitForURL(/approvals\/approval-restart-payments-api/);
    await expect(page.getByText('Approval needed')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Command' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Reject with reason/ })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });

  test('offers Me in the bottom navigation', async ({ page }) => {
    await page.goto('/w/payments-uk/home');

    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Me' }).click();

    await page.waitForURL(/\/me/);
    await expect(page.getByRole('heading', { level: 1, name: 'Personal settings' })).toBeVisible();
  });
});

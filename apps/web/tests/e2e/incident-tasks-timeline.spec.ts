import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

test.describe('incident tasks and timeline', () => {
  test('shows the tasks kanban for INC-2041', async ({ page }) => {
    await page.goto('/w/payments-uk/incidents/INC-2041/tasks');

    await expect(page.getByRole('heading', { level: 1, name: 'Incident tasks' })).toBeVisible();
    await expect(page.getByText('INC-2041 · Card authorisation failures in UK')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Open' })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Compare rollout diff' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Restart payments-api' }),
    ).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });

  test('shows the full timeline with filters for INC-2041', async ({ page }) => {
    await page.goto('/w/payments-uk/incidents/INC-2041/timeline');

    await expect(page.getByRole('heading', { level: 1, name: 'Incident timeline' })).toBeVisible();
    await expect(page.getByRole('toolbar', { name: 'Timeline filters' })).toBeVisible();
    await expect(page.getByText('Restart payments-api proposed')).toBeVisible();
    await expect(page.getByText('Payments PROD v18')).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });

  test('opens full views from the war room activity panel', async ({ page }) => {
    await page.goto('/w/payments-uk/incidents/INC-2041?panel=activity&activity=tasks');
    await page.getByRole('link', { name: 'View all tasks' }).click();
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Incident tasks' })).toBeVisible();

    await page.goto('/w/payments-uk/incidents/INC-2041?panel=activity&activity=timeline');
    await page.getByRole('link', { name: 'View full timeline' }).click();
    await expect(page).toHaveURL(/\/timeline$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Incident timeline' })).toBeVisible();
  });

  test('mirrors tasks and timeline in Arabic', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'relyxus-locale', value: 'ar', url: baseURL ?? '' }]);
    await page.goto('/w/payments-uk/incidents/INC-2041/tasks');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1, name: 'مهام الحادثة' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});

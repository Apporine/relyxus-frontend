import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

test.describe('declare incident', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/w/payments-uk/incidents/new');
    await expect(page.getByRole('heading', { level: 1, name: 'Declare incident' })).toBeVisible();
  });

  test('shows the wizard layout and enables declare when required fields are complete', async ({
    page,
  }) => {
    await expect(page.getByRole('heading', { name: 'Declaration progress' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Incident details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Declaration preview' })).toBeVisible();

    const declareButton = page.getByRole('button', { name: 'Declare incident' });
    await expect(declareButton).toBeDisabled();

    await page.getByRole('combobox', { name: 'Incident type' }).click();
    await page.getByRole('option', { name: 'Payment outage' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Card authorisation spike');
    await page.getByRole('checkbox', { name: 'Card payments' }).check();
    await page.getByRole('combobox', { name: 'Severity' }).click();
    await page.getByRole('option', { name: 'SEV1' }).click();

    await expect(declareButton).toBeEnabled();
  });

  test('declares an incident and opens the war room placeholder', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Incident type' }).click();
    await page.getByRole('option', { name: 'Payment outage' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Card authorisation spike');
    await page.getByRole('checkbox', { name: 'Card payments' }).check();
    await page.getByRole('combobox', { name: 'Severity' }).click();
    await page.getByRole('option', { name: 'SEV1' }).click();

    await page.getByRole('button', { name: 'Declare incident' }).click();
    await expect(page).toHaveURL(/\/w\/payments-uk\/incidents\/INC-\d+$/);
    await expect(page.getByRole('heading', { level: 1, name: /INC-\d+ war room/ })).toBeVisible();
  });

  test('has no WCAG 2.2 AA violations in English or Arabic', async ({ page, context, baseURL }) => {
    await expectNoAccessibilityViolations(page);

    await context.addCookies([{ name: 'relyxus-locale', value: 'ar', url: baseURL ?? '' }]);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'إعلان حادثة' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});

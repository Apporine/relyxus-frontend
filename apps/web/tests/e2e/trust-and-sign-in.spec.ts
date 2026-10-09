import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

test.describe('trust centre and sign-in', () => {
  test('the public Trust Centre lets a buyer download and request material', async ({ page }) => {
    await page.goto('/trust');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Relyxus Trust Centre' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Download ISO 27001 certificate' })).toBeVisible();
    await expect(page.getByText('Legacy architecture')).toHaveCount(0);
    await expectNoAccessibilityViolations(page);
  });

  test('a buyer requests NDA material after accepting the NDA', async ({ page }) => {
    await page.goto('/trust');

    await page.getByRole('button', { name: 'Request access to SOC 2 Type II report' }).click();
    await page.getByRole('textbox', { name: /Full name/ }).fill('Layla Haddad');
    await page.getByRole('textbox', { name: /Work email/ }).fill('layla@bank.example');
    await page.getByRole('textbox', { name: /Company/ }).fill('Example Bank');
    await page.getByRole('checkbox', { name: /non-disclosure agreement/ }).click();
    await page.getByRole('button', { name: 'Send request' }).click();

    await expect(page.getByText('Request received')).toBeVisible();
  });

  test('maintainers see internal documents in the console', async ({ page }) => {
    await page.goto('/w/payments-uk/settings/trust-centre');

    await expect(page.getByRole('heading', { level: 1, name: 'Trust Centre' })).toBeVisible();
    await expect(page.getByRole('row', { name: /Legacy architecture/ })).toContainText(
      'Never shown to buyers',
    );
    await expectNoAccessibilityViolations(page);
  });

  test('sign-in renders with no violations and offers the demo workspace', async ({ page }) => {
    await page.goto('/sign-in?reason=session-expired&returnTo=%2Fw%2Fpayments-uk%2Fhome');

    await expect(page.getByRole('heading', { level: 1, name: 'Sign in to Relyxus' })).toBeVisible();
    await expect(page.getByText('Your session ended')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open the demo workspace' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});

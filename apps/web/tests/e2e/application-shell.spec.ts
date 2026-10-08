import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

test.describe('application shell', () => {
  test('opens the first workspace from the console root', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/w/payments-uk/home');
    await expect(page.getByRole('heading', { level: 1, name: 'Command Centre' })).toBeVisible();
  });

  test('shows thirteen destinations in four groups with no WCAG 2.2 AA violations', async ({
    page,
  }) => {
    await page.goto('/w/payments-uk/home');
    const navigation = page.getByRole('navigation', { name: 'Primary' });

    await expect(navigation.getByRole('link')).toHaveCount(13);
    await expect(navigation.getByRole('link', { name: 'Command Centre' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expectNoAccessibilityViolations(page);
  });

  test('mirrors the layout in Arabic', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'relyxus-locale', value: 'ar', url: baseURL ?? '' }]);
    await page.goto('/w/payments-uk/home');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1, name: 'مركز القيادة' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });

  test('opens and filters the command palette from the keyboard, closing with Escape', async ({
    page,
  }) => {
    await page.goto('/w/payments-uk/home');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.keyboard.press('Control+k');
    const palette = page.getByRole('combobox', { name: 'Search commands and destinations' });
    await expect(palette).toBeFocused();
    await palette.fill('incid');
    await expect(page.getByRole('option')).toHaveText(['Declare incident', 'Incidents']);

    await page.keyboard.press('Escape');
    await expect(palette).toBeHidden();
  });

  test('does not reveal whether an inaccessible workspace exists', async ({ page }) => {
    await page.goto('/w/treasury-sa/home');

    await expect(
      page.getByRole('heading', { name: "You don't have access to this workspace" }),
    ).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(0);
  });
});

import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './accessibility';

/*
 * UI/UX s. 18, flow 1 steps 3 to 5: open the war room, read the header and AI summary,
 * review the proposed action. Plus restricted access and Arabic layout.
 */

const WAR_ROOM_PATH = '/w/payments-uk/incidents/INC-2041';

test.describe('incident war room', () => {
  test('shows impact, investigation and the pending decision with no WCAG 2.2 AA violations', async ({
    page,
  }) => {
    await page.goto(WAR_ROOM_PATH);

    await expect(
      page.getByRole('heading', { level: 1, name: 'Card authorisation failures in UK' }),
    ).toBeVisible();
    await expect(page.getByText(/GBP\s184,000/).first()).toBeVisible();
    await expect(page.getByText('Payment failures correlate', { exact: false })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Configuration regression in payments-api' }),
    ).toBeVisible();
    await expect(page.getByRole('article', { name: 'Restart payments-api' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open approval' })).toHaveAttribute(
      'href',
      '/w/payments-uk/approvals?approval=approval-restart-payments-api',
    );
    await expectNoAccessibilityViolations(page);
  });

  test('acknowledges the incident from the keyboard', async ({ page }) => {
    await page.goto('/w/payments-uk/incidents/INC-2038');
    const acknowledgeButton = page.getByRole('button', { name: 'Acknowledge' });
    await expect(acknowledgeButton).toBeEnabled();

    await page.keyboard.press('a');

    await expect(page.getByText(/Acknowledged by Sara Malik at/)).toBeVisible();
  });

  test('keeps the panel choice in the URL on narrower screens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(WAR_ROOM_PATH);

    await page.getByRole('tab', { name: /Decisions/ }).click();

    await expect(page).toHaveURL(`${WAR_ROOM_PATH}?panel=decisions`);
    await expect(page.getByRole('article', { name: 'Restart payments-api' })).toBeVisible();
  });

  test('does not reveal whether a restricted incident exists', async ({ page }) => {
    await page.goto('/w/payments-uk/incidents/INC-1999');

    await expect(
      page.getByRole('heading', { name: "You don't have access to this item" }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Acknowledge' })).toHaveCount(0);
  });

  test('mirrors the war room in Arabic', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'relyxus-locale', value: 'ar', url: baseURL ?? '' }]);
    await page.goto(WAR_ROOM_PATH);

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('button', { name: 'تأكيد الاستلام' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});

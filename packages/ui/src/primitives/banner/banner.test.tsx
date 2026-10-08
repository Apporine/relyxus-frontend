import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAccessibilityViolations } from '../../test/accessibility';
import { renderWithProviders } from '../../test/render';
import { Banner } from './banner';

describe('Banner', () => {
  it('announces a danger banner as an alert without a dismiss control', () => {
    renderWithProviders(
      <Banner
        tone="danger"
        title="Break-glass access is active"
        description="Started by A. Rahman at 03:12 GST."
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Break-glass access is active');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('lets a dismissible warning banner be dismissed', async () => {
    const handleDismiss = vi.fn();
    renderWithProviders(
      <Banner
        tone="warning"
        title="Licence grace period: 12 days left"
        onDismiss={handleDismiss}
        dismissLabel="Dismiss banner"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss banner' }));
    expect(handleDismiss).toHaveBeenCalledOnce();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(
      <Banner tone="info" title="Planned maintenance on 12 Oct, 02:00 to 03:00 GST" />,
    );
    await expectNoAccessibilityViolations(container);
  });
});

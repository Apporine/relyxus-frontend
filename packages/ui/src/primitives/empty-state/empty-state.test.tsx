import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAccessibilityViolations } from '../../test/accessibility';
import { renderWithProviders } from '../../test/render';
import { Button } from '../button/button';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('renders its title at the requested heading level', () => {
    renderWithProviders(
      <EmptyState
        kind="all-clear"
        headingLevel={3}
        title="No active incidents in Payments"
        description="Last incident resolved 3 days ago."
      />,
    );
    expect(
      screen.getByRole('heading', { level: 3, name: 'No active incidents in Payments' }),
    ).toBeInTheDocument();
  });

  it('distinguishes a filtered empty state and offers its next action', async () => {
    const { container } = renderWithProviders(
      <EmptyState
        kind="filtered"
        title="No results for these filters"
        action={<Button>Clear filters</Button>}
      />,
    );

    expect(container.querySelector('[data-kind="filtered"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
    await expectNoAccessibilityViolations(container);
  });
});

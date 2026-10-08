import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAccessibilityViolations } from '../../test/accessibility';
import { renderWithProviders } from '../../test/render';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  it('toggles with the keyboard', async () => {
    const handleCheckedChange = vi.fn();
    renderWithProviders(
      <Checkbox aria-label="Select INC-2041" onCheckedChange={handleCheckedChange} />,
    );

    await userEvent.tab();
    await userEvent.keyboard(' ');

    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('exposes the mixed state for partial selections', () => {
    renderWithProviders(<Checkbox aria-label="Select all incidents" checked="indeterminate" />);
    expect(screen.getByRole('checkbox', { name: 'Select all incidents' })).toHaveAttribute(
      'aria-checked',
      'mixed',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(<Checkbox aria-label="Select INC-2041" />);
    await expectNoAccessibilityViolations(container);
  });
});

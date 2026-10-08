import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { expectNoAccessibilityViolations } from '../../test/accessibility';
import { renderWithProviders } from '../../test/render';
import { Switch } from './switch';

describe('Switch', () => {
  it('reports its state as a switch', async () => {
    renderWithProviders(<Switch aria-label="Keyboard shortcuts" />);
    const toggle = screen.getByRole('switch', { name: 'Keyboard shortcuts' });

    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(<Switch aria-label="Keyboard shortcuts" />);
    await expectNoAccessibilityViolations(container);
  });
});

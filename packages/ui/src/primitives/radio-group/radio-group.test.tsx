import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { expectNoAccessibilityViolations } from '../../test/accessibility';
import { renderWithProviders } from '../../test/render';
import { RadioGroup, RadioGroupItem } from './radio-group';

function DensityRadioGroup() {
  return (
    <RadioGroup aria-label="Density" defaultValue="comfortable">
      <RadioGroupItem value="comfortable" aria-label="Comfortable" />
      <RadioGroupItem value="compact" aria-label="Compact" />
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  it('moves focus with arrow keys and selects with Space', async () => {
    renderWithProviders(<DensityRadioGroup />);

    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    const compactOption = screen.getByRole('radio', { name: 'Compact' });
    expect(compactOption).toHaveFocus();

    await userEvent.keyboard(' ');
    expect(compactOption).toBeChecked();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(<DensityRadioGroup />);
    await expectNoAccessibilityViolations(container);
  });
});

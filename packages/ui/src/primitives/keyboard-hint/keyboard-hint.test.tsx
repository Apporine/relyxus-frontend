import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../test/render';
import { KeyboardHint } from './keyboard-hint';

describe('KeyboardHint', () => {
  it('renders each key and the sequence separator', () => {
    const { container } = renderWithProviders(<KeyboardHint keys={['G', 'H']} separator="then" />);

    expect(container.querySelectorAll('kbd')).toHaveLength(2);
    expect(screen.getByText('then')).toBeInTheDocument();
  });
});

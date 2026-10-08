import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RelyxusWordmarkLoader } from './relyxus-wordmark-loader';

describe('RelyxusWordmarkLoader', () => {
  it('announces a loading status to assistive technology', () => {
    render(<RelyxusWordmarkLoader label="Loading workspace" />);
    expect(screen.getByRole('status', { name: 'Loading workspace' })).toBeInTheDocument();
  });

  it('renders the Relyxus wordmark visually', () => {
    render(<RelyxusWordmarkLoader />);
    expect(screen.getByRole('status')).toHaveTextContent('Relyxus');
  });
});

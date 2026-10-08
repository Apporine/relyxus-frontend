import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAccessibilityViolations } from '../../test/accessibility';
import { renderWithProviders } from '../../test/render';
import { Button } from './button';
import { IconButton } from './icon-button';

describe('Button', () => {
  it('is a non-submitting button unless a type is given', () => {
    renderWithProviders(<Button>Acknowledge</Button>);
    expect(screen.getByRole('button', { name: 'Acknowledge' })).toHaveAttribute('type', 'button');
  });

  it('keeps its label, reports busy and ignores clicks while loading', async () => {
    const handleClick = vi.fn();
    renderWithProviders(
      <Button isLoading onClick={handleClick}>
        Restart payments-api in PROD
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Restart payments-api in PROD' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();

    await userEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders its child element when asChild is set', () => {
    renderWithProviders(
      <Button asChild variant="primary">
        <a href="/w/payments-uk/incidents/new">Declare incident</a>
      </Button>,
    );
    expect(screen.getByRole('link', { name: 'Declare incident' })).toHaveAttribute(
      'href',
      '/w/payments-uk/incidents/new',
    );
  });

  it('keeps primary actions readable when disabled', () => {
    renderWithProviders(
      <Button variant="primary" disabled>
        Approve Restart payments-api in PROD
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Approve Restart payments-api in PROD' });
    expect(button).toBeDisabled();
    expect(button.className).toContain('disabled:bg-surface-2');
    expect(button.className).toContain('disabled:text-fg-tertiary');
  });

  it('has no accessibility violations in each variant', async () => {
    const { container } = renderWithProviders(
      <div>
        <Button variant="primary">Approve production action</Button>
        <Button variant="secondary">Open evidence</Button>
        <Button variant="tertiary">View policy</Button>
        <Button variant="danger">Reject with reason</Button>
        <Button variant="ghost">Cancel</Button>
      </div>,
    );
    await expectNoAccessibilityViolations(container);
  });
});

describe('IconButton', () => {
  it('uses its label as the accessible name', () => {
    renderWithProviders(<IconButton label="Copy incident link" icon={<svg />} />);
    expect(screen.getByRole('button', { name: 'Copy incident link' })).toBeInTheDocument();
  });

  it('shows its label as a tooltip on keyboard focus', async () => {
    renderWithProviders(<IconButton label="Copy incident link" icon={<svg />} />);
    await userEvent.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Copy incident link');
  });
});

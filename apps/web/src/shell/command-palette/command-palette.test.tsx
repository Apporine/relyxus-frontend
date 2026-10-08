import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { nextNavigationMock, routerMock } from '@/test/next-navigation-mock';
import { renderInWorkspace } from '@/test/render-in-workspace';

import { CommandPalette } from './command-palette';

vi.mock('next/navigation', () => nextNavigationMock);

describe('CommandPalette', () => {
  beforeEach(() => {
    routerMock.push.mockReset();
  });

  it('offers declaring an incident first, then destinations', () => {
    renderInWorkspace(<CommandPalette isOpen onOpenChange={vi.fn()} />);

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveTextContent('Declare incident');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options).toHaveLength(14);
  });

  it('filters as the person types and runs the active command with Enter', async () => {
    const handleOpenChange = vi.fn();
    renderInWorkspace(<CommandPalette isOpen onOpenChange={handleOpenChange} />);

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Search commands and destinations' }),
      'comp',
    );
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Compliance',
    ]);

    await userEvent.keyboard('{Enter}');
    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(routerMock.push).toHaveBeenCalledWith('/w/payments-uk/compliance');
  });

  it('moves the active option with the arrow keys and wraps around', async () => {
    renderInWorkspace(<CommandPalette isOpen onOpenChange={vi.fn()} />);
    const combobox = screen.getByRole('combobox');

    await userEvent.type(combobox, '{ArrowDown}');
    expect(combobox).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Command Centre' }).id,
    );

    await userEvent.type(combobox, '{ArrowUp}{ArrowUp}');
    expect(screen.getByRole('option', { name: 'Admin' })).toHaveAttribute('aria-selected', 'true');
  });

  it('only lists areas the person can open', () => {
    renderInWorkspace(<CommandPalette isOpen onOpenChange={vi.fn()} />, {
      accessibleAreas: ['command-centre', 'audit'],
    });

    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Command Centre',
      'Audit',
    ]);
  });

  it('says when nothing matches', async () => {
    renderInWorkspace(<CommandPalette isOpen onOpenChange={vi.fn()} />);

    await userEvent.type(screen.getByRole('combobox'), 'kubernetes');

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(screen.getByText('No commands match “kubernetes”')).toBeInTheDocument();
  });
});

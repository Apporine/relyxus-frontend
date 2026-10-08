import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useGlobalShortcuts, type GlobalShortcutHandlers } from './use-global-shortcuts';

function ShortcutHarness(handlers: GlobalShortcutHandlers) {
  useGlobalShortcuts(handlers);
  return <input aria-label="Incident title" />;
}

function renderHarness() {
  const handlers = {
    onOpenCommandPalette: vi.fn(),
    onShowShortcuts: vi.fn(),
    onGoToArea: vi.fn(),
  };
  render(<ShortcutHarness {...handlers} />);
  return handlers;
}

describe('useGlobalShortcuts', () => {
  it('opens the command palette with Ctrl + K, even inside a field', async () => {
    const handlers = renderHarness();

    await userEvent.click(screen.getByRole('textbox'));
    await userEvent.keyboard('{Control>}k{/Control}');

    expect(handlers.onOpenCommandPalette).toHaveBeenCalledOnce();
  });

  it.each([
    ['h', 'command-centre'],
    ['i', 'incidents'],
    ['a', 'approvals'],
  ])('goes to an area with G then %s', async (secondKey, expectedArea) => {
    const handlers = renderHarness();

    await userEvent.keyboard(`g${secondKey}`);

    expect(handlers.onGoToArea).toHaveBeenCalledWith(expectedArea);
  });

  it('shows the shortcut list with ?', async () => {
    const handlers = renderHarness();

    await userEvent.keyboard('?');

    expect(handlers.onShowShortcuts).toHaveBeenCalledOnce();
  });

  it('never fires letter shortcuts while typing in a field', async () => {
    const handlers = renderHarness();

    await userEvent.type(screen.getByRole('textbox'), 'gi?');

    expect(handlers.onGoToArea).not.toHaveBeenCalled();
    expect(handlers.onShowShortcuts).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox')).toHaveValue('gi?');
  });

  it('ignores a second key that does not complete a sequence', async () => {
    const handlers = renderHarness();

    await userEvent.keyboard('gx');

    expect(handlers.onGoToArea).not.toHaveBeenCalled();
  });
});

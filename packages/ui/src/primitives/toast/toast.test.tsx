import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '../../test/render';
import { useToast, type ToastOptions } from './toast';

function ToastTrigger({ options }: { options: ToastOptions }) {
  const { showToast } = useToast();
  return (
    <button type="button" onClick={() => showToast(options)}>
      Show toast
    </button>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  it('removes a success toast after five seconds', async () => {
    renderWithProviders(
      <ToastTrigger options={{ tone: 'success', title: 'Task assigned to M. Khan' }} />,
    );

    await user().click(screen.getByRole('button', { name: 'Show toast' }));
    expect(screen.getByText('Task assigned to M. Khan')).toBeInTheDocument();

    await act(() => vi.advanceTimersByTimeAsync(5_100));
    expect(screen.queryByText('Task assigned to M. Khan')).not.toBeInTheDocument();
  });

  it('keeps an error toast until it is dismissed', async () => {
    renderWithProviders(
      <ToastTrigger
        options={{ tone: 'error', title: 'Note was not saved', description: 'Reference RX-7F2A.' }}
      />,
    );

    await user().click(screen.getByRole('button', { name: 'Show toast' }));
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(screen.getByText('Note was not saved')).toBeInTheDocument();

    await user().click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByText('Note was not saved')).not.toBeInTheDocument();
  });

  it('shows at most three toasts', async () => {
    renderWithProviders(
      <ToastTrigger options={{ tone: 'warning', title: 'Connector degraded' }} />,
    );
    const trigger = screen.getByRole('button', { name: 'Show toast' });

    for (let toastCount = 0; toastCount < 4; toastCount += 1) {
      await user().click(trigger);
    }

    expect(screen.getAllByText('Connector degraded')).toHaveLength(3);
  });

  it('runs the undo action', async () => {
    const handleUndo = vi.fn();
    renderWithProviders(
      <ToastTrigger
        options={{
          tone: 'success',
          title: 'Evidence pinned',
          action: {
            label: 'Undo',
            alternativeText: 'Unpin it from the evidence list',
            onSelect: handleUndo,
          },
        }}
      />,
    );

    await user().click(screen.getByRole('button', { name: 'Show toast' }));
    await user().click(screen.getByRole('button', { name: 'Undo' }));

    expect(handleUndo).toHaveBeenCalledOnce();
  });
});

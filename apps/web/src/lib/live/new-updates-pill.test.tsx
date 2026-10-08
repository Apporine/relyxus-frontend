import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithIntl } from '@/test/render-with-intl';

import { NewUpdatesPill } from './new-updates-pill';

describe('NewUpdatesPill', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is absent when nothing is pending', () => {
    renderWithIntl(<NewUpdatesPill pendingCount={0} onReveal={vi.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('names the count with the correct plural and reveals on click', async () => {
    const handleReveal = vi.fn();
    renderWithIntl(<NewUpdatesPill pendingCount={3} onReveal={handleReveal} />);

    await userEvent
      .setup({ advanceTimers: vi.advanceTimersByTime })
      .click(screen.getByRole('button', { name: '3 new updates' }));

    expect(handleReveal).toHaveBeenCalledOnce();
  });

  it('uses Arabic plural forms', () => {
    renderWithIntl(<NewUpdatesPill pendingCount={2} onReveal={vi.fn()} />, { locale: 'ar' });
    expect(screen.getByRole('button', { name: 'تحديثان جديدان' })).toBeInTheDocument();
  });

  it('announces changes at most once every five seconds', async () => {
    const { rerender } = renderWithIntl(<NewUpdatesPill pendingCount={1} onReveal={vi.fn()} />);
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(screen.getByRole('status')).toHaveTextContent('1 new update');

    rerender(<NewUpdatesPill pendingCount={4} onReveal={vi.fn()} />);
    await act(() => vi.advanceTimersByTimeAsync(1_000));
    expect(screen.getByRole('status')).toHaveTextContent('1 new update');

    await act(() => vi.advanceTimersByTimeAsync(4_100));
    expect(screen.getByRole('status')).toHaveTextContent('4 new updates');
  });
});

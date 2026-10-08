import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '../../test/render';
import { CopyButton } from './copy-button';

const copyLabels = { label: 'Copy query', copiedLabel: 'Query copied', failedLabel: 'Copy failed' };

describe('CopyButton', () => {
  it('copies the value and announces success', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CopyButton value="rate(http_requests_total[5m])" {...copyLabels} />);

    await user.click(screen.getByRole('button', { name: 'Copy query' }));

    await expect(navigator.clipboard.readText()).resolves.toBe('rate(http_requests_total[5m])');
    expect(screen.getByRole('status')).toHaveTextContent('Query copied');
  });

  it('announces when the browser refuses clipboard access', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new DOMException('Denied'));
    renderWithProviders(<CopyButton value="INC-2041" {...copyLabels} />);

    await user.click(screen.getByRole('button', { name: 'Copy query' }));

    expect(screen.getByRole('status')).toHaveTextContent('Copy failed');
  });
});

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../test/render';
import { Button } from '../button/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

describe('Dialog', () => {
  function ChangeSeverityDialog() {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Change severity</Button>
        </DialogTrigger>
        <DialogContent closeLabel="Close dialog">
          <DialogHeader>
            <DialogTitle>Change severity</DialogTitle>
            <DialogDescription>Lowering severity requires a reason.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <input aria-label="Reason" />
          </DialogBody>
        </DialogContent>
      </Dialog>
    );
  }

  it('is named by its title and moves focus inside when opened', async () => {
    renderWithProviders(<ChangeSeverityDialog />);

    await userEvent.click(screen.getByRole('button', { name: 'Change severity' }));

    const dialog = screen.getByRole('dialog', { name: 'Change severity' });
    expect(dialog).toHaveAccessibleDescription('Lowering severity requires a reason.');
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    renderWithProviders(<ChangeSeverityDialog />);
    const trigger = screen.getByRole('button', { name: 'Change severity' });

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('offers a named close button', async () => {
    renderWithProviders(<ChangeSeverityDialog />);

    await userEvent.click(screen.getByRole('button', { name: 'Change severity' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close dialog' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

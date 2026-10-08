import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../test/render';
import { Button } from '../button/button';
import { Drawer, DrawerContent, DrawerTrigger } from './drawer';

function EvidenceDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Open evidence</Button>
      </DrawerTrigger>
      <DrawerContent title="Prometheus · payments error rate" closeLabel="Close drawer">
        Evidence detail
      </DrawerContent>
    </Drawer>
  );
}

describe('Drawer', () => {
  it('opens as a dialog named by its title and takes focus itself', async () => {
    renderWithProviders(<EvidenceDrawer />);

    await userEvent.click(screen.getByRole('button', { name: 'Open evidence' }));

    const drawer = screen.getByRole('dialog', { name: 'Prometheus · payments error rate' });
    expect(drawer).toHaveTextContent('Evidence detail');
    expect(drawer).toHaveFocus();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    renderWithProviders(<EvidenceDrawer />);
    const trigger = screen.getByRole('button', { name: 'Open evidence' });

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes with its named close button', async () => {
    renderWithProviders(<EvidenceDrawer />);

    await userEvent.click(screen.getByRole('button', { name: 'Open evidence' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close drawer' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { expectNoAccessibilityViolations } from '../../test/accessibility';
import { renderWithProviders } from '../../test/render';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

function WarRoomTabs({ direction }: { direction: 'ltr' | 'rtl' }) {
  return (
    <Tabs defaultValue="timeline" dir={direction}>
      <TabsList aria-label="Incident activity">
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="tasks" count={4}>
          Tasks
        </TabsTrigger>
      </TabsList>
      <TabsContent value="timeline">Timeline events</TabsContent>
      <TabsContent value="tasks">Task list</TabsContent>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('shows the count beside the label', () => {
    renderWithProviders(<WarRoomTabs direction="ltr" />);
    expect(screen.getByRole('tab', { name: 'Tasks 4' })).toBeInTheDocument();
  });

  it('moves to the next tab with ArrowRight in left-to-right layouts', async () => {
    renderWithProviders(<WarRoomTabs direction="ltr" />);

    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'Tasks 4' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Task list');
  });

  it('moves to the next tab with ArrowLeft in right-to-left layouts', async () => {
    renderWithProviders(<WarRoomTabs direction="rtl" />, { direction: 'rtl' });

    await userEvent.tab();
    await userEvent.keyboard('{ArrowLeft}');

    expect(screen.getByRole('tab', { name: 'Tasks 4' })).toHaveAttribute('aria-selected', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(<WarRoomTabs direction="ltr" />);
    await expectNoAccessibilityViolations(container);
  });
});

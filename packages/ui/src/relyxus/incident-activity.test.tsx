import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAccessibilityViolations } from '../test/accessibility';
import { renderWithProviders } from '../test/render';
import { MetricCard } from './metric-card/metric-card';
import { OwnerChip } from './owner-chip/owner-chip';
import { RestrictedPlaceholder } from './restricted-placeholder/restricted-placeholder';
import { TaskItem } from './task-item/task-item';
import { TimelineEvent } from './timeline-event/timeline-event';

describe('TaskItem', () => {
  it('highlights a task nobody owns', () => {
    renderWithProviders(
      <TaskItem
        title="Call card network"
        status="open"
        statusLabel="Open"
        ownerName={null}
        unassignedLabel="Unassigned"
        dueText="Due 12:30 GST"
        overdueLabel="Overdue"
      />,
    );

    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });
});

describe('TimelineEvent', () => {
  it('names the actor type for screen readers', async () => {
    const { container } = renderWithProviders(
      <ol>
        <TimelineEvent
          time={<time dateTime="2026-10-07T12:05:02Z">12:05:02</time>}
          actorKind="ai"
          actorName="AI"
          actorKindLabel="AI"
          summary="Investigation started"
        />
        <TimelineEvent
          time={<time dateTime="2026-10-07T12:07:42Z">12:07:42</time>}
          actorKind="person"
          actorName="Sara M."
          actorKindLabel="Person"
          summary="Production restart requested"
          needsAttention
        />
      </ol>,
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Sara M.')).toHaveTextContent('Sara M. (Person)');
    await expectNoAccessibilityViolations(container);
  });
});

describe('MetricCard', () => {
  it('says there is no data rather than showing zero', () => {
    renderWithProviders(<MetricCard label="Resolved 24h" value={null} noDataLabel="No data yet" />);
    expect(screen.getByText('No data yet')).toBeInTheDocument();
  });

  it('marks itself busy while loading', () => {
    const { container } = renderWithProviders(
      <MetricCard label="SEV1" value={null} noDataLabel="No data yet" isLoading />,
    );
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
  });
});

describe('OwnerChip', () => {
  it('shows the name and on-call status', () => {
    renderWithProviders(<OwnerChip name="Ayesha Rahman" kind="person" onCallLabel="On call" />);
    expect(screen.getByText('Ayesha Rahman')).toBeInTheDocument();
    expect(screen.getByText('On call')).toBeInTheDocument();
  });
});

describe('RestrictedPlaceholder', () => {
  it('shows only the generic message', () => {
    const { container } = renderWithProviders(
      <RestrictedPlaceholder message="You don't have access to this item" />,
    );
    expect(container).toHaveTextContent(/^You don't have access to this item$/);
  });
});

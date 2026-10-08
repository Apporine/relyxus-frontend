import type { Meta, StoryObj } from '@storybook/react-vite';

import { MetricCard } from './metric-card/metric-card';
import { OwnerChip } from './owner-chip/owner-chip';
import { RestrictedPlaceholder } from './restricted-placeholder/restricted-placeholder';
import { TaskItem } from './task-item/task-item';
import { TimelineEvent } from './timeline-event/timeline-event';

const meta = {
  title: 'Relyxus/Incident activity',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Timeline: Story = {
  render: () => (
    <ol className="max-w-md">
      <TimelineEvent
        time={<time dateTime="2026-10-07T12:04:31Z">12:04:31</time>}
        actorKind="external"
        actorName="Prometheus"
        actorKindLabel="External tool"
        summary="5xx rate exceeded 22%"
      />
      <TimelineEvent
        time={<time dateTime="2026-10-07T12:05:02Z">12:05:02</time>}
        actorKind="ai"
        actorName="AI"
        actorKindLabel="AI"
        summary="Investigation started"
      />
      <TimelineEvent
        time={<time dateTime="2026-10-07T12:05:41Z">12:05:41</time>}
        actorKind="system"
        actorName="System"
        actorKindLabel="System"
        summary="ServiceNow change CHG-88421 linked"
      />
      <TimelineEvent
        time={<time dateTime="2026-10-07T12:07:42Z">12:07:42</time>}
        actorKind="system"
        actorName="Approval"
        actorKindLabel="System"
        summary="Production restart requested"
        needsAttention
      />
    </ol>
  ),
};

export const Tasks: Story = {
  render: () => (
    <div className="max-w-xl">
      <TaskItem
        title="Compare rollout diff"
        status="in-progress"
        statusLabel="In progress"
        ownerName="M. Khan"
        unassignedLabel="Unassigned"
      />
      <TaskItem
        title="Validate rollback package"
        status="done"
        statusLabel="Done"
        ownerName="System"
        unassignedLabel="Unassigned"
      />
      <TaskItem
        title="Confirm UK traffic concentration"
        status="blocked"
        statusLabel="Blocked"
        ownerName="A. Rahman"
        unassignedLabel="Unassigned"
      />
      <TaskItem
        title="Call card network"
        status="open"
        statusLabel="Open"
        ownerName={null}
        unassignedLabel="Unassigned"
        dueText="Due 12:30 GST"
        overdueLabel="Overdue"
      />
    </div>
  ),
};

export const SummaryMetrics: Story = {
  render: () => (
    <div className="grid max-w-3xl grid-cols-2 gap-3 laptop:grid-cols-4">
      <MetricCard
        label="SEV1"
        value="1"
        caption="active now"
        tone="critical"
        noDataLabel="No data yet"
      />
      <MetricCard
        label="SEV2"
        value="2"
        caption="active now"
        tone="major"
        noDataLabel="No data yet"
      />
      <MetricCard
        label="Resolved 24h"
        value="7"
        caption="last 24 hours"
        tone="healthy"
        noDataLabel="No data yet"
      />
      <MetricCard label="Monitoring" value={null} noDataLabel="No data yet" isLoading />
    </div>
  ),
};

export const OwnersAndRestriction: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      <OwnerChip name="Sara Malik" kind="person" onCallLabel="On call" />
      <OwnerChip name="Payments SRE" kind="team" />
      <OwnerChip name="Change Authority" kind="role" />
      <RestrictedPlaceholder message="You don't have access to this item" />
    </div>
  ),
};

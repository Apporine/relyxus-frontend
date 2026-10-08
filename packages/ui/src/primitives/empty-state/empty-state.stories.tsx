import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../button/button';
import { EmptyState } from './empty-state';

const meta = {
  title: 'Base/Empty state',
  component: EmptyState,
  args: {
    kind: 'all-clear',
    title: 'No active incidents in Payments',
    description: 'Last incident resolved 3 days ago.',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllClear: Story = {};

export const FirstUse: Story = {
  args: {
    kind: 'first-use',
    title: 'No policies yet',
    description: 'Relyxus will only suggest actions until you create one.',
    action: <Button variant="primary">Create a policy in Suggest mode</Button>,
  },
};

export const FilteredEmpty: Story = {
  args: {
    kind: 'filtered',
    title: 'No results for these filters',
    action: <Button>Clear filters</Button>,
  },
};

export const NoPermission: Story = {
  args: {
    kind: 'no-permission',
    title: 'You need the Compliance officer role to classify incidents',
    action: <Button>Request access</Button>,
  },
};

export const DisconnectedSource: Story = {
  args: {
    kind: 'disconnected',
    title: 'Prometheus is disconnected',
    description: 'Last healthy at 11:52 GST. Metrics evidence is unavailable until it reconnects.',
    action: <Button>Open connector</Button>,
  },
};

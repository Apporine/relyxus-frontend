import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copy, RotateCcw } from 'lucide-react';

import { Button } from './button';
import { IconButton } from './icon-button';

const meta = {
  title: 'Base/Button',
  component: Button,
  args: {
    children: 'Open evidence',
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary', children: 'Acknowledge' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Open evidence' },
};

export const Tertiary: Story = {
  args: { variant: 'tertiary', children: 'View policy' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Reject with reason' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Cancel' },
};

export const ProductionActionWithIcon: Story = {
  args: {
    variant: 'primary',
    children: (
      <>
        <RotateCcw aria-hidden />
        Roll back payments-api in PROD
      </>
    ),
  },
};

export const Loading: Story = {
  args: { variant: 'primary', isLoading: true, children: 'Approving' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Change state' },
};

export const DisabledPrimary: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Approve Restart payments-api in PROD',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large touch target</Button>
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <IconButton label="Copy incident link" icon={<Copy />} />
      <IconButton label="Copy incident link" icon={<Copy />} variant="secondary" />
      <IconButton label="Copy incident link" icon={<Copy />} variant="tertiary" size="large" />
    </div>
  ),
};

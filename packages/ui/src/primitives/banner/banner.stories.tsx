import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../button/button';
import { Banner } from './banner';

const meta = {
  title: 'Base/Banner',
  component: Banner,
  args: {
    tone: 'info',
    title: 'Planned maintenance on 12 Oct, 02:00 to 03:00 GST',
  },
} satisfies Meta<typeof Banner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = {};

export const RelyxusDegraded: Story = {
  args: {
    tone: 'warning',
    placement: 'global',
    title: 'Relyxus is degraded: AI reasoning paused',
    description:
      'Evidence gathering, alert intake and approvals still work. Provider route eu-west recovering.',
    action: <Button size="small">View platform status</Button>,
  },
};

export const LicenceGraceDismissible: Story = {
  args: {
    tone: 'warning',
    title: 'Licence grace period: 12 days left',
    description: 'Configuration changes and upgrades will be blocked after 20 Oct 2026.',
    onDismiss: () => undefined,
    dismissLabel: 'Dismiss banner',
  },
};

export const BreakGlassActive: Story = {
  args: {
    tone: 'danger',
    placement: 'global',
    title: 'Break-glass access is active',
    description: 'Started by A. Rahman at 03:12 GST. The security team has been alerted.',
  },
};

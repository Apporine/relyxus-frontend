import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../primitives/button/button';
import { ActionCard, type ActionCardProps } from './action-card';

const restartPaymentsApi: ActionCardProps = {
  eyebrow: 'Production action',
  title: 'Restart payments-api',
  environment: 'production',
  environmentLabel: 'PROD',
  state: 'waiting-for-approval',
  stateLabel: 'Waiting for approval',
  command: 'kubectl rollout restart deployment/payments-api -n payments',
  commandLabel: 'Command',
  commandCopyLabels: {
    label: 'Copy command',
    copiedLabel: 'Command copied',
    failedLabel: 'Copy failed',
  },
  facts: {
    target: 'payments-api / eu-west-2 / PROD · 3 pods · UK card traffic',
    rationale: 'Configuration regression in payments-api (82%) · 6 evidence links',
    policy: 'Payments PROD v18 · proposer excluded · MFA required',
    approvers: 'Sara M. (on call) approved · payments lead waiting · 1 of 2',
    dryRun: 'Dry run passed at 12:14 UTC',
    verification: '5xx below 2% for 5 minutes, else roll back to revision 184',
    expiry: 'Expires in 03:18',
  },
  factLabels: {
    target: 'Target',
    rationale: 'Because',
    policy: 'Policy',
    approvers: 'Approvers',
    dryRun: 'Dry run',
    verification: 'Verify',
    expiry: 'Expiry',
  },
  missingFactLabel: 'Not available',
  incompleteNotice: 'This action cannot be approved until every part of the card is available.',
};

const meta = {
  title: 'Relyxus/Action card',
  component: ActionCard,
  args: restartPaymentsApi,
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ActionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WaitingForApproval: Story = {
  args: {
    decision: (
      <div className="flex flex-wrap gap-3">
        <Button variant="primary">Approve production action</Button>
        <Button variant="danger">Reject with reason</Button>
        <Button variant="tertiary">Ask a question</Button>
      </div>
    ),
  },
};

export const MissingDryRun: Story = {
  args: {
    facts: { ...restartPaymentsApi.facts, dryRun: null },
    decision: <Button variant="primary">Approve production action</Button>,
  },
};

export const Succeeded: Story = {
  args: {
    eyebrow: 'Production action',
    state: 'succeeded',
    stateLabel: 'Succeeded · verified 12:21 UTC',
  },
};

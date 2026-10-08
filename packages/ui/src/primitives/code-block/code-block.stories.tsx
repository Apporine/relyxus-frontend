import type { Meta, StoryObj } from '@storybook/react-vite';

import { CodeBlock } from './code-block';

const copyLabels = { label: 'Copy', copiedLabel: 'Copied', failedLabel: 'Copy failed' };

const meta = {
  title: 'Base/Code block',
  component: CodeBlock,
  args: {
    label: 'Command',
    code: 'kubectl rollout restart deployment/payments-api -n payments',
    copyLabels,
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Command: Story = {};

export const Query: Story = {
  args: {
    label: 'PromQL query',
    code: 'sum(rate(http_requests_total{service="payments-api",status=~"5.."}[5m]))',
  },
};

export const LongLogSample: Story = {
  args: {
    label: 'Log sample',
    code: Array.from(
      { length: 14 },
      (_, index) =>
        `2026-10-07T12:04:${String(10 + index).padStart(2, '0')}Z payments-api ERROR upstream card-network 503`,
    ).join('\n'),
  },
};

export const Json: Story = {
  args: {
    label: 'Action payload',
    code: JSON.stringify(
      {
        action: 'kubernetes.rollout_restart',
        target: { cluster: 'uk-prod-01', namespace: 'payments' },
      },
      null,
      2,
    ),
  },
};

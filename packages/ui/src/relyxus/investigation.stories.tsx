import type { Meta, StoryObj } from '@storybook/react-vite';

import { EvidenceItem } from './evidence-item/evidence-item';
import { HypothesisCard } from './hypothesis-card/hypothesis-card';

const confidenceBandLabels = { high: 'High', medium: 'Medium', low: 'Low' };

const meta = {
  title: 'Relyxus/Investigation',
  decorators: [
    (Story) => (
      <div className="flex max-w-2xl flex-col gap-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const RankedHypotheses: Story = {
  render: () => (
    <>
      <HypothesisCard
        rank={1}
        cause="Configuration regression in payments-api"
        confidencePercent={82}
        confidenceBandLabels={confidenceBandLabels}
        supportingEvidence={{ count: 6, label: 'Supporting evidence' }}
        refutingEvidence={{ count: 1, label: 'Refuting evidence' }}
        status="under-test"
        statusLabel="Under test"
        actions={
          <>
            <a href="#why-ranked-first" className="text-fg-secondary underline">
              Why this is ranked first
            </a>
            <a href="#evidence" className="font-semibold text-fg-primary">
              Open evidence
            </a>
          </>
        }
      />
      <HypothesisCard
        rank={2}
        cause="Database connection pool saturation"
        confidencePercent={31}
        confidenceBandLabels={confidenceBandLabels}
        supportingEvidence={{ count: 2, label: 'Supporting evidence' }}
        refutingEvidence={{ count: 3, label: 'Refuting evidence' }}
        status="under-test"
        statusLabel="Under test"
        whatWasChecked={{
          heading: 'What was checked',
          summary: 'Pool usage, DB latency, lock wait, failover state',
        }}
      />
      <HypothesisCard
        rank={3}
        cause="Card network outage"
        confidencePercent={4}
        confidenceBandLabels={confidenceBandLabels}
        supportingEvidence={{ count: 0, label: 'Supporting evidence' }}
        refutingEvidence={{ count: 4, label: 'Refuting evidence' }}
        status="ruled-out"
        statusLabel="Ruled out"
        ruledOutReason="Card network status page and synthetic checks were healthy throughout."
      />
    </>
  ),
};

export const EvidenceStates: Story = {
  render: () => (
    <>
      <EvidenceItem
        title="Prometheus · payments error rate"
        query={'rate(http_requests_total{status=~"5.."}[5m])'}
        capturedAtText="Captured 12:04:31 UTC"
        freshness={{ value: 'fresh', label: 'Fresh' }}
        integrity={{ value: 'verified', label: 'Hash verified' }}
      />
      <EvidenceItem
        title="Loki · payments-api errors"
        query={'{app="payments-api"} |= "upstream"'}
        capturedAtText="Captured 11:52:10 UTC"
        freshness={{ value: 'stale', label: 'Stale' }}
        integrity={{ value: 'verified', label: 'Hash verified' }}
        connectorHealth={{ value: 'degraded', label: 'Degraded' }}
        redactionNotice="Card numbers and emails redacted before storage"
      />
      <EvidenceItem
        title="Deploy record · CHG-88421"
        capturedAtText="Captured 12:01:12 UTC"
        freshness={{ value: 'fresh', label: 'Fresh' }}
        integrity={{ value: 'mismatch', label: 'Hash mismatch' }}
      />
    </>
  ),
};

import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAccessibilityViolations } from '../../test/accessibility';
import { renderWithProviders } from '../../test/render';
import { EvidenceItem } from './evidence-item';

describe('EvidenceItem', () => {
  it('shows the query left-to-right with capture time, freshness and integrity', async () => {
    const { container } = renderWithProviders(
      <EvidenceItem
        title="Prometheus · payments error rate"
        query={'rate(http_requests_total{status=~"5.."}[5m])'}
        capturedAtText="Captured 12:04:31 UTC"
        freshness={{ value: 'fresh', label: 'Fresh' }}
        integrity={{ value: 'verified', label: 'Hash verified' }}
      />,
    );

    expect(screen.getByText('rate(http_requests_total{status=~"5.."}[5m])')).toHaveAttribute(
      'dir',
      'ltr',
    );
    expect(screen.getByText('Captured 12:04:31 UTC · Fresh')).toBeInTheDocument();
    expect(screen.getByText('Hash verified')).toBeInTheDocument();
    await expectNoAccessibilityViolations(container);
  });

  it('marks stale evidence from a degraded connector', () => {
    renderWithProviders(
      <EvidenceItem
        title="Loki · payments-api errors"
        capturedAtText="Captured 11:52:10 UTC"
        freshness={{ value: 'stale', label: 'Stale' }}
        integrity={{ value: 'verified', label: 'Hash verified' }}
        connectorHealth={{ value: 'degraded', label: 'Degraded' }}
      />,
    );

    expect(screen.getByText('Stale')).toBeInTheDocument();
    expect(screen.getByText('Degraded')).toBeInTheDocument();
  });

  it('marks a hash mismatch', () => {
    renderWithProviders(
      <EvidenceItem
        title="Deploy record · CHG-88421"
        capturedAtText="Captured 12:01:12 UTC"
        freshness={{ value: 'fresh', label: 'Fresh' }}
        integrity={{ value: 'mismatch', label: 'Hash mismatch' }}
        redactionNotice="Card numbers redacted before storage"
      />,
    );

    expect(screen.getByText('Hash mismatch')).toBeInTheDocument();
    expect(screen.getByText('Card numbers redacted before storage')).toBeInTheDocument();
  });
});

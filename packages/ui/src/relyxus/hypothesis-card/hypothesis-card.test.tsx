import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAccessibilityViolations } from '../../test/accessibility';
import { renderWithProviders } from '../../test/render';
import { HypothesisCard } from './hypothesis-card';

const sharedProps = {
  confidenceBandLabels: { high: 'High', medium: 'Medium', low: 'Low' },
  supportingEvidence: { count: 6, label: 'Supporting evidence' },
  refutingEvidence: { count: 1, label: 'Refuting evidence' },
};

describe('HypothesisCard', () => {
  it('shows rank, cause, confidence and evidence counts', () => {
    renderWithProviders(
      <HypothesisCard
        {...sharedProps}
        rank={1}
        cause="Configuration regression in payments-api"
        confidencePercent={82}
        status="under-test"
        statusLabel="Under test"
      />,
    );

    const card = screen.getByRole('article');
    expect(card).toHaveTextContent('01');
    expect(
      screen.getByRole('heading', { name: 'Configuration regression in payments-api' }),
    ).toBeInTheDocument();
    expect(card).toHaveTextContent('82%High');
    expect(card).toHaveTextContent('Supporting evidence6');
  });

  it('shows what was checked for a low-confidence cause', () => {
    renderWithProviders(
      <HypothesisCard
        {...sharedProps}
        rank={2}
        cause="Database connection pool saturation"
        confidencePercent={31}
        status="under-test"
        statusLabel="Under test"
        whatWasChecked={{
          heading: 'What was checked',
          summary: 'Pool usage, DB latency, lock wait, failover state',
        }}
      />,
    );

    expect(screen.getByText('What was checked')).toBeInTheDocument();
    expect(screen.getByRole('article')).toHaveTextContent('31%Low');
  });

  it('shows the reason beside a ruled-out cause', async () => {
    const { container } = renderWithProviders(
      <HypothesisCard
        {...sharedProps}
        rank={3}
        cause="Card network outage"
        confidencePercent={4}
        status="ruled-out"
        statusLabel="Ruled out"
        ruledOutReason="Card network status page and synthetic checks were healthy throughout."
      />,
    );

    expect(
      screen.getByText('Card network status page and synthetic checks were healthy throughout.'),
    ).toBeVisible();
    await expectNoAccessibilityViolations(container);
  });
});

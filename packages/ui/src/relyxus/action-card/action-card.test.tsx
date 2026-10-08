import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAccessibilityViolations } from '../../test/accessibility';
import { renderWithProviders } from '../../test/render';
import { Button } from '../../primitives/button/button';
import { ActionCard, type ActionCardFacts, type ActionCardProps } from './action-card';

const completeFacts: ActionCardFacts = {
  target: '12 pods · 25% per step · max 3 runs an hour',
  rationale: 'Deploy v4.2 config error (82%) · 6 evidence links',
  policy: 'payments-rollback v3 + production rule v7',
  approvers: 'Sara (on-call) approved · payments lead waiting',
  dryRun: 'Dry run passed at 12:14',
  verification: 'Error rate under 1% in 10 min, else roll back',
  expiry: 'Expires in 13 min',
};

function renderActionCard(overrides: Partial<ActionCardProps> = {}) {
  return renderWithProviders(
    <ActionCard
      eyebrow="Production action"
      title="Roll back payments-api"
      environment="production"
      environmentLabel="PROD"
      state="waiting-for-approval"
      stateLabel="Waiting for approval"
      command="argocd app rollback payments-api --to v4.1"
      commandLabel="Command"
      commandCopyLabels={{
        label: 'Copy command',
        copiedLabel: 'Command copied',
        failedLabel: 'Copy failed',
      }}
      facts={completeFacts}
      factLabels={{
        target: 'Target',
        rationale: 'Because',
        policy: 'Policy',
        approvers: 'Approvers',
        dryRun: 'Dry run',
        verification: 'Verify',
        expiry: 'Expiry',
      }}
      missingFactLabel="Not available"
      incompleteNotice="This action cannot be approved until every part of the card is available."
      decision={<Button variant="primary">Approve</Button>}
      {...overrides}
    />,
  );
}

describe('ActionCard', () => {
  it('shows the exact command, environment and every fact', () => {
    renderActionCard();

    const card = screen.getByRole('article', { name: 'Roll back payments-api' });
    expect(card).toHaveTextContent('argocd app rollback payments-api --to v4.1');
    expect(card).toHaveTextContent('PROD');
    expect(card).toHaveTextContent('Dry run passed at 12:14');
  });

  it('offers the decision when all nine parts are present', () => {
    renderActionCard();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('withholds the decision and explains why when a part is missing', () => {
    renderActionCard({ facts: { ...completeFacts, dryRun: null } });

    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(
      'This action cannot be approved until every part of the card is available.',
    );
    expect(screen.getByText('Not available')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderActionCard();
    await expectNoAccessibilityViolations(container);
  });
});

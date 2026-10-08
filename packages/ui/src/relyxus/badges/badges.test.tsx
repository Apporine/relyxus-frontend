import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { expectNoAccessibilityViolations } from '../../test/accessibility';
import { renderWithProviders } from '../../test/render';
import { AiMarker } from '../ai-marker/ai-marker';
import { ConfidenceIndicator } from '../confidence/confidence-indicator';
import {
  ConnectorHealthBadge,
  EnvironmentBadge,
  StateBadge,
  VisibilityBadge,
} from './incident-badges';
import { SeverityBadge } from './severity-badge';

const bandLabels = { high: 'High', medium: 'Medium', low: 'Low' };

describe('operational badges', () => {
  it.each(['SEV1', 'SEV2', 'SEV3', 'SEV4'] as const)(
    '%s is written as its code with a shape icon',
    (severity) => {
      const { container } = renderWithProviders(<SeverityBadge severity={severity} />);
      expect(screen.getByText(severity)).toBeInTheDocument();
      expect(container.querySelector('svg')).not.toBeNull();
    },
  );

  it('writes the band beside the confidence percentage', () => {
    renderWithProviders(<ConfidenceIndicator confidencePercent={31} bandLabels={bandLabels} />);
    expect(screen.getByText('31%').parentElement).toHaveTextContent('31%Low');
  });

  it('has no accessibility violations across badge types', async () => {
    const { container } = renderWithProviders(
      <div>
        <SeverityBadge severity="SEV1" />
        <StateBadge label="Investigating" />
        <EnvironmentBadge environment="production" label="PROD" />
        <VisibilityBadge visibility="invite-only" label="Invite only" />
        <ConnectorHealthBadge health="degraded" label="Degraded" />
        <ConfidenceIndicator confidencePercent={82} bandLabels={bandLabels} />
      </div>,
    );
    await expectNoAccessibilityViolations(container);
  });
});

describe('AiMarker', () => {
  it('is static text when there are no details', () => {
    renderWithProviders(<AiMarker label="AI generated" />);
    expect(screen.getByText('AI generated')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens its provenance from the keyboard', async () => {
    renderWithProviders(
      <AiMarker
        label="AI generated"
        details="Claude Sonnet 5.5 via eu-central route · 12:07:04 UTC · 6 evidence links"
      />,
    );

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(await screen.findByRole('dialog')).toHaveTextContent(
      'Claude Sonnet 5.5 via eu-central route',
    );
  });
});

import type { Meta, StoryObj } from '@storybook/react-vite';

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

const meta = {
  title: 'Relyxus/Operational badges',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Severity: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <SeverityBadge severity="SEV1" />
      <SeverityBadge severity="SEV2" />
      <SeverityBadge severity="SEV3" />
      <SeverityBadge severity="SEV4" />
    </div>
  ),
};

export const IncidentContext: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StateBadge label="Investigating" />
      <EnvironmentBadge environment="production" label="PROD" />
      <EnvironmentBadge environment="staging" label="STAGING" />
      <EnvironmentBadge environment="development" label="DEV" />
      <VisibilityBadge visibility="restricted-group" label="Restricted" />
      <VisibilityBadge visibility="invite-only" label="Invite only" />
    </div>
  ),
};

export const ConnectorHealth: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <ConnectorHealthBadge health="connected" label="Connected" />
      <ConnectorHealthBadge health="degraded" label="Degraded" />
      <ConnectorHealthBadge health="disabled" label="Disabled" />
      <ConnectorHealthBadge health="unavailable" label="Unavailable" />
    </div>
  ),
};

export const ConfidenceAndAiAuthorship: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <ConfidenceIndicator confidencePercent={82} bandLabels={bandLabels} />
      <ConfidenceIndicator confidencePercent={55} bandLabels={bandLabels} />
      <ConfidenceIndicator confidencePercent={31} bandLabels={bandLabels} />
      <AiMarker label="AI generated" />
      <AiMarker
        label="AI generated"
        details="Claude Sonnet 5.5 via eu-central route · generated 12:07:04 UTC · 6 evidence links"
      />
    </div>
  ),
};

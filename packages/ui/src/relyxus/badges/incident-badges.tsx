import { CircleCheck, CircleOff, CirclePause, Lock, TriangleAlert, Users } from 'lucide-react';
import type { ReactNode } from 'react';

import type { ConnectorHealth, Environment, IncidentVisibility } from '../vocabulary';
import { StatusPill, type StatusPillProps } from './status-pill';

/*
 * Each badge receives its localised word from the app; the component decides only how the
 * value looks. Production, restricted and degraded states are always written in words.
 */

type BadgeLabelProps = {
  /** Localised word shown in the badge, for example "Investigating" or "PROD". */
  label: string;
  className?: string;
};

/** Lifecycle state (Product s. 8A) written as a neutral badge. */
export function StateBadge({ label, className }: BadgeLabelProps) {
  return (
    <StatusPill tone="neutral" className={className}>
      {label}
    </StatusPill>
  );
}

const environmentTones = {
  production: 'critical',
  staging: 'warning',
  development: 'neutral',
} satisfies Record<Environment, StatusPillProps['tone']>;

/** PROD uses the critical colour plus the word; staging uses warning; development stays neutral. */
export function EnvironmentBadge({
  environment,
  label,
  className,
}: BadgeLabelProps & { environment: Environment }) {
  return (
    <StatusPill tone={environmentTones[environment]} className={className}>
      {label}
    </StatusPill>
  );
}

const visibilityIcons = {
  workspace: null,
  'restricted-group': <Users aria-hidden />,
  'invite-only': <Lock aria-hidden />,
  confidential: <Lock aria-hidden />,
} satisfies Record<IncidentVisibility, ReactNode>;

export function VisibilityBadge({
  visibility,
  label,
  className,
}: BadgeLabelProps & { visibility: IncidentVisibility }) {
  return (
    <StatusPill tone="neutral" icon={visibilityIcons[visibility]} className={className}>
      {label}
    </StatusPill>
  );
}

const connectorPresentation = {
  connected: { tone: 'healthy', icon: <CircleCheck aria-hidden /> },
  degraded: { tone: 'warning', icon: <TriangleAlert aria-hidden /> },
  disabled: { tone: 'neutral', icon: <CirclePause aria-hidden /> },
  unavailable: { tone: 'critical', icon: <CircleOff aria-hidden /> },
} satisfies Record<ConnectorHealth, { tone: StatusPillProps['tone']; icon: ReactNode }>;

/** Shown wherever a connector's evidence appears, so degraded sources are never hidden. */
export function ConnectorHealthBadge({
  health,
  label,
  className,
}: BadgeLabelProps & { health: ConnectorHealth }) {
  const { tone, icon } = connectorPresentation[health];
  return (
    <StatusPill tone={tone} icon={icon} className={className}>
      {label}
    </StatusPill>
  );
}

import { Circle, Info, OctagonAlert, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import type { SeverityLevel } from '../vocabulary';
import { StatusPill, type StatusPillProps } from './status-pill';

/*
 * Severity differs by shape as well as colour (UI/UX s. 5): SEV1 octagon, SEV2 triangle,
 * SEV3 circle, SEV4 info. The level code itself is the visible word and never changes
 * between interface, notifications, reports and the API.
 */
const severityPresentation = {
  SEV1: { tone: 'critical', icon: <OctagonAlert aria-hidden /> },
  SEV2: { tone: 'major', icon: <TriangleAlert aria-hidden /> },
  SEV3: { tone: 'warning', icon: <Circle aria-hidden /> },
  SEV4: { tone: 'neutral', icon: <Info aria-hidden /> },
} satisfies Record<SeverityLevel, { tone: StatusPillProps['tone']; icon: ReactNode }>;

export type SeverityBadgeProps = {
  severity: SeverityLevel;
  className?: string;
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const { tone, icon } = severityPresentation[severity];
  return (
    <StatusPill tone={tone} appearance="filled" icon={icon} className={className}>
      {severity}
    </StatusPill>
  );
}

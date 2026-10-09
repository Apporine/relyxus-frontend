'use client';

import { cn, useCurrentTime } from '@relyxus/ui';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Panel } from '@/lib/ui/panel';

import { toleranceConsumedShare } from './business-service-tolerance';
import type { BusinessServiceDetail, ImpactSourceState, ToleranceState } from './model';
import { BusinessServiceHealthLabel } from './service-labels';

const CONSUMED_REFRESH_MS = 1_000;

const impactSourceClassNames = {
  fresh: 'text-healthy',
  stale: 'text-warning',
  missing: 'text-critical',
} satisfies Record<ImpactSourceState, string>;

const toleranceStateClassNames = {
  within: 'text-fg-primary',
  'near-breach': 'text-warning',
  breached: 'text-critical',
} satisfies Record<ToleranceState, string>;

function PostureFact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-meta font-semibold text-fg-tertiary uppercase">{label}</dt>
      <dd className="text-table font-semibold">{children}</dd>
    </div>
  );
}

/** Right column of Figma frame 20: the service's posture at a glance, always in words. */
export function BusinessServicePosturePanel({
  businessService,
}: {
  businessService: BusinessServiceDetail;
}) {
  const translatePosture = useTranslations('businessServices.posture');
  const currentTime = useCurrentTime(CONSUMED_REFRESH_MS);
  const { tolerance, impact } = businessService;
  const consumedShare =
    currentTime === null ? null : toleranceConsumedShare(tolerance, currentTime);

  return (
    <Panel title={translatePosture('title')}>
      <dl className="flex flex-col gap-5">
        <PostureFact label={translatePosture('health')}>
          <BusinessServiceHealthLabel health={businessService.health} className="text-table" />
        </PostureFact>
        <PostureFact label={translatePosture('impactSource')}>
          <span className={impactSourceClassNames[impact.sourceState]}>
            {translatePosture(`impactSourceStates.${impact.sourceState}`)}
          </span>
        </PostureFact>
        <PostureFact label={translatePosture('tolerance')}>
          <span className={cn('tabular-nums', toleranceStateClassNames[tolerance.state])}>
            {tolerance.disruptionStartedAt === null
              ? translatePosture('notDisrupted')
              : consumedShare === null
                ? translatePosture(`toleranceStates.${tolerance.state}`)
                : [
                    translatePosture('consumed', { consumed: consumedShare }),
                    tolerance.state === 'within'
                      ? null
                      : translatePosture(`toleranceStates.${tolerance.state}`),
                  ]
                    .filter((part) => part !== null)
                    .join(' · ')}
          </span>
        </PostureFact>
        <PostureFact label={translatePosture('override')}>
          {impact.override === null ? (
            <span className="text-healthy">{translatePosture('noOverride')}</span>
          ) : (
            <span className="text-warning">
              {translatePosture('overriddenBy', { name: impact.override.overriddenByName })}
            </span>
          )}
        </PostureFact>
      </dl>
    </Panel>
  );
}

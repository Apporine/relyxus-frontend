'use client';

import { ClockWidget, clockPhases, Skeleton, type ClockPhase } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import type { RegulatorClock } from '@/features/compliance/model';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { Panel } from '@/lib/ui/panel';
import { QuerySection } from '@/lib/ui/query-section';

const MAX_VISIBLE_CLOCKS = 2;

/** The nearest regulator deadlines, always visible on the Command Centre (UI/UX s. 10.1). */
export function RegulatorClocksPanel({ query }: { query: UseQueryResult<RegulatorClock[]> }) {
  const translateClocks = useTranslations('commandCentre.clocks');
  const translatePhases = useTranslations('domain.clockPhases');
  const format = useRelyxusFormat();
  const phaseLabels = Object.fromEntries(
    clockPhases.map((phase) => [phase, translatePhases(phase)]),
  ) as Record<ClockPhase, string>;

  return (
    <Panel title={translateClocks('heading')}>
      <QuerySection
        query={query}
        sectionName={translateClocks('heading')}
        loadingPlaceholder={<Skeleton className="h-28 w-full" />}
      >
        {(clocks) =>
          clocks.length === 0 ? (
            <p className="text-body text-fg-secondary">{translateClocks('noneRunning')}</p>
          ) : (
            <div className="flex flex-col divide-y divide-divider">
              {clocks.slice(0, MAX_VISIBLE_CLOCKS).map((clock) => {
                const deadlineAt = new Date(clock.deadlineAt);
                return (
                  <ClockWidget
                    key={clock.id}
                    className="py-3 first:pt-0 last:pb-0"
                    title={`${clock.obligationName} · ${clock.incidentReference}`}
                    startedAt={new Date(clock.startedAt)}
                    deadlineAt={deadlineAt}
                    isSubmitted={clock.isSubmitted}
                    phaseLabels={phaseLabels}
                    deadlineText={translateClocks('deadline', {
                      time: format.timeOfDay(deadlineAt),
                    })}
                    details={translateClocks('ownerAndPackage', {
                      owner: clock.ownerName,
                      rulePackage: clock.rulePackage,
                    })}
                  />
                );
              })}
            </div>
          )
        }
      </QuerySection>
    </Panel>
  );
}

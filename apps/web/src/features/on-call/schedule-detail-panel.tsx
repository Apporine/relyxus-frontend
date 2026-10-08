'use client';

import { Skeleton } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { Panel } from '@/lib/ui/panel';
import { QuerySection } from '@/lib/ui/query-section';

import type { OnCallScheduleDetail } from './model';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-meta font-semibold text-fg-tertiary uppercase">{label}</h3>
      <p className="rounded-panel border border-control bg-surface-2 px-4 py-3 text-body text-fg-primary">
        {value}
      </p>
    </div>
  );
}

/** Centre column (UI/UX s. 13.4): current shift, gaps, overrides and swap requests. */
export function ScheduleDetailPanel({ query }: { query: UseQueryResult<OnCallScheduleDetail> }) {
  const translateOnCall = useTranslations('onCall');

  return (
    <QuerySection
      query={query}
      sectionName={translateOnCall('scheduleDetail')}
      loadingPlaceholder={<Skeleton className="h-[32rem] w-full" />}
    >
      {(schedule) => (
        <Panel title={schedule.name}>
          <div className="flex flex-col gap-5">
            {schedule.current === null ? null : (
              <DetailRow
                label={translateOnCall('sections.current')}
                value={schedule.current.label}
              />
            )}
            {schedule.next === null ? null : (
              <DetailRow label={translateOnCall('sections.next')} value={schedule.next.label} />
            )}
            {schedule.coverageGaps.length === 0 ? null : (
              <DetailRow
                label={translateOnCall('sections.coverageGap')}
                value={schedule.coverageGaps.map((gap) => gap.label).join(' · ')}
              />
            )}
            <DetailRow
              label={translateOnCall('sections.override')}
              value={schedule.override?.label ?? translateOnCall('none')}
            />
            <DetailRow
              label={translateOnCall('sections.swapRequests')}
              value={translateOnCall('swapRequestsPending', {
                count: schedule.swapRequestsPending,
              })}
            />
            {schedule.dstChecks.length === 0 ? null : (
              <DetailRow
                label={translateOnCall('sections.dstCheck')}
                value={schedule.dstChecks.map((check) => check.label).join(' · ')}
              />
            )}
          </div>
        </Panel>
      )}
    </QuerySection>
  );
}

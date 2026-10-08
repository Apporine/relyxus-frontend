'use client';

import { cn, Skeleton } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Panel } from '@/lib/ui/panel';
import { QuerySection } from '@/lib/ui/query-section';

import type { OnCallScheduleSummary } from './model';
import { onCallHref } from './on-call-params';

/** Left column (UI/UX s. 13.4): schedules with who is on call now. */
export function ScheduleListPanel({
  workspaceSlug,
  query,
  selectedScheduleId,
}: {
  workspaceSlug: string;
  query: UseQueryResult<OnCallScheduleSummary[]>;
  selectedScheduleId: string | null;
}) {
  const translateOnCall = useTranslations('onCall');

  return (
    <Panel title={translateOnCall('schedules')}>
      <QuerySection
        query={query}
        sectionName={translateOnCall('schedules')}
        loadingPlaceholder={<Skeleton className="h-64 w-full" />}
      >
        {(schedules) =>
          schedules.length === 0 ? (
            <p className="text-body text-fg-secondary">{translateOnCall('emptySchedules')}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {schedules.map((schedule) => (
                <li key={schedule.id}>
                  <Link
                    href={onCallHref(workspaceSlug, schedule.id)}
                    replace
                    scroll={false}
                    aria-current={schedule.id === selectedScheduleId ? 'true' : undefined}
                    className={cn(
                      'flex flex-col gap-1 rounded-panel border p-3 transition-colors hover:bg-surface-2',
                      schedule.id === selectedScheduleId
                        ? 'border-action bg-selected'
                        : 'border-divider',
                    )}
                  >
                    <span className="text-body font-semibold text-fg-primary">{schedule.name}</span>
                    <span className="text-meta text-fg-secondary">
                      {schedule.currentOnCallLabel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )
        }
      </QuerySection>
    </Panel>
  );
}

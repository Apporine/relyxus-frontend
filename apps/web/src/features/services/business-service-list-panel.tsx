'use client';

import { cn, EmptyState, Skeleton } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Panel } from '@/lib/ui/panel';
import { QuerySection } from '@/lib/ui/query-section';

import { businessServicesHref } from './business-service-params';
import type { BusinessServiceSummary } from './model';
import { BusinessServiceHealthLabel } from './service-labels';
import { TimeToBreach } from './time-to-breach';

/** Left column of Figma frame 20: every important business service and how close it is. */
export function BusinessServiceListPanel({
  workspaceSlug,
  query,
  selectedBusinessServiceId,
}: {
  workspaceSlug: string;
  query: UseQueryResult<BusinessServiceSummary[]>;
  selectedBusinessServiceId: string | null;
}) {
  const translateList = useTranslations('businessServices.list');

  return (
    <Panel title={translateList('title')}>
      <QuerySection
        query={query}
        sectionName={translateList('title')}
        loadingPlaceholder={<Skeleton className="h-80 w-full" />}
      >
        {(businessServices) =>
          businessServices.length === 0 ? (
            <EmptyState
              kind="first-use"
              headingLevel={3}
              title={translateList('emptyTitle')}
              description={translateList('emptyDescription')}
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {businessServices.map((businessService) => {
                const isSelected = businessService.id === selectedBusinessServiceId;
                return (
                  <li key={businessService.id}>
                    <Link
                      href={businessServicesHref(workspaceSlug, businessService.id)}
                      replace
                      scroll={false}
                      aria-current={isSelected ? 'true' : undefined}
                      className={cn(
                        'flex flex-col gap-1.5 rounded-panel border p-3 transition-colors hover:bg-surface-2',
                        isSelected ? 'border-strong bg-selected' : 'border-divider',
                      )}
                    >
                      <span className="text-body font-semibold text-fg-primary">
                        {businessService.name}
                      </span>
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <BusinessServiceHealthLabel health={businessService.health} />
                        <TimeToBreach tolerance={businessService.tolerance} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )
        }
      </QuerySection>
    </Panel>
  );
}

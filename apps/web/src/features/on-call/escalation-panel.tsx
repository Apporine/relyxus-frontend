'use client';

import { cn, Skeleton } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { Panel } from '@/lib/ui/panel';
import { QuerySection } from '@/lib/ui/query-section';

import type { EscalationChain } from './model';

/** Right column (UI/UX s. 13.4): numbered escalation chain for the selected schedule. */
export function EscalationPanel({ query }: { query: UseQueryResult<EscalationChain> }) {
  const translateOnCall = useTranslations('onCall');

  return (
    <Panel title={translateOnCall('escalationChain')}>
      <QuerySection
        query={query}
        sectionName={translateOnCall('escalationChain')}
        loadingPlaceholder={<Skeleton className="h-64 w-full" />}
      >
        {(chain) =>
          chain.steps.length === 0 ? (
            <p className="text-body text-fg-secondary">{translateOnCall('emptyEscalation')}</p>
          ) : (
            <ol className="flex flex-col gap-4">
              {chain.steps.map((step) => (
                <li key={step.stepNumber} className="flex gap-3">
                  <span
                    aria-hidden
                    className="flex size-7 shrink-0 items-center justify-center rounded-full border border-control bg-surface-2 text-meta font-semibold text-fg-secondary tabular-nums"
                  >
                    {step.stepNumber}
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    {step.delayLabel === null ? null : (
                      <span className="text-meta font-semibold text-fg-tertiary uppercase">
                        {step.delayLabel}
                      </span>
                    )}
                    <span
                      className={cn(
                        'text-body font-medium',
                        step.isLeadership ? 'text-warning' : 'text-fg-primary',
                      )}
                    >
                      {step.targetLabel}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )
        }
      </QuerySection>
    </Panel>
  );
}

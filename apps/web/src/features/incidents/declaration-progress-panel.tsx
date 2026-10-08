'use client';

import { cn } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import {
  declarationStepIds,
  type DeclarationStepId,
  type DeclarationStepStatus,
} from './declare-incident-form-state';

const statusClassNames: Record<DeclarationStepStatus, string> = {
  complete: 'border-fg-secondary bg-selected',
  current: 'border-fg-secondary bg-selected',
  next: 'border-control bg-surface-2',
  optional: 'border-control bg-surface-2',
};

export function DeclarationProgressPanel({
  stepStatuses,
}: {
  stepStatuses: Record<DeclarationStepId, DeclarationStepStatus>;
}) {
  const translateProgress = useTranslations('incidents.declare.progress');
  const translateSteps = useTranslations('incidents.declare.steps');

  return (
    <section
      aria-labelledby="declaration-progress-heading"
      className="flex flex-col gap-4 rounded-panel border border-control bg-surface-1 p-5"
    >
      <h2 id="declaration-progress-heading" className="text-panel-title font-semibold">
        {translateProgress('heading')}
      </h2>
      <ol className="flex flex-col gap-3">
        {declarationStepIds.map((stepId, stepIndex) => {
          const status = stepStatuses[stepId];
          return (
            <li
              key={stepId}
              className={cn(
                'flex flex-col gap-1 rounded-panel border px-4 py-3',
                statusClassNames[status],
              )}
              aria-current={status === 'current' ? 'step' : undefined}
            >
              <span className="text-table font-semibold text-fg-primary">
                {stepIndex + 1} {translateSteps(stepId)}
              </span>
              <span className="text-meta text-fg-secondary">
                {translateProgress(`status.${status}`)}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

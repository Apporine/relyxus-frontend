import { cn } from '@relyxus/ui';
import type { ReactNode } from 'react';

export type Fact = { label: string; value: ReactNode; className?: string };

/** Labelled figures in boxes, as in the detail columns of the Obsidian frames. */
export function BoxedFacts({ facts }: { facts: readonly Fact[] }) {
  return (
    <dl className="flex flex-col gap-4">
      {facts.map((fact) => (
        <div key={fact.label} className="flex flex-col gap-2">
          <dt className="text-meta font-semibold text-fg-tertiary uppercase">{fact.label}</dt>
          <dd
            className={cn(
              'rounded-panel border border-control bg-raised px-4 py-3 text-table text-fg-primary',
              fact.className,
            )}
          >
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Compact labelled values for side columns such as "Effective policy" or "Current posture". */
export function StackedFacts({ facts }: { facts: readonly Fact[] }) {
  return (
    <dl className="flex flex-col gap-5">
      {facts.map((fact) => (
        <div key={fact.label} className="flex flex-col gap-1">
          <dt className="text-meta font-semibold text-fg-tertiary uppercase">{fact.label}</dt>
          <dd className={cn('text-table font-semibold text-fg-primary', fact.className)}>
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

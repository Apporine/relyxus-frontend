import { CircleCheck, CirclePlus, Lock, SearchX, Unplug } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

/*
 * An empty state always says why it is empty and offers the next valid action (UI/UX s. 9).
 * Each kind looks different so "nothing is wrong" is never confused with "you cannot see
 * this" or "the source is disconnected".
 */

export type EmptyStateKind =
  'all-clear' | 'first-use' | 'filtered' | 'no-permission' | 'disconnected';

const kindIcons = {
  'all-clear': <CircleCheck aria-hidden className="size-6 text-healthy" />,
  'first-use': <CirclePlus aria-hidden className="size-6 text-fg-secondary" />,
  filtered: <SearchX aria-hidden className="size-6 text-fg-secondary" />,
  'no-permission': <Lock aria-hidden className="size-6 text-fg-secondary" />,
  disconnected: <Unplug aria-hidden className="size-6 text-warning" />,
} satisfies Record<EmptyStateKind, ReactNode>;

export type EmptyStateProps = {
  kind: EmptyStateKind;
  title: string;
  description?: string;
  /** The single next valid action, for example "Clear filters" or "Request access". */
  action?: ReactNode;
  headingLevel?: 2 | 3;
  className?: string;
};

export function EmptyState({
  kind,
  title,
  description,
  action,
  headingLevel = 2,
  className,
}: EmptyStateProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <div
      data-kind={kind}
      className={cn(
        'flex flex-col items-center gap-3 rounded-panel px-6 py-10 text-center',
        kind === 'filtered' ? 'border border-dashed border-control' : 'bg-surface-1',
        className,
      )}
    >
      {kindIcons[kind]}
      <Heading className="text-panel-title font-semibold text-fg-primary">{title}</Heading>
      {description === undefined ? null : (
        <p className="max-w-prose text-body text-fg-secondary">{description}</p>
      )}
      {action === undefined ? null : <div className="pt-1">{action}</div>}
    </div>
  );
}

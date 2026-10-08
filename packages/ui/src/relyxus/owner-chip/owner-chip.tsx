import { ShieldCheck, Users } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export type OwnerKind = 'person' | 'team' | 'role';

export type OwnerChipProps = {
  name: string;
  kind: OwnerKind;
  /** Localised "On call" word, shown when the person is currently on call. */
  onCallLabel?: string;
  className?: string;
};

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((namePart) => namePart.length > 0)
    .slice(0, 2)
    .map((namePart) => namePart.charAt(0).toUpperCase())
    .join('');
}

const kindIcons = {
  team: <Users aria-hidden className="size-3.5" />,
  role: <ShieldCheck aria-hidden className="size-3.5" />,
} satisfies Record<Exclude<OwnerKind, 'person'>, ReactNode>;

/**
 * Person, team or role, rendered the same way everywhere. Wrap it in a link to open the
 * profile or on-call schedule.
 */
export function OwnerChip({ name, kind, onCallLabel, className }: OwnerChipProps) {
  return (
    <span
      className={cn('inline-flex min-w-0 items-center gap-2 text-table text-fg-primary', className)}
    >
      <span
        aria-hidden
        className="flex size-6 shrink-0 items-center justify-center rounded-full border border-control bg-surface-2 text-meta font-semibold text-fg-secondary"
      >
        {kind === 'person' ? initialsOf(name) : kindIcons[kind]}
      </span>
      <span className="truncate">{name}</span>
      {onCallLabel === undefined ? null : (
        <span className="shrink-0 text-meta text-healthy">{onCallLabel}</span>
      )}
    </span>
  );
}

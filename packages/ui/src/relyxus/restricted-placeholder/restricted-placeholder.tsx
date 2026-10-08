import { Lock } from 'lucide-react';

import { cn } from '../../lib/cn';

export type RestrictedPlaceholderProps = {
  /** Generic localised text such as "You don't have access to this item". */
  message: string;
  className?: string;
};

/**
 * Stands in for an item the viewer may not see, only where the layout would otherwise look
 * broken. It deliberately accepts no title, count, ID or other detail of the hidden item, so
 * nothing about a restricted incident can leak through it (Product s. 8A).
 */
export function RestrictedPlaceholder({ message, className }: RestrictedPlaceholderProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-panel border border-dashed border-control px-4 py-3 text-body text-fg-secondary',
        className,
      )}
    >
      <Lock aria-hidden className="size-4 shrink-0" />
      {message}
    </div>
  );
}

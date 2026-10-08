import { cn } from '../../lib/cn';

/**
 * Static placeholder in the shape of the content that is loading. It does not pulse:
 * Relyxus avoids decorative motion. The loading region itself sets `aria-busy`.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('rounded-control bg-surface-2', className)} />;
}

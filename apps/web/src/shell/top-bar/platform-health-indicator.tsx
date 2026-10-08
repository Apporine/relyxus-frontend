'use client';

import { cn } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import type { PlatformHealth } from '../platform/platform-status';

const healthDotClassNames = {
  healthy: 'bg-healthy',
  degraded: 'bg-warning',
  down: 'bg-critical',
} satisfies Record<PlatformHealth, string>;

/**
 * Relyxus' own health, written as a word beside the dot so it never relies on colour alone.
 * When degraded, the banner slot carries the detail.
 */
export function PlatformHealthIndicator({ health }: { health: PlatformHealth | undefined }) {
  const translateTopBar = useTranslations('shell.topBar');
  if (health === undefined) {
    return null;
  }
  const healthWord = translateTopBar(`platformHealth.${health}`);

  return (
    <p className="flex items-center gap-2 text-table font-semibold text-fg-primary">
      <span aria-hidden className={cn('size-2 rounded-full', healthDotClassNames[health])} />
      <span aria-hidden>{healthWord}</span>
      <span className="sr-only">
        {translateTopBar('platformHealthLabel', { health: healthWord })}
      </span>
    </p>
  );
}

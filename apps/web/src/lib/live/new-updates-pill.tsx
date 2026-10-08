'use client';

import { Button } from '@relyxus/ui';
import { ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useThrottledValue } from './use-throttled-value';

/** At most one announcement per region every five seconds, so alert storms do not flood readers. */
const ANNOUNCEMENT_INTERVAL_MS = 5_000;

export type NewUpdatesPillProps = {
  pendingCount: number;
  onReveal: () => void;
};

/** "3 new updates": inserts held items only when the person asks (UI/UX s. 8). */
export function NewUpdatesPill({ pendingCount, onReveal }: NewUpdatesPillProps) {
  const translateLive = useTranslations('live');
  const announcedCount = useThrottledValue(pendingCount, ANNOUNCEMENT_INTERVAL_MS);

  return (
    <>
      {pendingCount > 0 ? (
        <Button size="small" variant="secondary" onClick={onReveal} className="rounded-full">
          <ArrowUp aria-hidden />
          {translateLive('newUpdates', { count: pendingCount })}
        </Button>
      ) : null}
      <span role="status" className="sr-only">
        {announcedCount > 0 ? translateLive('newUpdates', { count: announcedCount }) : ''}
      </span>
    </>
  );
}

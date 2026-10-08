'use client';

import { IconButton } from '@relyxus/ui';
import { CircleHelp, Clock } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { useTimeDisplay } from '@/lib/format/time-display';

import { areaHref } from '../navigation/navigation-model';
import type { PlatformHealth } from '../platform/platform-status';
import { useCurrentWorkspace } from '../workspace/current-workspace';
import { AccountMenu } from './account-menu';
import { DataLocationBadge } from './data-location-badge';
import { PlatformHealthIndicator } from './platform-health-indicator';
import { SearchTrigger } from './search-trigger';

type TopBarProps = {
  platformHealth: PlatformHealth | undefined;
  onOpenCommandPalette: () => void;
  onOpenShortcuts: () => void;
};

/** Global search and status across the top (UI/UX s. 4). Help always sits in the same place. */
export function TopBar({ platformHealth, onOpenCommandPalette, onOpenShortcuts }: TopBarProps) {
  const translateShell = useTranslations('shell');
  const translateTime = useTranslations('time');
  const { workspace } = useCurrentWorkspace();
  const { canToggleUtc, isShowingUtc, preferredTimeZone, toggleUtc } = useTimeDisplay();

  return (
    <header className="sticky top-0 z-(--rx-layer-sticky) flex h-14 shrink-0 items-center gap-4 border-b border-divider bg-nav px-4">
      <Link
        href={areaHref(workspace.slug, 'command-centre')}
        className="shrink-0 text-section-title font-semibold text-fg-primary"
      >
        {translateShell('productName')}
      </Link>

      <div className="flex min-w-0 flex-1 justify-center">
        <SearchTrigger onOpen={onOpenCommandPalette} />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden laptop:block">
          <DataLocationBadge />
        </div>
        <PlatformHealthIndicator health={platformHealth} />
        {canToggleUtc ? (
          <IconButton
            label={
              isShowingUtc
                ? translateTime('showInLocalZone', { timeZone: preferredTimeZone })
                : translateTime('showInUtc')
            }
            icon={<Clock />}
            aria-pressed={isShowingUtc}
            onClick={toggleUtc}
          />
        ) : null}
        <IconButton
          label={translateShell('topBar.help')}
          icon={<CircleHelp />}
          onClick={onOpenShortcuts}
        />
        <AccountMenu onOpenShortcuts={onOpenShortcuts} />
      </div>
    </header>
  );
}

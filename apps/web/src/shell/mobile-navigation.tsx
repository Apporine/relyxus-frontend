'use client';

import { cn } from '@relyxus/ui';
import { UserRound } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { navigationIcons } from './navigation/navigation-icons';
import { areaForPathname, areaHref, type NavigationAreaId } from './navigation/navigation-model';
import { useCurrentWorkspace } from './workspace/current-workspace';

/**
 * Below 768 px the sidebar gives way to a bottom bar for the jobs people do on a phone:
 * home, incidents, approvals and their own settings (UI/UX s. 15).
 */
const mobileAreaIds: readonly NavigationAreaId[] = ['command-centre', 'incidents', 'approvals'];

export function MobileNavigation() {
  const translateNavigation = useTranslations('shell.navigation');
  const pathname = usePathname();
  const { workspace, accessibleAreaIds } = useCurrentWorkspace();
  const activeArea = areaForPathname(pathname);
  const visibleAreaIds = mobileAreaIds.filter((areaId) => accessibleAreaIds.has(areaId));
  const personalSettingsHref = `/w/${encodeURIComponent(workspace.slug)}/me` as Route;

  return (
    <nav
      aria-label={translateNavigation('mobileLabel')}
      className="fixed inset-x-0 bottom-0 z-(--rx-layer-sticky) border-t border-divider bg-nav tablet:hidden"
    >
      <ul className="flex">
        {visibleAreaIds.map((areaId) => {
          const AreaIcon = navigationIcons[areaId];
          const isActive = areaId === activeArea;
          return (
            <li key={areaId} className="flex-1">
              <Link
                href={areaHref(workspace.slug, areaId)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex min-h-(--rx-touch-target) flex-col items-center justify-center gap-0.5 py-2 text-meta',
                  isActive ? 'font-semibold text-fg-primary' : 'text-fg-secondary',
                )}
              >
                <AreaIcon aria-hidden className="size-5" />
                {translateNavigation(`areas.${areaId}`)}
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <Link
            href={personalSettingsHref}
            aria-current={pathname === personalSettingsHref ? 'page' : undefined}
            className={cn(
              'flex min-h-(--rx-touch-target) flex-col items-center justify-center gap-0.5 py-2 text-meta',
              pathname === personalSettingsHref
                ? 'font-semibold text-fg-primary'
                : 'text-fg-secondary',
            )}
          >
            <UserRound aria-hidden className="size-5" />
            {translateNavigation('me')}
          </Link>
        </li>
      </ul>
    </nav>
  );
}

'use client';

import { cn, Tooltip } from '@relyxus/ui';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { textDirectionFor } from '@/lib/i18n/locales';

import { navigationIcons } from '../navigation/navigation-icons';
import { areaForPathname, areaHref, navigationGroupsFor } from '../navigation/navigation-model';
import { useCurrentWorkspace } from '../workspace/current-workspace';
import { WorkspaceSwitcher } from '../workspace/workspace-switcher';

type SidebarProps = {
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
};

/** 240 px expanded, 64 px collapsed with tooltips; on the inline-start side in both languages. */
export function Sidebar({ isCollapsed, onToggleCollapsed }: SidebarProps) {
  const translateNavigation = useTranslations('shell.navigation');
  const pathname = usePathname();
  const direction = textDirectionFor(useLocale());
  const { workspace, accessibleAreaIds } = useCurrentWorkspace();
  const activeArea = areaForPathname(pathname);
  const tooltipSide = direction === 'rtl' ? 'left' : 'right';
  const CollapseIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col border-e border-divider bg-nav tablet:flex',
        isCollapsed ? 'w-(--rx-sidebar-collapsed-width)' : 'w-(--rx-sidebar-expanded-width)',
      )}
    >
      <div className={cn('pt-4 pb-2', isCollapsed ? 'px-2' : 'px-4')}>
        <WorkspaceSwitcher isCollapsed={isCollapsed} />
      </div>

      <nav
        aria-label={translateNavigation('label')}
        className="min-h-0 flex-1 overflow-y-auto pb-4"
      >
        {navigationGroupsFor(accessibleAreaIds).map(({ groupId, areaIds }) => (
          <section key={groupId} aria-labelledby={`navigation-group-${groupId}`} className="pt-4">
            <h2
              id={`navigation-group-${groupId}`}
              className={cn(
                'px-5 pb-1 text-meta font-semibold text-fg-tertiary uppercase',
                isCollapsed && 'sr-only',
              )}
            >
              {translateNavigation(`groups.${groupId}`)}
            </h2>
            <ul className={cn('flex flex-col gap-0.5', isCollapsed ? 'px-2' : 'px-3')}>
              {areaIds.map((areaId) => {
                const AreaIcon = navigationIcons[areaId];
                const areaLabel = translateNavigation(`areas.${areaId}`);
                const isActive = areaId === activeArea;
                const link = (
                  <Link
                    href={areaHref(workspace.slug, areaId)}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={isCollapsed ? areaLabel : undefined}
                    className={cn(
                      'flex h-9 items-center gap-3 rounded-button border-s-2 text-body',
                      'transition-colors duration-(--rx-duration-hover) ease-standard',
                      isCollapsed ? 'justify-center' : 'px-3',
                      isActive
                        ? 'border-fg-primary bg-selected font-semibold text-fg-primary'
                        : 'border-transparent text-fg-secondary hover:bg-surface-2 hover:text-fg-primary',
                    )}
                  >
                    <AreaIcon aria-hidden className="size-5 shrink-0" />
                    {isCollapsed ? null : <span className="truncate">{areaLabel}</span>}
                  </Link>
                );
                return (
                  <li key={areaId}>
                    {isCollapsed ? (
                      <Tooltip content={areaLabel} side={tooltipSide}>
                        {link}
                      </Tooltip>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>

      <div className={cn('border-t border-divider py-2', isCollapsed ? 'px-2' : 'px-3')}>
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? translateNavigation('expand') : undefined}
          className={cn(
            'flex h-9 w-full items-center gap-3 rounded-button text-table text-fg-secondary hover:bg-surface-2 hover:text-fg-primary',
            isCollapsed ? 'justify-center' : 'px-3',
          )}
        >
          <CollapseIcon aria-hidden className="size-5 shrink-0 rtl:-scale-x-100" />
          {isCollapsed ? null : translateNavigation('collapse')}
        </button>
      </div>
    </aside>
  );
}

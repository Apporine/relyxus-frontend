'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';

import { useLiveConnectionStatus, useLiveEvent } from '@/lib/live/live-updates-provider';

import { BannerSlot } from './banners/banner-slot';
import { CommandPalette } from './command-palette/command-palette';
import { MobileNavigation } from './mobile-navigation';
import { areaHref } from './navigation/navigation-model';
import {
  PLATFORM_STATUS_CHANGED_EVENT,
  platformStatusQueryKey,
  usePlatformStatus,
} from './platform/platform-status';
import { ShortcutsDialog } from './shortcuts/shortcuts-dialog';
import { useGlobalShortcuts } from './shortcuts/use-global-shortcuts';
import { rememberSidebarCollapsed } from './sidebar/sidebar-preference';
import { Sidebar } from './sidebar/sidebar';
import { TopBar } from './top-bar/top-bar';
import { useCurrentWorkspace } from './workspace/current-workspace';

type AppShellProps = {
  initialSidebarCollapsed: boolean;
  children: ReactNode;
};

/**
 * One shell for every page (UI/UX s. 4): global search and status across the top, banners
 * beneath, navigation on the inline-start side and the page in the middle.
 */
export function AppShell({ initialSidebarCollapsed, children }: AppShellProps) {
  const translateShell = useTranslations('shell');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { workspace, accessibleAreaIds } = useCurrentWorkspace();
  const platformStatusQuery = usePlatformStatus();
  const liveStatus = useLiveConnectionStatus();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(initialSidebarCollapsed);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsDialogOpen, setIsShortcutsDialogOpen] = useState(false);

  useLiveEvent(PLATFORM_STATUS_CHANGED_EVENT, () => {
    void queryClient.invalidateQueries({ queryKey: platformStatusQueryKey });
  });

  useGlobalShortcuts({
    onOpenCommandPalette: () => setIsCommandPaletteOpen(true),
    onShowShortcuts: () => setIsShortcutsDialogOpen(true),
    onGoToArea: (areaId) => {
      if (accessibleAreaIds.has(areaId)) {
        router.push(areaHref(workspace.slug, areaId));
      }
    },
  });

  function toggleSidebar() {
    const willBeCollapsed = !isSidebarCollapsed;
    setIsSidebarCollapsed(willBeCollapsed);
    rememberSidebarCollapsed(willBeCollapsed);
  }

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <a
        href="#main-content"
        className="sr-only z-(--rx-layer-command-palette) rounded-button bg-action px-4 py-2 font-semibold text-action-fg focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        {translateShell('skipToContent')}
      </a>
      <TopBar
        platformHealth={platformStatusQuery.data?.health}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenShortcuts={() => setIsShortcutsDialogOpen(true)}
      />
      <BannerSlot platformStatus={platformStatusQuery.data} liveStatus={liveStatus} />
      <div className="flex min-h-0 flex-1">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapsed={toggleSidebar} />
        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 flex-1 overflow-y-auto outline-none"
        >
          <div className="mx-auto max-w-(--rx-content-max-width) px-4 py-6 pb-24 tablet:px-6 tablet:pb-6">
            {children}
          </div>
        </main>
      </div>
      <MobileNavigation />
      <CommandPalette isOpen={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen} />
      <ShortcutsDialog isOpen={isShortcutsDialogOpen} onOpenChange={setIsShortcutsDialogOpen} />
    </div>
  );
}

'use client';

import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@relyxus/ui';
import { Check, ChevronsUpDown } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useRegionName } from '../region/use-region-name';
import { areaForPathname, areaHref } from '../navigation/navigation-model';
import { useCurrentWorkspace } from './current-workspace';

const DEFAULT_AREA = 'command-centre';

function initialsOf(workspaceName: string): string {
  return workspaceName
    .split(/[\s/]+/)
    .filter((namePart) => namePart.length > 0)
    .slice(0, 2)
    .map((namePart) => namePart.charAt(0).toUpperCase())
    .join('');
}

/**
 * Sits at the top of the sidebar. Switching keeps the person on the same kind of page where
 * the target workspace allows it (UI/UX s. 3), otherwise it opens the Command Centre.
 */
export function WorkspaceSwitcher({ isCollapsed }: { isCollapsed: boolean }) {
  const translateWorkspace = useTranslations('shell.workspace');
  const router = useRouter();
  const pathname = usePathname();
  const regionNameOf = useRegionName();
  const { workspace: currentWorkspace, workspaces } = useCurrentWorkspace();

  function switchTo(targetSlug: string) {
    const target = workspaces.find((candidate) => candidate.slug === targetSlug);
    if (target === undefined || target.slug === currentWorkspace.slug) {
      return;
    }
    const currentArea = areaForPathname(pathname);
    const targetArea =
      currentArea !== undefined && target.accessibleAreas.includes(currentArea)
        ? currentArea
        : DEFAULT_AREA;
    router.push(areaHref(target.slug, targetArea));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={translateWorkspace('switcherLabel', { workspace: currentWorkspace.name })}
        className={cn(
          'flex h-11 w-full items-center gap-2 rounded-button border border-control bg-surface-1 text-start',
          'hover:bg-surface-2',
          isCollapsed ? 'justify-center px-0' : 'px-3',
        )}
      >
        {isCollapsed ? (
          <span className="text-table font-semibold">{initialsOf(currentWorkspace.name)}</span>
        ) : (
          <>
            <span className="min-w-0 flex-1 truncate text-table font-semibold">
              {currentWorkspace.name}
            </span>
            <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-fg-secondary" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>{translateWorkspace('label')}</DropdownMenuLabel>
        {workspaces.map((workspace) => (
          <DropdownMenuItem key={workspace.slug} onSelect={() => switchTo(workspace.slug)}>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-semibold">{workspace.name}</span>
              <span className="text-meta text-fg-tertiary">
                {regionNameOf(workspace.dataRegionCode)}
              </span>
            </span>
            {workspace.slug === currentWorkspace.slug ? <Check aria-hidden /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

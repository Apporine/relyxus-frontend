'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@relyxus/ui';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useRegionName } from '../region/use-region-name';
import { useCurrentWorkspace } from '../workspace/current-workspace';

/**
 * Always visible: where this workspace's data lives and how Relyxus is deployed (UI/UX s. 4,
 * principle 10). Opens a one-page data-flow summary.
 */
export function DataLocationBadge() {
  const translateTopBar = useTranslations('shell.topBar');
  const regionNameOf = useRegionName();
  const { workspace } = useCurrentWorkspace();
  const regionName = regionNameOf(workspace.dataRegionCode);
  const deploymentMode = translateTopBar(`deploymentModes.${workspace.deploymentMode}`);

  return (
    <Popover>
      <PopoverTrigger className="flex h-8 items-center gap-1.5 rounded-full border border-control px-3 text-meta font-semibold text-fg-primary hover:bg-surface-2">
        <MapPin aria-hidden className="size-3.5 shrink-0" />
        <span className="truncate">
          {translateTopBar('dataLocation', { region: regionName, deploymentMode })}
        </span>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex flex-col gap-2">
        <p className="text-body font-semibold">{translateTopBar('dataLocationTitle')}</p>
        <p className="text-meta text-fg-secondary">
          {translateTopBar('dataLocationSummary', {
            workspace: workspace.name,
            region: regionName,
          })}
        </p>
        <p className="text-meta text-fg-secondary">
          {translateTopBar('deploymentModeSummary', { deploymentMode })}
        </p>
      </PopoverContent>
    </Popover>
  );
}

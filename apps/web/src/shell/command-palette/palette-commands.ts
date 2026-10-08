import type { Route } from 'next';

import { areaHref, navigationAreaIds, type NavigationAreaId } from '../navigation/navigation-model';

export type PaletteCommandGroup = 'actions' | 'navigate';

export type PaletteCommand = {
  id: string;
  group: PaletteCommandGroup;
  label: string;
  href: Route;
};

/**
 * Commands offered by the palette (UI/UX s. 4). Only areas the person can open are listed,
 * mirroring the sidebar. Search results across incidents, services and other records join
 * this list when permission-aware global search is available (Product s. 15).
 */
export function paletteCommandsFor({
  workspaceSlug,
  accessibleAreaIds,
  labelForArea,
  declareIncidentLabel,
}: {
  workspaceSlug: string;
  accessibleAreaIds: ReadonlySet<NavigationAreaId>;
  labelForArea: (areaId: NavigationAreaId) => string;
  declareIncidentLabel: string;
}): PaletteCommand[] {
  const actions: PaletteCommand[] = accessibleAreaIds.has('incidents')
    ? [
        {
          id: 'declare-incident',
          group: 'actions',
          label: declareIncidentLabel,
          href: `${areaHref(workspaceSlug, 'incidents')}/new` as Route,
        },
      ]
    : [];

  const destinations: PaletteCommand[] = navigationAreaIds
    .filter((areaId) => accessibleAreaIds.has(areaId))
    .map((areaId) => ({
      id: `navigate-${areaId}`,
      group: 'navigate',
      label: labelForArea(areaId),
      href: areaHref(workspaceSlug, areaId),
    }));

  return [...actions, ...destinations];
}

/** Case-insensitive match on any part of the label, using the interface language's rules. */
export function filterPaletteCommands(
  commands: readonly PaletteCommand[],
  query: string,
  locale: string,
): PaletteCommand[] {
  const normalisedQuery = query.trim().toLocaleLowerCase(locale);
  if (normalisedQuery === '') {
    return [...commands];
  }
  return commands.filter((command) =>
    command.label.toLocaleLowerCase(locale).includes(normalisedQuery),
  );
}

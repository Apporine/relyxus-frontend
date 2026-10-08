import type { Route } from 'next';

/*
 * Thirteen destinations in four groups (UI/UX s. 3). People only see the areas they can
 * access, but items never move position by role: filtering keeps the declared order.
 */

export const navigationAreaIds = [
  'command-centre',
  'incidents',
  'approvals',
  'on-call',
  'services',
  'ai-quality',
  'analytics',
  'policies',
  'runbooks',
  'compliance',
  'audit',
  'integrations',
  'admin',
] as const;
export type NavigationAreaId = (typeof navigationAreaIds)[number];

export const navigationGroupIds = ['operate', 'understand', 'govern', 'configure'] as const;
export type NavigationGroupId = (typeof navigationGroupIds)[number];

/** Path segment of each area below /w/{workspace} (UI/UX s. 3 route map). */
const areaPathSegments = {
  'command-centre': 'home',
  incidents: 'incidents',
  approvals: 'approvals',
  'on-call': 'on-call',
  services: 'services',
  'ai-quality': 'ai-quality',
  analytics: 'analytics',
  policies: 'policies',
  runbooks: 'runbooks',
  compliance: 'compliance',
  audit: 'audit',
  integrations: 'integrations',
  admin: 'settings',
} satisfies Record<NavigationAreaId, string>;

const areasByGroup = {
  operate: ['command-centre', 'incidents', 'approvals', 'on-call'],
  understand: ['services', 'ai-quality', 'analytics'],
  govern: ['policies', 'runbooks', 'compliance', 'audit'],
  configure: ['integrations', 'admin'],
} satisfies Record<NavigationGroupId, NavigationAreaId[]>;

export type NavigationGroup = {
  groupId: NavigationGroupId;
  areaIds: NavigationAreaId[];
};

/** Groups with only the areas the person may open, in their fixed order; empty groups are dropped. */
export function navigationGroupsFor(
  accessibleAreaIds: ReadonlySet<NavigationAreaId>,
): NavigationGroup[] {
  return navigationGroupIds
    .map((groupId) => ({
      groupId,
      areaIds: areasByGroup[groupId].filter((areaId) => accessibleAreaIds.has(areaId)),
    }))
    .filter((group) => group.areaIds.length > 0);
}

/*
 * Routes are typed by Next.js; areas whose screens are not built yet resolve to the
 * not-found page until their capability lands, so the cast is limited to this one place.
 */
export function areaHref(workspaceSlug: string, areaId: NavigationAreaId): Route {
  return `/w/${encodeURIComponent(workspaceSlug)}/${areaPathSegments[areaId]}` as Route;
}

/** Which area a console path belongs to, used to highlight navigation and switch workspaces. */
export function areaForPathname(pathname: string): NavigationAreaId | undefined {
  const [, workspaceSegment, , areaSegment] = pathname.split('/');
  if (workspaceSegment !== 'w' || areaSegment === undefined) {
    return undefined;
  }
  return navigationAreaIds.find((areaId) => areaPathSegments[areaId] === areaSegment);
}

import type { Route } from 'next';

import { areaHref } from '@/shell/navigation/navigation-model';

/*
 * Incident routes from the UI/UX s. 3 route map. Typed as routes centrally because the war
 * room and declaration screens arrive in later capabilities.
 */

export function incidentWarRoomHref(workspaceSlug: string, incidentReference: string): Route {
  return `${areaHref(workspaceSlug, 'incidents')}/${encodeURIComponent(incidentReference)}` as Route;
}

export function declareIncidentHref(workspaceSlug: string): Route {
  return `${areaHref(workspaceSlug, 'incidents')}/new` as Route;
}

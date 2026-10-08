import type { Route } from 'next';

import { areaHref } from '@/shell/navigation/navigation-model';

/*
 * Incident routes from the UI/UX s. 3 route map. Typed as routes centrally because the
 * evidence explorer arrives in a later capability.
 */

export function incidentWarRoomHref(workspaceSlug: string, incidentReference: string): Route {
  return `${areaHref(workspaceSlug, 'incidents')}/${encodeURIComponent(incidentReference)}` as Route;
}

/** Evidence explorer, optionally filtered to one hypothesis's supporting and refuting evidence. */
export function incidentEvidenceHref(
  workspaceSlug: string,
  incidentReference: string,
  { hypothesisId }: { hypothesisId?: string } = {},
): Route {
  const evidencePath = `${incidentWarRoomHref(workspaceSlug, incidentReference)}/evidence`;
  return (
    hypothesisId === undefined
      ? evidencePath
      : `${evidencePath}?hypothesis=${encodeURIComponent(hypothesisId)}`
  ) as Route;
}

export function declareIncidentHref(workspaceSlug: string): Route {
  return `${areaHref(workspaceSlug, 'incidents')}/new` as Route;
}

import type { Route } from 'next';

import { areaHref } from '@/shell/navigation/navigation-model';

export function selectedScheduleIdFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>,
): string | null {
  const schedule = searchParams.get('schedule');
  return schedule === null || schedule === '' ? null : schedule;
}

/** Opens On-call with an optional schedule selected in the URL. */
export function onCallHref(workspaceSlug: string, scheduleId: string | null = null): Route {
  const base = areaHref(workspaceSlug, 'on-call');
  if (scheduleId === null) {
    return base;
  }
  return `${base}?schedule=${encodeURIComponent(scheduleId)}` as Route;
}

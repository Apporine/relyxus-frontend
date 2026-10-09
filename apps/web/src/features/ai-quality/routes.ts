import type { Route } from 'next';

import { areaHref } from '@/shell/navigation/navigation-model';

export function aiQualityHref(workspaceSlug: string): Route {
  return areaHref(workspaceSlug, 'ai-quality');
}

/** One replay run, with everything needed to reproduce it. */
export function replayRunHref(workspaceSlug: string, runId: string): Route {
  return `${aiQualityHref(workspaceSlug)}/replays/${encodeURIComponent(runId)}` as Route;
}

import { RouteLoadingState } from '@/lib/ui/route-loading-state';

/** Next.js shows this instantly on navigation, inside the workspace shell, until the page is ready. */
export default function WorkspaceRouteLoading() {
  return <RouteLoadingState />;
}

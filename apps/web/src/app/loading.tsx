import { FullPageBusyState } from '@/shell/states/full-page-busy-state';

/** Pages outside the console (sign-in, Trust Centre, onboarding, wall mode) load full screen. */
export default function RootRouteLoading() {
  return <FullPageBusyState />;
}

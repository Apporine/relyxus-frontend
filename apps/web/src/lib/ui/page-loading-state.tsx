import { Skeleton } from '@relyxus/ui';

/** Skeleton layout shared by data-backed workspace pages while their primary queries load. */
export function PageLoadingState() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-[40rem] w-full" />
    </div>
  );
}

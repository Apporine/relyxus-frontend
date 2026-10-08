'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { areaHref } from './navigation/navigation-model';
import { useSession } from './session/session';
import {
  NoWorkspacesState,
  SessionErrorState,
  WorkspaceLoadingState,
} from './states/session-states';

/** The console root opens the Command Centre of the person's first workspace. */
export function WorkspaceLanding() {
  const router = useRouter();
  const sessionQuery = useSession();
  const firstWorkspace = sessionQuery.data?.workspaces[0];

  useEffect(() => {
    if (firstWorkspace !== undefined) {
      router.replace(areaHref(firstWorkspace.slug, 'command-centre'));
    }
  }, [firstWorkspace, router]);

  if (sessionQuery.isError) {
    return (
      <SessionErrorState error={sessionQuery.error} onRetry={() => void sessionQuery.refetch()} />
    );
  }
  if (sessionQuery.isSuccess && firstWorkspace === undefined) {
    return <NoWorkspacesState />;
  }
  return <WorkspaceLoadingState />;
}

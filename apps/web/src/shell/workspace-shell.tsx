'use client';

import { useMemo, type ReactNode } from 'react';

import { LiveUpdatesProvider } from '@/lib/live/live-updates-provider';

import { AppShell } from './app-shell';
import { useSession } from './session/session';
import {
  SessionErrorState,
  WorkspaceLoadingState,
  WorkspaceUnavailableState,
} from './states/session-states';
import { CurrentWorkspaceProvider, type CurrentWorkspace } from './workspace/current-workspace';

type WorkspaceShellProps = {
  workspaceSlug: string;
  initialSidebarCollapsed: boolean;
  children: ReactNode;
};

/**
 * Every workspace page re-checks access before showing anything (UI/UX s. 3). The session
 * comes from the server; this component never decides access itself, it only reflects it.
 */
export function WorkspaceShell({
  workspaceSlug,
  initialSidebarCollapsed,
  children,
}: WorkspaceShellProps) {
  const sessionQuery = useSession();

  const currentWorkspace = useMemo<CurrentWorkspace | undefined>(() => {
    const session = sessionQuery.data;
    const workspace = session?.workspaces.find((candidate) => candidate.slug === workspaceSlug);
    if (session === undefined || workspace === undefined) {
      return undefined;
    }
    return {
      user: session.user,
      workspace,
      workspaces: session.workspaces,
      accessibleAreaIds: new Set(workspace.accessibleAreas),
    };
  }, [sessionQuery.data, workspaceSlug]);

  if (sessionQuery.isPending) {
    return <WorkspaceLoadingState />;
  }
  if (sessionQuery.isError) {
    return (
      <SessionErrorState error={sessionQuery.error} onRetry={() => void sessionQuery.refetch()} />
    );
  }
  if (currentWorkspace === undefined) {
    return <WorkspaceUnavailableState />;
  }

  return (
    <CurrentWorkspaceProvider currentWorkspace={currentWorkspace}>
      <LiveUpdatesProvider workspaceSlug={currentWorkspace.workspace.slug}>
        <AppShell initialSidebarCollapsed={initialSidebarCollapsed}>{children}</AppShell>
      </LiveUpdatesProvider>
    </CurrentWorkspaceProvider>
  );
}

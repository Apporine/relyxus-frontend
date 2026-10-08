'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { NavigationAreaId } from '../navigation/navigation-model';
import type { Session, WorkspaceSummary } from '../session/session';

export type CurrentWorkspace = {
  user: Session['user'];
  workspace: WorkspaceSummary;
  /** Every workspace the person may switch to, including the current one. */
  workspaces: WorkspaceSummary[];
  accessibleAreaIds: ReadonlySet<NavigationAreaId>;
};

const CurrentWorkspaceContext = createContext<CurrentWorkspace | null>(null);

export function CurrentWorkspaceProvider({
  currentWorkspace,
  children,
}: {
  currentWorkspace: CurrentWorkspace;
  children: ReactNode;
}) {
  return (
    <CurrentWorkspaceContext.Provider value={currentWorkspace}>
      {children}
    </CurrentWorkspaceContext.Provider>
  );
}

/** The signed-in person and the workspace the current page belongs to. */
export function useCurrentWorkspace(): CurrentWorkspace {
  const context = useContext(CurrentWorkspaceContext);
  if (context === null) {
    throw new Error('useCurrentWorkspace must be used inside a workspace route.');
  }
  return context;
}

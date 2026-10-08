import type { RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';

import { sessionFixture } from '@/mocks/fixtures/session-fixture';
import type { NavigationAreaId } from '@/shell/navigation/navigation-model';
import type { WorkspaceSummary } from '@/shell/session/session';
import { CurrentWorkspaceProvider } from '@/shell/workspace/current-workspace';

import { renderWithIntl } from './render-with-intl';

function firstFixtureWorkspace(): WorkspaceSummary {
  const [firstWorkspace] = sessionFixture.workspaces;
  if (firstWorkspace === undefined) {
    throw new Error('The session fixture must contain at least one workspace.');
  }
  return firstWorkspace;
}

const paymentsWorkspace = firstFixtureWorkspace();

/** Renders inside the Payments / UK fixture workspace, optionally with restricted access. */
export function renderInWorkspace(
  element: ReactElement,
  {
    accessibleAreas = paymentsWorkspace.accessibleAreas,
    locale = 'en',
  }: { accessibleAreas?: NavigationAreaId[]; locale?: 'en' | 'ar' } = {},
): RenderResult {
  return renderWithIntl(
    <CurrentWorkspaceProvider
      currentWorkspace={{
        user: sessionFixture.user,
        workspace: { ...paymentsWorkspace, accessibleAreas },
        workspaces: sessionFixture.workspaces,
        accessibleAreaIds: new Set(accessibleAreas),
      }}
    >
      {element}
    </CurrentWorkspaceProvider>,
    { locale },
  );
}

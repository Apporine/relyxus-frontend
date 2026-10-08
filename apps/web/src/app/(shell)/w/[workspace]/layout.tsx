import { cookies } from 'next/headers';

import {
  isSidebarCollapsedCookieValue,
  SIDEBAR_COLLAPSED_COOKIE_NAME,
} from '@/shell/sidebar/sidebar-preference';
import { WorkspaceShell } from '@/shell/workspace-shell';

export default async function WorkspaceLayout({ params, children }: LayoutProps<'/w/[workspace]'>) {
  const { workspace } = await params;
  const cookieStore = await cookies();

  return (
    <WorkspaceShell
      workspaceSlug={decodeURIComponent(workspace)}
      initialSidebarCollapsed={isSidebarCollapsedCookieValue(
        cookieStore.get(SIDEBAR_COLLAPSED_COOKIE_NAME)?.value,
      )}
    >
      {children}
    </WorkspaceShell>
  );
}

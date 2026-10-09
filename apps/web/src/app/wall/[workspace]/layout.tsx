import { WorkspaceShell } from '@/shell/workspace-shell';

/** Wall mode keeps the workspace access checks but shows no console chrome (UI/UX s. 15). */
export default async function WallLayout({ params, children }: LayoutProps<'/wall/[workspace]'>) {
  const { workspace } = await params;
  return (
    <WorkspaceShell
      workspaceSlug={decodeURIComponent(workspace)}
      initialSidebarCollapsed={false}
      chrome="wall"
    >
      {children}
    </WorkspaceShell>
  );
}

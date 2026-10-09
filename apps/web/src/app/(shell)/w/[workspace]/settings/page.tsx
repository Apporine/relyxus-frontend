import type { Route } from 'next';
import { redirect } from 'next/navigation';

type WorkspaceSettingsRouteProps = {
  params: Promise<{ workspace: string }>;
};

/** Workspace settings open on incident types, the first settings page available. */
export default async function WorkspaceSettingsRoute({ params }: WorkspaceSettingsRouteProps) {
  const { workspace } = await params;
  redirect(`/w/${encodeURIComponent(workspace)}/settings/incident-types` as Route);
}

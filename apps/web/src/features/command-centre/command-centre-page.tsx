'use client';

import { useTranslations } from 'next-intl';

import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

/** Command Centre (UI/UX s. 10.1). The page frame; its cards arrive with the Command Centre capability. */
export function CommandCentrePage() {
  const translateCommandCentre = useTranslations('shell.commandCentre');
  const { workspace } = useCurrentWorkspace();

  return (
    <PageHeader
      title={translateCommandCentre('title')}
      description={translateCommandCentre('description', { workspace: workspace.name })}
    />
  );
}

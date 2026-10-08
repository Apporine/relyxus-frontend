'use client';

import { Skeleton } from '@relyxus/ui';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import {
  declarationStepStatuses,
  emptyDeclareIncidentFormState,
  type DeclareIncidentFormState,
} from './declare-incident-form-state';
import { DeclareIncidentForm } from './declare-incident-form';
import { DeclarationPreviewPanel } from './declaration-preview-panel';
import { DeclarationProgressPanel } from './declaration-progress-panel';
import { useIncidentTypes } from './declaration-queries';
import { incidentWarRoomHref } from './routes';

/** Declare incident wizard (UI/UX s. 10.3): progress, details form and preview. */
export function DeclareIncidentPage() {
  const translateDeclare = useTranslations('incidents.declare');
  const router = useRouter();
  const { workspace } = useCurrentWorkspace();
  const incidentTypesQuery = useIncidentTypes(workspace.slug);
  const [formState, setFormState] = useState<DeclareIncidentFormState>(
    emptyDeclareIncidentFormState,
  );

  function handleFormStateChange(patch: Partial<DeclareIncidentFormState>) {
    setFormState((previous) => ({ ...previous, ...patch }));
  }

  function handleDeclared(reference: string) {
    router.push(incidentWarRoomHref(workspace.slug, reference));
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={translateDeclare('title')} description={translateDeclare('description')} />

      <div className="grid gap-6 laptop:grid-cols-[minmax(0,20rem)_minmax(0,1fr)_minmax(0,17rem)]">
        <DeclarationProgressPanel stepStatuses={declarationStepStatuses(formState)} />

        {incidentTypesQuery.isPending ? (
          <Skeleton className="h-[48rem] w-full rounded-panel" />
        ) : incidentTypesQuery.isError ? (
          <p role="alert" className="text-body font-semibold text-critical">
            {translateDeclare('typesLoadFailed')}
          </p>
        ) : (
          <DeclareIncidentForm
            workspaceSlug={workspace.slug}
            incidentTypes={incidentTypesQuery.data}
            formState={formState}
            onFormStateChange={handleFormStateChange}
            onDeclared={handleDeclared}
          />
        )}

        <DeclarationPreviewPanel formState={formState} />
      </div>
    </div>
  );
}

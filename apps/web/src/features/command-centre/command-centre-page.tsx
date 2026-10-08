'use client';

import { Button, useCurrentTime } from '@relyxus/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { declareIncidentHref } from '@/features/incidents/routes';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { ActiveIncidentsPanel } from './active-incidents-panel';
import { AttentionStrip } from './attention-strip';
import { DecisionsPanel } from './decisions-panel';
import { OperationalHealthPanel } from './operational-health-panel';
import { RegulatorClocksPanel } from './regulator-clocks-panel';
import { useCommandCentreData } from './use-command-centre-data';

const PAGE_CLOCK_REFRESH_MS = 60_000;

/** Command Centre (UI/UX s. 10.1): attention strip, incidents, decisions, clocks and health. */
export function CommandCentrePage() {
  const translateCommandCentre = useTranslations('commandCentre');
  const { workspace } = useCurrentWorkspace();
  const format = useRelyxusFormat();
  const currentTime = useCurrentTime(PAGE_CLOCK_REFRESH_MS);
  const {
    activeIncidentsQuery,
    pendingApprovalsQuery,
    regulatorClocksQuery,
    servicesAtRiskQuery,
    connectorsQuery,
    lastDayQuery,
  } = useCommandCentreData(workspace.slug);

  const pageDescription =
    currentTime === null
      ? workspace.name
      : translateCommandCentre('description', {
          workspace: workspace.name,
          dateTime: format.dateAndTime(currentTime),
        });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateCommandCentre('title')}
        description={pageDescription}
        actions={
          <Button asChild variant="primary">
            <Link href={declareIncidentHref(workspace.slug)}>
              {translateCommandCentre('declareIncident')}
            </Link>
          </Button>
        }
      />

      <AttentionStrip
        workspaceSlug={workspace.slug}
        activeIncidents={activeIncidentsQuery.data}
        pendingApprovals={pendingApprovalsQuery.data}
      />

      <div className="grid gap-6 laptop:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ActiveIncidentsPanel
          workspaceSlug={workspace.slug}
          workspaceName={workspace.name}
          query={activeIncidentsQuery}
        />
        <div className="flex flex-col gap-6">
          <DecisionsPanel workspaceSlug={workspace.slug} query={pendingApprovalsQuery} />
          <RegulatorClocksPanel query={regulatorClocksQuery} />
        </div>
      </div>

      <OperationalHealthPanel
        servicesQuery={servicesAtRiskQuery}
        connectorsQuery={connectorsQuery}
        lastDayQuery={lastDayQuery}
      />
    </div>
  );
}

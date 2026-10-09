'use client';

import { useCurrentTime } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { BoxedFacts, StackedFacts } from '@/lib/ui/fact-list';
import { ListDetailContent } from '@/lib/ui/list-detail-content';
import { SelectableListPanel } from '@/lib/ui/list-detail-layout';
import { Panel } from '@/lib/ui/panel';
import { UnavailableAction } from '@/lib/ui/unavailable-action';
import { useUrlSelection } from '@/lib/ui/use-url-selection';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { AdminAreaNavigation } from './admin-area-navigation';
import type { SupportSessionDetail } from './model';
import { supportSessionQueries } from './queries';

const REMAINING_REFRESH_MS = 30_000;

function useRemainingTime() {
  const format = useRelyxusFormat();
  const currentTime = useCurrentTime(REMAINING_REFRESH_MS);
  return (expiresAt: string | null) =>
    expiresAt === null || currentTime === null
      ? null
      : format.duration(Math.max(0, Date.parse(expiresAt) - currentTime.getTime()));
}

function SessionDetail({ session }: { session: SupportSessionDetail }) {
  const translateSupport = useTranslations('admin.supportAccess');
  const remainingTime = useRemainingTime();
  const remaining = remainingTime(session.expiresAt);
  return (
    <Panel title={translateSupport('sessionTitle', { reference: session.reference })}>
      <BoxedFacts
        facts={[
          { label: translateSupport('reason'), value: session.reason },
          { label: translateSupport('scope'), value: session.scope },
          { label: translateSupport('dataClasses'), value: session.dataClasses },
          {
            label: translateSupport('duration'),
            value:
              remaining === null
                ? translateSupport(`states.${session.state}`)
                : translateSupport('remaining', { time: remaining }),
          },
          { label: translateSupport('approvals'), value: session.approvals },
          ...(session.denialReason === null
            ? []
            : [
                {
                  label: translateSupport('denialReason'),
                  value: session.denialReason,
                  className: 'text-critical',
                },
              ]),
          {
            label: translateSupport('observer'),
            value:
              session.observerName === null
                ? translateSupport('noObserver')
                : translateSupport('observerJoined', { name: session.observerName }),
          },
        ]}
      />
    </Panel>
  );
}

/** The customer's controls over a vendor session (Product s. 17). */
function LiveControl({ session }: { session: SupportSessionDetail }) {
  const translateSupport = useTranslations('admin.supportAccess');
  return (
    <Panel title={translateSupport('liveControl')}>
      <StackedFacts
        facts={[
          {
            label: translateSupport('actionLog'),
            value: translateSupport(session.isActionLogStreaming ? 'streaming' : 'notStreaming'),
          },
          { label: translateSupport('revocation'), value: translateSupport('immediate') },
          {
            label: translateSupport('sessionReport'),
            value: translateSupport(session.isSessionReportEnabled ? 'enabled' : 'disabled'),
          },
          { label: translateSupport('vendorActions'), value: translateSupport('audited') },
        ]}
      />
    </Panel>
  );
}

/** Support access (UI/UX s. 13.7, Figma frame 31): customer-controlled vendor sessions. */
export function SupportAccessPage() {
  const translateSupport = useTranslations('admin.supportAccess');
  const { workspace } = useCurrentWorkspace();
  const remainingTime = useRemainingTime();
  const listQuery = supportSessionQueries.useList(workspace.slug);
  const { selectedId, hrefFor } = useUrlSelection(
    'session',
    listQuery.data?.map((session) => session.id),
  );
  const detailQuery = supportSessionQueries.useDetail(workspace.slug, selectedId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateSupport('title')}
        description={translateSupport('description')}
        actions={
          <UnavailableAction
            label={translateSupport('revokeSession')}
            reason={translateSupport('revokeSessionUnavailable')}
          />
        }
      />
      <AdminAreaNavigation current="support-access" />
      <ListDetailContent
        listQuery={listQuery}
        detailQuery={detailQuery}
        selectedId={selectedId}
        sectionName={translateSupport('title')}
        detailSectionName={translateSupport('detailSectionName')}
        renderList={(sessions) => (
          <SelectableListPanel
            title={translateSupport('sessions')}
            emptyText={translateSupport('empty')}
            selectedId={selectedId}
            hrefFor={hrefFor}
            items={sessions.map((session) => {
              const remaining = remainingTime(session.expiresAt);
              return {
                id: session.id,
                title: session.reference,
                meta:
                  session.state === 'active' && remaining !== null
                    ? translateSupport('activeMeta', { time: remaining })
                    : translateSupport(`states.${session.state}`),
              };
            })}
          />
        )}
        renderDetail={(session) => <SessionDetail session={session} />}
        renderAside={(session) => <LiveControl session={session} />}
      />
    </div>
  );
}

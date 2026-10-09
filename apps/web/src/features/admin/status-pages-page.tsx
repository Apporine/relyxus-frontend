'use client';

import { useLocale, useTranslations } from 'next-intl';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { formattingLocaleFor } from '@/lib/i18n/locales';
import { BoxedFacts, StackedFacts } from '@/lib/ui/fact-list';
import { ListDetailContent } from '@/lib/ui/list-detail-content';
import { SelectableListPanel } from '@/lib/ui/list-detail-layout';
import { Panel } from '@/lib/ui/panel';
import { UnavailableAction } from '@/lib/ui/unavailable-action';
import { useUrlSelection } from '@/lib/ui/use-url-selection';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { AdminAreaNavigation } from './admin-area-navigation';
import type { StatusPageDetail } from './model';
import { statusPageQueries } from './queries';

function DraftUpdate({ statusPage }: { statusPage: StatusPageDetail }) {
  const translatePages = useTranslations('admin.statusPages');
  const format = useRelyxusFormat();
  const listFormat = new Intl.ListFormat(formattingLocaleFor(useLocale()), {
    type: 'conjunction',
  });
  const { draftUpdate } = statusPage;
  return (
    <Panel title={translatePages('draftUpdate')}>
      {draftUpdate === null ? (
        <p className="text-body text-fg-secondary">{translatePages('noDraft')}</p>
      ) : (
        <BoxedFacts
          facts={[
            { label: translatePages('fields.title'), value: draftUpdate.title },
            { label: translatePages('fields.message'), value: draftUpdate.message },
            {
              label: translatePages('fields.nextUpdate'),
              value: format.timeOfDay(new Date(draftUpdate.nextUpdateAt)),
            },
            {
              label: translatePages('fields.components'),
              value: listFormat.format(draftUpdate.components),
            },
            {
              label: translatePages('fields.subscribers'),
              value: translatePages('subscriberCount', { count: statusPage.subscriberCount }),
            },
            {
              label: translatePages('fields.approval'),
              value: translatePages(
                draftUpdate.isApprovalRequired ? 'approvalRequired' : 'approvalNotRequired',
              ),
            },
          ]}
        />
      )}
    </Panel>
  );
}

/** Exactly what the audience will see and how many people will be told (UI/UX s. 12.6). */
function LivePreview({ statusPage }: { statusPage: StatusPageDetail }) {
  const translatePages = useTranslations('admin.statusPages');
  return (
    <Panel title={translatePages('preview')}>
      <StackedFacts
        facts={[
          {
            label: translatePages('fields.audience'),
            value: translatePages(`audiences.${statusPage.audience}`),
          },
          {
            label: translatePages('fields.state'),
            value: translatePages(`componentStates.${statusPage.state}`),
            className: statusPage.state === 'operational' ? 'text-healthy' : 'text-warning',
          },
          {
            label: translatePages('fields.subscribers'),
            value: translatePages('willBeNotified', { count: statusPage.subscriberCount }),
          },
          {
            label: translatePages('fields.sync'),
            value: translatePages(statusPage.isSyncReady ? 'syncReady' : 'syncFailing'),
            className: statusPage.isSyncReady ? 'text-healthy' : 'text-critical',
          },
        ]}
      />
    </Panel>
  );
}

/** Status pages (UI/UX s. 12.6, Figma frame 21). */
export function StatusPagesPage() {
  const translatePages = useTranslations('admin.statusPages');
  const { workspace } = useCurrentWorkspace();
  const listQuery = statusPageQueries.useList(workspace.slug);
  const { selectedId, hrefFor } = useUrlSelection(
    'page',
    listQuery.data?.map((statusPage) => statusPage.id),
  );
  const detailQuery = statusPageQueries.useDetail(workspace.slug, selectedId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translatePages('title')}
        description={translatePages('description')}
        actions={
          <UnavailableAction
            label={translatePages('newUpdate')}
            reason={translatePages('newUpdateUnavailable')}
          />
        }
      />
      <AdminAreaNavigation current="status-pages" />
      <ListDetailContent
        listQuery={listQuery}
        detailQuery={detailQuery}
        selectedId={selectedId}
        sectionName={translatePages('title')}
        detailSectionName={translatePages('detailSectionName')}
        renderList={(statusPages) => (
          <SelectableListPanel
            title={translatePages('listTitle')}
            emptyText={translatePages('empty')}
            selectedId={selectedId}
            hrefFor={hrefFor}
            items={statusPages.map((statusPage) => ({
              id: statusPage.id,
              title: statusPage.name,
              meta: translatePages('listMeta', {
                audience: translatePages(`audiences.${statusPage.audience}`),
                count: statusPage.activeIncidentCount,
              }),
            }))}
          />
        )}
        renderDetail={(statusPage) => <DraftUpdate statusPage={statusPage} />}
        renderAside={(statusPage) => <LivePreview statusPage={statusPage} />}
      />
    </div>
  );
}

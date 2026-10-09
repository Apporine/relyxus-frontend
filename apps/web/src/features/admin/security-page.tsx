'use client';

import { useTranslations } from 'next-intl';

import { BoxedFacts, StackedFacts } from '@/lib/ui/fact-list';
import { ListDetailContent } from '@/lib/ui/list-detail-content';
import { SelectableListPanel } from '@/lib/ui/list-detail-layout';
import { Panel } from '@/lib/ui/panel';
import { UnavailableAction } from '@/lib/ui/unavailable-action';
import { useUrlSelection } from '@/lib/ui/use-url-selection';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { AdminAreaNavigation } from './admin-area-navigation';
import type { SecuritySectionDetail } from './model';
import { securitySectionQueries } from './queries';

function SecuritySettings({ section }: { section: SecuritySectionDetail }) {
  const translateSecurity = useTranslations('admin.security');
  return (
    <Panel title={translateSecurity(`sections.${section.id}`)}>
      <BoxedFacts
        facts={section.settings.map((setting) => ({
          label: translateSecurity(`settings.${setting.key}`),
          value: setting.value,
        }))}
      />
    </Panel>
  );
}

/** Where data can go and who can see it, in one place (UI/UX s. 13.9). */
function DataFlowPreview({ section }: { section: SecuritySectionDetail }) {
  const translateSecurity = useTranslations('admin.security');
  return (
    <Panel title={translateSecurity('dataFlow')}>
      <StackedFacts
        facts={section.dataFlow.map((flow) => ({
          label: translateSecurity(`dataFlowKeys.${flow.key}`),
          value: flow.value,
        }))}
      />
    </Panel>
  );
}

/** Security and data controls (UI/UX s. 13.9, Figma frame 33). */
export function SecurityPage() {
  const translateSecurity = useTranslations('admin.security');
  const { workspace } = useCurrentWorkspace();
  const listQuery = securitySectionQueries.useList(workspace.slug);
  const { selectedId, hrefFor } = useUrlSelection(
    'section',
    listQuery.data?.map((section) => section.id),
  );
  const detailQuery = securitySectionQueries.useDetail(workspace.slug, selectedId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateSecurity('title')}
        description={translateSecurity('description')}
        actions={
          <UnavailableAction
            label={translateSecurity('reviewChange')}
            reason={translateSecurity('reviewChangeUnavailable')}
          />
        }
      />
      <AdminAreaNavigation current="security" />
      <ListDetailContent
        listQuery={listQuery}
        detailQuery={detailQuery}
        selectedId={selectedId}
        sectionName={translateSecurity('title')}
        detailSectionName={translateSecurity('detailSectionName')}
        renderList={(sections) => (
          <SelectableListPanel
            title={translateSecurity('listTitle')}
            emptyText={translateSecurity('empty')}
            selectedId={selectedId}
            hrefFor={hrefFor}
            items={sections.map((section) => ({
              id: section.id,
              title: translateSecurity(`sections.${section.id}`),
              meta: section.summary,
            }))}
          />
        )}
        renderDetail={(section) => <SecuritySettings section={section} />}
        renderAside={(section) => <DataFlowPreview section={section} />}
      />
    </div>
  );
}

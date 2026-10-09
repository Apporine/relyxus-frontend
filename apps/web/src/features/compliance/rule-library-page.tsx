'use client';

import { cn } from '@relyxus/ui';
import { useLocale, useTranslations } from 'next-intl';

import { createListDetailQueries } from '@/lib/api/list-detail-queries';
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

import { ComplianceAreaNavigation } from './compliance-area-navigation';
import {
  rulePackageDetailSchema,
  rulePackageListSchema,
  type RulePackageDetail,
} from './report-and-rules-model';

export const rulePackageQueries = createListDetailQueries('compliance/rule-packages', {
  list: rulePackageListSchema,
  detail: rulePackageDetailSchema,
});

function RulePackagePanel({ rulePackage }: { rulePackage: RulePackageDetail }) {
  const translateRules = useTranslations('ruleLibrary');
  const format = useRelyxusFormat();
  const listFormat = new Intl.ListFormat(formattingLocaleFor(useLocale()), {
    type: 'conjunction',
  });
  return (
    <Panel title={rulePackage.name}>
      <BoxedFacts
        facts={[
          {
            label: translateRules('effectiveFrom'),
            value: format.dateAndTime(new Date(rulePackage.effectiveFrom)),
          },
          {
            label: translateRules('validation'),
            value:
              rulePackage.signedOffBy === null
                ? translateRules('notSignedOff')
                : translateRules('signedOffBy', { names: rulePackage.signedOffBy }),
            className: rulePackage.signedOffBy === null ? 'text-warning' : undefined,
          },
          {
            label: translateRules('clockRules'),
            value: translateRules('clockRuleSummary', {
              count: rulePackage.clockRuleCount,
              conflicts: rulePackage.conflicts.length,
            }),
          },
          { label: translateRules('templates'), value: listFormat.format(rulePackage.templates) },
          {
            label: translateRules('activatedWorkspaces'),
            value: String(rulePackage.activatedWorkspaceCount),
          },
          {
            label: translateRules('reviewDue'),
            value: format.dateAndTime(new Date(rulePackage.reviewDueAt)),
          },
        ]}
      />
    </Panel>
  );
}

function VersionHistory({ rulePackage }: { rulePackage: RulePackageDetail }) {
  const translateRules = useTranslations('ruleLibrary');
  return (
    <Panel title={translateRules('versionHistory')}>
      <StackedFacts
        facts={[
          ...rulePackage.versions.map((version) => ({
            label: translateRules('version', { version: version.version }),
            value: translateRules(`versionStates.${version.state}`),
            className: cn(version.state === 'active' && 'text-healthy'),
          })),
          {
            label: translateRules('conflicts'),
            value:
              rulePackage.conflicts.length === 0
                ? translateRules('noConflicts')
                : rulePackage.conflicts.join('; '),
            className: rulePackage.conflicts.length === 0 ? undefined : 'text-critical',
          },
        ]}
      />
    </Panel>
  );
}

/** Regulatory rule library (UI/UX s. 12.3, Figma frame 18). */
export function RuleLibraryPage() {
  const translateRules = useTranslations('ruleLibrary');
  const { workspace } = useCurrentWorkspace();
  const listQuery = rulePackageQueries.useList(workspace.slug);
  const { selectedId, hrefFor } = useUrlSelection(
    'package',
    listQuery.data?.map((rulePackage) => rulePackage.id),
  );
  const detailQuery = rulePackageQueries.useDetail(workspace.slug, selectedId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateRules('title')}
        description={translateRules('description')}
        actions={
          <UnavailableAction
            label={translateRules('importVersion')}
            reason={translateRules('importVersionUnavailable')}
          />
        }
      />
      <ComplianceAreaNavigation current="rules" />
      <ListDetailContent
        listQuery={listQuery}
        detailQuery={detailQuery}
        selectedId={selectedId}
        sectionName={translateRules('title')}
        detailSectionName={translateRules('detailSectionName')}
        renderList={(rulePackages) => (
          <SelectableListPanel
            title={translateRules('jurisdictions')}
            emptyText={translateRules('empty')}
            selectedId={selectedId}
            hrefFor={hrefFor}
            items={rulePackages.map((rulePackage) => ({
              id: rulePackage.id,
              title: rulePackage.jurisdiction,
              meta: rulePackage.name,
            }))}
          />
        )}
        renderDetail={(rulePackage) => <RulePackagePanel rulePackage={rulePackage} />}
        renderAside={(rulePackage) => <VersionHistory rulePackage={rulePackage} />}
      />
    </div>
  );
}

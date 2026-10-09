'use client';

import { cn, Skeleton, useCurrentTime } from '@relyxus/ui';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { requestApi } from '@/lib/api/http-client';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { BoxedFacts, StackedFacts } from '@/lib/ui/fact-list';
import { ListDetailLayout, SelectableListPanel } from '@/lib/ui/list-detail-layout';
import { PageLoadingState } from '@/lib/ui/page-loading-state';
import { isHiddenOrMissing, NoAccessState, PageLoadFailedState } from '@/lib/ui/page-states';
import { Panel } from '@/lib/ui/panel';
import { UnavailableAction } from '@/lib/ui/unavailable-action';
import { useUrlSelection } from '@/lib/ui/use-url-selection';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import {
  regulatorReportSchema,
  type RegulatorReport,
  type ReportField,
  type ReportFieldStatus,
} from './report-and-rules-model';

const DEADLINE_REFRESH_MS = 1_000;

const fieldStatusClassNames = {
  complete: 'text-healthy',
  'ai-suggested': 'text-ai',
  'needs-input': 'text-warning',
} satisfies Record<ReportFieldStatus, string>;

export function useRegulatorReport(workspaceSlug: string, reportId: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceSlug, 'regulator-reports', reportId],
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `/workspaces/${encodeURIComponent(workspaceSlug)}/regulator-reports/${encodeURIComponent(reportId)}`,
          responseSchema: regulatorReportSchema,
          signal,
        })
      ).data,
  });
}

/** Required fields that still need a person's input; review cannot be requested until zero. */
export function missingRequiredFields(report: RegulatorReport): ReportField[] {
  return report.fields.filter((field) => field.isRequired && field.status === 'needs-input');
}

function SelectedField({ field }: { field: ReportField }) {
  const translateReport = useTranslations('regulatorReport');
  return (
    <Panel title={translateReport('selectedField', { name: field.name })}>
      <BoxedFacts
        facts={[
          {
            label: translateReport('value'),
            value: field.value ?? translateReport('noValue'),
            className: field.value === null ? 'text-warning' : undefined,
          },
          ...field.sources.map((source, index) => ({
            label: translateReport('source', { number: index + 1 }),
            value: translateReport('sourceDetail', source),
          })),
          {
            label: translateReport('authorship'),
            value: translateReport(`authorships.${field.authorship}`),
          },
          {
            label: translateReport('validation'),
            value: translateReport(`validations.${field.validation}`),
            className: field.validation === 'verified' ? 'text-healthy' : 'text-warning',
          },
        ]}
      />
    </Panel>
  );
}

function ReportStatus({ report }: { report: RegulatorReport }) {
  const translateReport = useTranslations('regulatorReport');
  const format = useRelyxusFormat();
  const currentTime = useCurrentTime(DEADLINE_REFRESH_MS);
  const missingCount = missingRequiredFields(report).length;
  return (
    <Panel title={translateReport('status')}>
      <StackedFacts
        facts={[
          { label: translateReport('stage'), value: translateReport(`stages.${report.stage}`) },
          {
            label: translateReport('deadline'),
            value:
              currentTime === null
                ? format.timeOfDay(new Date(report.deadlineAt))
                : format.deadline(
                    Date.parse(report.deadlineAt) - currentTime.getTime(),
                    new Date(report.deadlineAt),
                  ),
            className: 'text-warning tabular-nums',
          },
          {
            label: translateReport('missing'),
            value: translateReport('missingCount', { count: missingCount }),
            className: missingCount === 0 ? 'text-healthy' : 'text-warning',
          },
          {
            label: translateReport('guessedText'),
            value: translateReport('guessedTextCount', { count: report.guessedTextCount }),
            className: report.guessedTextCount === 0 ? 'text-healthy' : 'text-critical',
          },
        ]}
      />
    </Panel>
  );
}

/** Regulator report editor (UI/UX s. 12.2, Figma frame 17): every field shows its source. */
export function RegulatorReportPage({ reportId }: { reportId: string }) {
  const translateReport = useTranslations('regulatorReport');
  const { workspace } = useCurrentWorkspace();
  const reportQuery = useRegulatorReport(workspace.slug, reportId);
  const { selectedId, hrefFor } = useUrlSelection(
    'field',
    reportQuery.data?.fields.map((field) => field.id),
  );

  if (reportQuery.isPending) {
    return <PageLoadingState />;
  }
  if (reportQuery.isError) {
    return isHiddenOrMissing(reportQuery.error) ? (
      <NoAccessState />
    ) : (
      <PageLoadFailedState
        error={reportQuery.error}
        sectionName={translateReport('sectionName')}
        onRetry={() => void reportQuery.refetch()}
      />
    );
  }

  const report = reportQuery.data;
  const selectedField = report.fields.find((field) => field.id === selectedId);
  const missingCount = missingRequiredFields(report).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={report.obligationName}
        description={translateReport('subtitle', {
          incident: report.incidentReference,
          jurisdiction: report.jurisdiction,
          rulePackage: report.rulePackage,
        })}
        actions={
          <UnavailableAction
            label={translateReport('requestReview')}
            reason={
              missingCount > 0
                ? translateReport('requestReviewBlocked', { count: missingCount })
                : translateReport('requestReviewUnavailable')
            }
          />
        }
      />
      <ListDetailLayout
        list={
          <SelectableListPanel
            title={translateReport('fields')}
            emptyText={translateReport('noFields')}
            selectedId={selectedId}
            hrefFor={hrefFor}
            items={report.fields.map((field) => ({
              id: field.id,
              title: field.name,
              meta: (
                <span className={cn('font-semibold', fieldStatusClassNames[field.status])}>
                  {translateReport(`fieldStatuses.${field.status}`)}
                </span>
              ),
            }))}
          />
        }
        detail={
          selectedField === undefined ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <SelectedField field={selectedField} />
          )
        }
        aside={<ReportStatus report={report} />}
      />
    </div>
  );
}

'use client';

import { cn, useCurrentTime } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { BoxedFacts, StackedFacts } from '@/lib/ui/fact-list';
import { ListDetailLayout } from '@/lib/ui/list-detail-layout';
import { PageLoadingState } from '@/lib/ui/page-loading-state';
import { PageLoadFailedState } from '@/lib/ui/page-states';
import { Panel } from '@/lib/ui/panel';
import { UnavailableAction } from '@/lib/ui/unavailable-action';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { AdminAreaNavigation } from './admin-area-navigation';
import type { CheckStatus, PlatformOperations } from './model';
import { usePlatformOperations } from './queries';

const RECENCY_REFRESH_MS = 60_000;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1_000;
/** Certificates closer than this to expiry are shown as a warning. */
const CERTIFICATE_WARNING_DAYS = 30;

const checkStatusClassNames = {
  healthy: 'text-healthy',
  warning: 'text-warning',
  failing: 'text-critical',
} satisfies Record<CheckStatus, string>;

function HealthSummary({ platform }: { platform: PlatformOperations }) {
  const translatePlatform = useTranslations('admin.platform');
  const format = useRelyxusFormat();
  const currentTime = useCurrentTime(RECENCY_REFRESH_MS);
  const certificateDaysLeft =
    currentTime === null
      ? null
      : Math.floor(
          (Date.parse(platform.certificateExpiresAt) - currentTime.getTime()) /
            MILLISECONDS_PER_DAY,
        );

  return (
    <Panel title={translatePlatform('healthSummary')}>
      <StackedFacts
        facts={[
          {
            label: translatePlatform('version'),
            value: translatePlatform(
              platform.isCurrentVersion ? 'versionCurrent' : 'versionBehind',
              {
                version: platform.version,
              },
            ),
          },
          {
            label: translatePlatform('cluster'),
            value: translatePlatform('clusterSummary', {
              status: translatePlatform(`statuses.${platform.clusterStatus}`),
              nodes: platform.nodeCount,
            }),
            className: checkStatusClassNames[platform.clusterStatus],
          },
          {
            label: translatePlatform('capacity'),
            value: translatePlatform('capacitySummary', {
              current: platform.capacityPercent / 100,
              projected: platform.projectedCapacityPercent / 100,
            }),
          },
          {
            label: translatePlatform('backup'),
            value:
              currentTime === null
                ? format.dateAndTime(new Date(platform.lastVerifiedBackupAt))
                : translatePlatform('backupVerified', {
                    time: format.recency(new Date(platform.lastVerifiedBackupAt), currentTime),
                  }),
          },
          {
            label: translatePlatform('certificate'),
            value:
              certificateDaysLeft === null
                ? format.dateAndTime(new Date(platform.certificateExpiresAt))
                : translatePlatform('certificateDays', { days: certificateDaysLeft }),
            className: cn(
              certificateDaysLeft !== null &&
                certificateDaysLeft < CERTIFICATE_WARNING_DAYS &&
                'text-warning',
            ),
          },
        ]}
      />
    </Panel>
  );
}

function SystemChecks({ platform }: { platform: PlatformOperations }) {
  const translatePlatform = useTranslations('admin.platform');
  return (
    <Panel title={translatePlatform('systemChecks')}>
      <BoxedFacts
        facts={platform.checks.map((check) => ({
          label: check.name,
          value: (
            <span className={checkStatusClassNames[check.status]}>
              {translatePlatform('checkSummary', {
                status: translatePlatform(`statuses.${check.status}`),
                detail: check.detail,
              })}
            </span>
          ),
        }))}
      />
    </Panel>
  );
}

function AvailableUpdate({ platform }: { platform: PlatformOperations }) {
  const translatePlatform = useTranslations('admin.platform');
  const { availableUpdate } = platform;
  return (
    <Panel title={translatePlatform('availableUpdate')}>
      {availableUpdate === null ? (
        <p className="text-body text-fg-secondary">{translatePlatform('upToDate')}</p>
      ) : (
        <StackedFacts
          facts={[
            { label: translatePlatform('version'), value: availableUpdate.version },
            {
              label: translatePlatform('preflight'),
              value: translatePlatform(
                availableUpdate.isPreflightRequired ? 'required' : 'notRequired',
              ),
            },
            {
              label: translatePlatform('estimate'),
              value: translatePlatform('estimateMinutes', {
                minutes: availableUpdate.estimatedMinutes,
              }),
            },
            {
              label: translatePlatform('rollback'),
              value: translatePlatform(
                availableUpdate.isRollbackSupported ? 'supported' : 'notSupported',
              ),
            },
          ]}
        />
      )}
    </Panel>
  );
}

/** Platform operations for self-hosted deployments (UI/UX s. 13.6, Figma frame 30). */
export function PlatformOperationsPage() {
  const translatePlatform = useTranslations('admin.platform');
  const { workspace } = useCurrentWorkspace();
  const platformQuery = usePlatformOperations(workspace.slug);

  const header = (
    <>
      <PageHeader
        title={translatePlatform('title')}
        description={translatePlatform('description')}
        actions={
          <UnavailableAction
            label={translatePlatform('generatePlan')}
            reason={translatePlatform('generatePlanUnavailable')}
          />
        }
      />
      <AdminAreaNavigation current="platform" />
    </>
  );

  if (platformQuery.isPending) {
    return <PageLoadingState />;
  }
  if (platformQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <PageLoadFailedState
          error={platformQuery.error}
          sectionName={translatePlatform('title')}
          onRetry={() => void platformQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {header}
      <ListDetailLayout
        list={<HealthSummary platform={platformQuery.data} />}
        detail={<SystemChecks platform={platformQuery.data} />}
        aside={<AvailableUpdate platform={platformQuery.data} />}
      />
    </div>
  );
}

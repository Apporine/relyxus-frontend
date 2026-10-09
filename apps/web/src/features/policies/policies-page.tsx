'use client';

import { EnvironmentBadge } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import { BoxedFacts, StackedFacts } from '@/lib/ui/fact-list';
import { ListDetailContent } from '@/lib/ui/list-detail-content';
import { SelectableListPanel } from '@/lib/ui/list-detail-layout';
import { Panel } from '@/lib/ui/panel';
import { UnavailableAction } from '@/lib/ui/unavailable-action';
import { useUrlSelection } from '@/lib/ui/use-url-selection';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import type { PolicyDetail } from './model';
import { policyQueries } from './queries';

function PolicyDetailPanel({ policy }: { policy: PolicyDetail }) {
  const translatePolicies = useTranslations('policies');
  const translateEnvironments = useTranslations('domain.environments');
  return (
    <Panel title={policy.name}>
      <BoxedFacts
        facts={[
          { label: translatePolicies('facts.action'), value: policy.action },
          { label: translatePolicies('facts.scope'), value: policy.scope },
          {
            label: translatePolicies('facts.environment'),
            value: (
              <EnvironmentBadge
                environment={policy.environment}
                label={translateEnvironments(policy.environment)}
              />
            ),
          },
          {
            label: translatePolicies('facts.autonomy'),
            value: translatePolicies(`autonomy.${policy.autonomy}`),
          },
          { label: translatePolicies('facts.approvers'), value: policy.approvers },
          {
            label: translatePolicies('facts.freezeCalendar'),
            value: policy.freezeCalendar ?? translatePolicies('noFreeze'),
          },
        ]}
      />
    </Panel>
  );
}

/** Effective policy: what actually applies once every policy is combined (UI/UX s. 11.3). */
function EffectivePolicyPanel({ policy }: { policy: PolicyDetail }) {
  const translatePolicies = useTranslations('policies');
  const { effective } = policy;
  return (
    <Panel title={translatePolicies('effective.title')}>
      <StackedFacts
        facts={[
          {
            label: translatePolicies('effective.result'),
            value: translatePolicies(`autonomy.${effective.result}`),
          },
          {
            label: translatePolicies('effective.inheritedDeny'),
            value: effective.inheritedDeny ?? translatePolicies('none'),
            className: effective.inheritedDeny === null ? undefined : 'text-critical',
          },
          {
            label: translatePolicies('effective.rollback'),
            value: translatePolicies(effective.isRollbackRequired ? 'required' : 'notRequired'),
          },
          {
            label: translatePolicies('effective.verification'),
            value: translatePolicies(effective.isVerificationRequired ? 'required' : 'notRequired'),
          },
          {
            label: translatePolicies('effective.simulation'),
            value: translatePolicies('effective.simulationResult', effective.simulation),
          },
        ]}
      />
    </Panel>
  );
}

/** Policies and autonomy (UI/UX s. 11.3, Figma frame 11). */
export function PoliciesPage() {
  const translatePolicies = useTranslations('policies');
  const { workspace } = useCurrentWorkspace();
  const listQuery = policyQueries.useList(workspace.slug);
  const { selectedId, hrefFor } = useUrlSelection(
    'policy',
    listQuery.data?.map((policy) => policy.id),
  );
  const detailQuery = policyQueries.useDetail(workspace.slug, selectedId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translatePolicies('title')}
        description={translatePolicies('description')}
        actions={
          <UnavailableAction
            label={translatePolicies('newPolicy')}
            reason={translatePolicies('newPolicyUnavailable')}
          />
        }
      />
      <ListDetailContent
        listQuery={listQuery}
        detailQuery={detailQuery}
        selectedId={selectedId}
        sectionName={translatePolicies('title')}
        detailSectionName={translatePolicies('detailSectionName')}
        renderList={(policies) => (
          <SelectableListPanel
            title={translatePolicies('listTitle')}
            emptyText={translatePolicies('empty')}
            selectedId={selectedId}
            hrefFor={hrefFor}
            items={policies.map((policy) => ({
              id: policy.id,
              title: policy.name,
              meta: translatePolicies('listMeta', {
                autonomy: translatePolicies(`autonomy.${policy.autonomy}`),
                state: translatePolicies(`states.${policy.state}`),
              }),
            }))}
          />
        )}
        renderDetail={(policy) => <PolicyDetailPanel policy={policy} />}
        renderAside={(policy) => <EffectivePolicyPanel policy={policy} />}
      />
    </div>
  );
}

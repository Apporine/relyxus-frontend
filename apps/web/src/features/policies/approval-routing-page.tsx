'use client';

import { useTranslations } from 'next-intl';

import { createListDetailQueries } from '@/lib/api/list-detail-queries';
import { BoxedFacts, StackedFacts } from '@/lib/ui/fact-list';
import { ListDetailContent } from '@/lib/ui/list-detail-content';
import { SelectableListPanel } from '@/lib/ui/list-detail-layout';
import { Panel } from '@/lib/ui/panel';
import { UnavailableAction } from '@/lib/ui/unavailable-action';
import { useUrlSelection } from '@/lib/ui/use-url-selection';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { PoliciesAreaNavigation } from './policies-area-navigation';
import {
  approvalRouteDetailSchema,
  approvalRouteListSchema,
  type ApprovalRouteDetail,
} from './routing-and-notification-model';

export const approvalRouteQueries = createListDetailQueries('policies/approval-routes', {
  list: approvalRouteListSchema,
  detail: approvalRouteDetailSchema,
});

function RouteConfiguration({ route }: { route: ApprovalRouteDetail }) {
  const translateRouting = useTranslations('approvalRouting');
  return (
    <Panel title={route.name}>
      <BoxedFacts
        facts={[
          ...route.stages.map((stage) => ({
            label: translateRouting('stageResolver', { number: stage.number }),
            value: translateRouting('resolverWithQuorum', {
              resolver: stage.resolver,
              quorum: stage.quorum,
            }),
          })),
          {
            label: translateRouting('proposerExclusion'),
            value: translateRouting(route.isProposerExcluded ? 'enabled' : 'disabled'),
          },
          {
            label: translateRouting('fallback'),
            value:
              route.fallbackAfterMinutes === null
                ? translateRouting('noFallback')
                : translateRouting('fallbackAfter', { minutes: route.fallbackAfterMinutes }),
          },
          {
            label: translateRouting('delegation'),
            value: translateRouting(route.isDelegationAllowed ? 'allowed' : 'notAllowed'),
          },
          {
            label: translateRouting('mfaLabel'),
            value: translateRouting(`mfa.${route.mfaRequirement}`),
          },
        ]}
      />
    </Panel>
  );
}

/** Exactly who will be asked, so nobody discovers a routing mistake mid-incident (UI/UX s. 11.4). */
function ExactApprovers({ route }: { route: ApprovalRouteDetail }) {
  const translateRouting = useTranslations('approvalRouting');
  return (
    <Panel title={translateRouting('exactApprovers')}>
      <StackedFacts
        facts={[
          ...route.preview.stages.map((stage) => ({
            label: translateRouting('stage', { number: stage.number }),
            value: (
              <ul className="flex flex-col gap-1">
                {stage.approvers.map((approver) => (
                  <li key={approver.name}>{translateRouting('approverWithReason', approver)}</li>
                ))}
              </ul>
            ),
          })),
          {
            label: translateRouting('eligibility'),
            value: translateRouting(
              route.preview.areAllApproversEligible ? 'allEligible' : 'notAllEligible',
            ),
            className: route.preview.areAllApproversEligible ? 'text-healthy' : 'text-critical',
          },
          { label: translateRouting('absence'), value: translateRouting('neverAutoApproves') },
        ]}
      />
    </Panel>
  );
}

/** Approval routing builder (UI/UX s. 11.4, Figma frame 12). */
export function ApprovalRoutingPage() {
  const translateRouting = useTranslations('approvalRouting');
  const { workspace } = useCurrentWorkspace();
  const listQuery = approvalRouteQueries.useList(workspace.slug);
  const { selectedId, hrefFor } = useUrlSelection(
    'route',
    listQuery.data?.map((route) => route.id),
  );
  const detailQuery = approvalRouteQueries.useDetail(workspace.slug, selectedId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateRouting('title')}
        description={translateRouting('description')}
        actions={
          <UnavailableAction
            label={translateRouting('newRoute')}
            reason={translateRouting('newRouteUnavailable')}
          />
        }
      />
      <PoliciesAreaNavigation current="approval-routing" />
      <ListDetailContent
        listQuery={listQuery}
        detailQuery={detailQuery}
        selectedId={selectedId}
        sectionName={translateRouting('title')}
        detailSectionName={translateRouting('detailSectionName')}
        renderList={(routes) => (
          <SelectableListPanel
            title={translateRouting('listTitle')}
            emptyText={translateRouting('empty')}
            selectedId={selectedId}
            hrefFor={hrefFor}
            items={routes.map((route) => ({
              id: route.id,
              title: route.name,
              meta: translateRouting('listMeta', {
                mode: translateRouting(`modes.${route.mode}`),
                stages: route.stageCount,
                quorum: route.quorum,
              }),
            }))}
          />
        )}
        renderDetail={(route) => <RouteConfiguration route={route} />}
        renderAside={(route) => <ExactApprovers route={route} />}
      />
    </div>
  );
}

'use client';

import { cn } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import { StackedFacts } from '@/lib/ui/fact-list';
import { ListDetailContent } from '@/lib/ui/list-detail-content';
import { SelectableListPanel } from '@/lib/ui/list-detail-layout';
import { Panel } from '@/lib/ui/panel';
import { UnavailableAction } from '@/lib/ui/unavailable-action';
import { useUrlSelection } from '@/lib/ui/use-url-selection';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { AdminAreaNavigation } from './admin-area-navigation';
import type { PromotionDetail } from './model';
import { promotionQueries } from './queries';

const differenceKindClassNames = {
  added: 'text-healthy',
  changed: 'text-warning',
  deleted: 'text-critical',
} as const;

function DifferenceTree({ promotion }: { promotion: PromotionDetail }) {
  const translatePromotion = useTranslations('admin.promotion');
  return (
    <Panel title={translatePromotion('differences')}>
      <p className="-mt-2 text-meta text-fg-secondary">
        {translatePromotion('counts', promotion.counts)}
      </p>
      <ul className="flex flex-col divide-y divide-divider">
        {promotion.differences.map((difference) => (
          <li
            key={`${difference.area}-${difference.summary}`}
            className="flex flex-col gap-0.5 py-2 first:pt-0"
          >
            <span className="text-meta font-semibold text-fg-tertiary uppercase">
              {difference.area}
            </span>
            <span className="text-table">
              {difference.summary}{' '}
              <span className={cn('font-semibold', differenceKindClassNames[difference.kind])}>
                {translatePromotion(`kinds.${difference.kind}`)}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {promotion.managedByCodeCount === 0 ? null : (
        <p className="text-meta text-fg-secondary">
          {translatePromotion('managedByCode', { count: promotion.managedByCodeCount })}
        </p>
      )}
    </Panel>
  );
}

function PromotionValidation({ promotion }: { promotion: PromotionDetail }) {
  const translatePromotion = useTranslations('admin.promotion');
  const { validation } = promotion;
  return (
    <Panel title={translatePromotion('validation')}>
      <StackedFacts
        facts={[
          {
            label: translatePromotion('schema'),
            value: translatePromotion(validation.isSchemaValid ? 'passed' : 'failed'),
            className: validation.isSchemaValid ? 'text-healthy' : 'text-critical',
          },
          {
            label: translatePromotion('dependencies'),
            value: translatePromotion('missingDependencies', {
              count: validation.missingDependencyCount,
            }),
            className: validation.missingDependencyCount === 0 ? 'text-healthy' : 'text-critical',
          },
          {
            label: translatePromotion('destructive'),
            value: translatePromotion('destructiveChanges', {
              count: validation.destructiveChangeCount,
            }),
            className: validation.destructiveChangeCount === 0 ? undefined : 'text-warning',
          },
          {
            label: translatePromotion('approval'),
            value: translatePromotion(
              validation.isApprovalRequired ? 'approvalRequired' : 'approvalNotRequired',
            ),
          },
        ]}
      />
    </Panel>
  );
}

/** Configuration versions and promotion (UI/UX s. 13.5, Figma frame 29). */
export function PromotionPage() {
  const translatePromotion = useTranslations('admin.promotion');
  const { workspace } = useCurrentWorkspace();
  const listQuery = promotionQueries.useList(workspace.slug);
  const { selectedId, hrefFor } = useUrlSelection(
    'plan',
    listQuery.data?.map((promotion) => promotion.id),
  );
  const detailQuery = promotionQueries.useDetail(workspace.slug, selectedId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translatePromotion('title')}
        description={translatePromotion('description')}
        actions={
          <UnavailableAction
            label={translatePromotion('requestApproval')}
            reason={translatePromotion('requestApprovalUnavailable')}
          />
        }
      />
      <AdminAreaNavigation current="promotion" />
      <ListDetailContent
        listQuery={listQuery}
        detailQuery={detailQuery}
        selectedId={selectedId}
        sectionName={translatePromotion('title')}
        detailSectionName={translatePromotion('detailSectionName')}
        renderList={(promotions) => (
          <SelectableListPanel
            title={translatePromotion('plans')}
            emptyText={translatePromotion('empty')}
            selectedId={selectedId}
            hrefFor={hrefFor}
            items={promotions.map((promotion) => ({
              id: promotion.id,
              title: translatePromotion('planTitle', promotion),
              meta: translatePromotion('planMeta'),
            }))}
          />
        )}
        renderDetail={(promotion) => <DifferenceTree promotion={promotion} />}
        renderAside={(promotion) => <PromotionValidation promotion={promotion} />}
      />
    </div>
  );
}

'use client';

import { useLocale, useTranslations } from 'next-intl';

import { createListDetailQueries } from '@/lib/api/list-detail-queries';
import { formattingLocaleFor } from '@/lib/i18n/locales';
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
  notificationRuleDetailSchema,
  notificationRuleListSchema,
  type NotificationRuleDetail,
} from './routing-and-notification-model';

export const notificationRuleQueries = createListDetailQueries('policies/notification-rules', {
  list: notificationRuleListSchema,
  detail: notificationRuleDetailSchema,
});

function useListFormat() {
  const listFormat = new Intl.ListFormat(formattingLocaleFor(useLocale()), {
    type: 'conjunction',
  });
  return (items: readonly string[]) => listFormat.format(items);
}

function RuleConfiguration({ rule }: { rule: NotificationRuleDetail }) {
  const translateRules = useTranslations('notificationRules');
  const formatList = useListFormat();
  return (
    <Panel title={rule.name}>
      <BoxedFacts
        facts={[
          { label: translateRules('trigger'), value: rule.trigger },
          { label: translateRules('conditions'), value: rule.conditions },
          { label: translateRules('recipients'), value: formatList(rule.recipients) },
          { label: translateRules('channels'), value: formatList(rule.channels) },
          {
            label: translateRules('renotify'),
            value:
              rule.renotifyEveryMinutes === null
                ? translateRules('noRenotify')
                : translateRules('renotifyEvery', { minutes: rule.renotifyEveryMinutes }),
          },
          {
            label: translateRules('escalation'),
            value:
              rule.escalation === null
                ? translateRules('noEscalation')
                : translateRules('escalateTo', rule.escalation),
          },
        ]}
      />
    </Panel>
  );
}

/** Who will be contacted, how and when, before the rule is published (UI/UX s. 11.5). */
function DeliveryPreview({ rule }: { rule: NotificationRuleDetail }) {
  const translateRules = useTranslations('notificationRules');
  const formatList = useListFormat();
  return (
    <Panel title={translateRules('preview')}>
      <StackedFacts
        facts={[
          ...rule.deliveryPreview.map((delivery) => ({
            label: delivery.recipientName,
            value:
              delivery.afterMinutes === null
                ? formatList(delivery.channels)
                : translateRules('afterMinutes', {
                    channels: formatList(delivery.channels),
                    minutes: delivery.afterMinutes,
                  }),
          })),
          {
            label: translateRules('restrictedSafety'),
            value: translateRules(rule.isRestrictedSafe ? 'noDetailsLeak' : 'detailsMayLeak'),
            className: rule.isRestrictedSafe ? 'text-healthy' : 'text-critical',
          },
        ]}
      />
    </Panel>
  );
}

/** Notification rules (UI/UX s. 11.5, Figma frame 13). */
export function NotificationRulesPage() {
  const translateRules = useTranslations('notificationRules');
  const { workspace } = useCurrentWorkspace();
  const formatList = useListFormat();
  const listQuery = notificationRuleQueries.useList(workspace.slug);
  const { selectedId, hrefFor } = useUrlSelection(
    'rule',
    listQuery.data?.map((rule) => rule.id),
  );
  const detailQuery = notificationRuleQueries.useDetail(workspace.slug, selectedId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateRules('title')}
        description={translateRules('description')}
        actions={
          <UnavailableAction
            label={translateRules('newRule')}
            reason={translateRules('newRuleUnavailable')}
          />
        }
      />
      <PoliciesAreaNavigation current="notification-rules" />
      <ListDetailContent
        listQuery={listQuery}
        detailQuery={detailQuery}
        selectedId={selectedId}
        sectionName={translateRules('title')}
        detailSectionName={translateRules('detailSectionName')}
        renderList={(rules) => (
          <SelectableListPanel
            title={translateRules('listTitle')}
            emptyText={translateRules('empty')}
            selectedId={selectedId}
            hrefFor={hrefFor}
            items={rules.map((rule) => ({
              id: rule.id,
              title: rule.name,
              meta: rule.isEnabled
                ? translateRules('enabledWith', { channels: formatList(rule.channels) })
                : translateRules('disabled'),
            }))}
          />
        )}
        renderDetail={(rule) => <RuleConfiguration rule={rule} />}
        renderAside={(rule) => <DeliveryPreview rule={rule} />}
      />
    </div>
  );
}

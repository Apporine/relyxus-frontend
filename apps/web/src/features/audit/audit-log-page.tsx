'use client';

import { Banner, cn, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from '@relyxus/ui';
import { useQuery } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { requestApi } from '@/lib/api/http-client';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { formattingLocaleFor } from '@/lib/i18n/locales';
import { useTimeDisplay } from '@/lib/format/time-display';
import { DataTable } from '@/lib/ui/data-table';
import { Panel } from '@/lib/ui/panel';
import { QuerySection } from '@/lib/ui/query-section';
import { useSearchParamChoice } from '@/lib/ui/use-search-param-choice';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { auditEventCategories, auditLogPageSchema, type AuditEvent } from './model';

export const auditQueryKeys = {
  events: (workspaceSlug: string, category: string) =>
    ['workspaces', workspaceSlug, 'audit-events', category] as const,
};

export function useAuditEvents(workspaceSlug: string, category: string) {
  return useQuery({
    queryKey: auditQueryKeys.events(workspaceSlug, category),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `/workspaces/${encodeURIComponent(workspaceSlug)}/audit-events`,
          query: category === 'all' ? undefined : { category },
          responseSchema: auditLogPageSchema,
          signal,
        })
      ).data,
  });
}

function MaskedValue() {
  const translateAudit = useTranslations('audit');
  return (
    <span className="inline-flex items-center gap-1.5 text-fg-secondary">
      <Lock aria-hidden className="size-3.5" />
      {translateAudit('masked')}
    </span>
  );
}

/** Audit log (UI/UX s. 13.11, Figma frame 35): the immutable operational ledger. */
export function AuditLogPage() {
  const translateAudit = useTranslations('audit');
  const format = useRelyxusFormat();
  const { displayTimeZone } = useTimeDisplay();
  const locale = useLocale();
  const { workspace } = useCurrentWorkspace();
  const [category, selectCategory] = useSearchParamChoice('event', auditEventCategories, 'all');
  const eventsQuery = useAuditEvents(workspace.slug, category);
  // Ledger times keep milliseconds so the order of near-simultaneous events is visible.
  const preciseTimeFormat = new Intl.DateTimeFormat(formattingLocaleFor(locale), {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hourCycle: 'h23',
    timeZone: displayTimeZone,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={translateAudit('title')} description={translateAudit('description')} />
      <Tabs value={category} onValueChange={selectCategory} variant="contained">
        <TabsList aria-label={translateAudit('filterLabel')} className="flex-wrap self-start">
          {auditEventCategories.map((eventCategory) => (
            <TabsTrigger key={eventCategory} value={eventCategory}>
              {translateAudit(`categories.${eventCategory}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={category} className="flex flex-col gap-6">
          <QuerySection
            query={eventsQuery}
            sectionName={translateAudit('events')}
            loadingPlaceholder={<Skeleton className="h-96 w-full" />}
          >
            {(auditPage) => (
              <>
                {auditPage.chain.status === 'broken' ? (
                  <Banner
                    tone="danger"
                    title={translateAudit('chainBrokenTitle')}
                    description={translateAudit('chainBrokenDescription', {
                      time: format.dateAndTime(new Date(auditPage.chain.verifiedThroughAt)),
                    })}
                  />
                ) : null}
                <Panel title={translateAudit('events')}>
                  <p className="-mt-2 text-meta text-fg-secondary">
                    {translateAudit('maskingNote')}{' '}
                    {auditPage.chain.status === 'verified'
                      ? translateAudit('chainVerified', {
                          time: format.dateAndTime(new Date(auditPage.chain.verifiedThroughAt)),
                        })
                      : null}
                  </p>
                  <DataTable<AuditEvent>
                    caption={translateAudit('events')}
                    rows={auditPage.items}
                    getRowKey={(event) => event.id}
                    emptyText={translateAudit('empty')}
                    minWidthClassName="min-w-[60rem]"
                    columns={[
                      {
                        key: 'time',
                        header: translateAudit('columns.time'),
                        isRowHeader: true,
                        className: 'font-mono font-normal tabular-nums',
                        render: (event) => (
                          <time dateTime={event.occurredAt} dir="ltr">
                            {preciseTimeFormat.format(new Date(event.occurredAt))}
                          </time>
                        ),
                      },
                      {
                        key: 'event',
                        header: translateAudit('columns.event'),
                        render: (event) => (
                          <span dir="ltr" className="font-mono">
                            {event.eventType}
                          </span>
                        ),
                      },
                      {
                        key: 'actor',
                        header: translateAudit('columns.actor'),
                        render: (event) => (event.isMasked ? <MaskedValue /> : event.actorName),
                      },
                      {
                        key: 'target',
                        header: translateAudit('columns.target'),
                        render: (event) =>
                          event.isMasked ? (
                            <MaskedValue />
                          ) : (
                            <span dir="ltr" className="font-mono">
                              {event.targetReference}
                            </span>
                          ),
                      },
                      {
                        key: 'action',
                        header: translateAudit('columns.action'),
                        render: (event) => (event.isMasked ? <MaskedValue /> : event.action),
                      },
                      {
                        key: 'hash',
                        header: translateAudit('columns.hash'),
                        render: (event) => (
                          <span
                            className={cn(
                              'font-semibold',
                              event.hashStatus === 'verified' ? 'text-healthy' : 'text-critical',
                            )}
                          >
                            {translateAudit(`hashStatuses.${event.hashStatus}`)}
                          </span>
                        ),
                      },
                      {
                        key: 'siem',
                        header: translateAudit('columns.siem'),
                        render: (event) => (
                          <span
                            className={cn(
                              'font-semibold',
                              event.siemDelivery === 'delivered' && 'text-healthy',
                              event.siemDelivery === 'queued' && 'text-warning',
                              event.siemDelivery === 'failed' && 'text-critical',
                            )}
                          >
                            {translateAudit(`siemDeliveries.${event.siemDelivery}`)}
                          </span>
                        ),
                      },
                    ]}
                  />
                </Panel>
              </>
            )}
          </QuerySection>
        </TabsContent>
      </Tabs>
    </div>
  );
}

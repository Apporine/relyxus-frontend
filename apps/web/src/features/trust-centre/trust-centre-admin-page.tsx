'use client';

import { Skeleton } from '@relyxus/ui';
import type { Route } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { AdminAreaNavigation } from '@/features/admin/admin-area-navigation';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { DataTable } from '@/lib/ui/data-table';
import { Panel } from '@/lib/ui/panel';
import { QuerySection } from '@/lib/ui/query-section';
import { UnavailableAction } from '@/lib/ui/unavailable-action';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import type { TrustDocument } from './model';
import { useManagedTrustDocuments } from './queries';
import { TrustDocumentAction, TrustDocumentStatusLabel } from './trust-document-cells';

/** The Trust Centre as its maintainers see it (Figma frame 23), including internal documents. */
export function TrustCentreAdminPage() {
  const translateTrust = useTranslations('trustCentre');
  const format = useRelyxusFormat();
  const { workspace } = useCurrentWorkspace();
  const documentsQuery = useManagedTrustDocuments(workspace.slug);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateTrust('title')}
        description={translateTrust('description')}
        actions={
          <UnavailableAction
            label={translateTrust('publishDocument')}
            reason={translateTrust('publishDocumentUnavailable')}
          />
        }
      />
      <AdminAreaNavigation current="trust-centre" />
      <Panel
        title={translateTrust('documents')}
        action={
          <Link
            href={'/trust' as Route}
            className="text-table font-semibold underline underline-offset-2"
          >
            {translateTrust('viewPublicPage')}
          </Link>
        }
      >
        <p className="-mt-2 text-meta text-fg-secondary">
          {translateTrust('documentsDescription')}
        </p>
        <QuerySection
          query={documentsQuery}
          sectionName={translateTrust('documents')}
          loadingPlaceholder={<Skeleton className="h-80 w-full" />}
        >
          {(documents) => (
            <DataTable<TrustDocument>
              caption={translateTrust('documents')}
              rows={documents}
              getRowKey={(document) => document.id}
              emptyText={translateTrust('empty')}
              columns={[
                {
                  key: 'document',
                  header: translateTrust('columns.document'),
                  isRowHeader: true,
                  render: (document) => document.title,
                },
                {
                  key: 'version',
                  header: translateTrust('columns.version'),
                  render: (document) => document.version,
                },
                {
                  key: 'status',
                  header: translateTrust('columns.status'),
                  render: (document) => <TrustDocumentStatusLabel status={document.status} />,
                },
                {
                  key: 'audience',
                  header: translateTrust('columns.audience'),
                  render: (document) => translateTrust(`audiences.${document.audience}`),
                },
                {
                  key: 'updated',
                  header: translateTrust('columns.updated'),
                  render: (document) => format.dateAndTime(new Date(document.updatedAt)),
                },
                {
                  key: 'action',
                  header: translateTrust('columns.buyerAction'),
                  render: (document) =>
                    document.audience === 'internal' ? (
                      <span className="text-fg-secondary">{translateTrust('internalOnly')}</span>
                    ) : (
                      <TrustDocumentAction document={document} />
                    ),
                },
              ]}
            />
          )}
        </QuerySection>
      </Panel>
    </div>
  );
}

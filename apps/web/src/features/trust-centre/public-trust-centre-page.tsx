'use client';

import { Skeleton } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { PageLoadFailedState } from '@/lib/ui/page-states';
import { Panel } from '@/lib/ui/panel';

import { trustDocumentCategories, type TrustDocument } from './model';
import { usePublicTrustDocuments } from './queries';
import { TrustDocumentAction, TrustDocumentStatusLabel } from './trust-document-cells';

/** Current material first; superseded and expired versions stay listed for the record. */
function documentsInDisplayOrder(documents: readonly TrustDocument[]): TrustDocument[] {
  return documents.toSorted(
    (first, second) =>
      Number(first.status !== 'current') - Number(second.status !== 'current') ||
      first.title.localeCompare(second.title),
  );
}

/**
 * The public Trust Centre (UI/UX s. 12.8): a buyer self-serves current assurance material
 * without emailing anyone. Internal documents are never sent to this page.
 */
export function PublicTrustCentrePage() {
  const translateTrust = useTranslations('trustCentre');
  const format = useRelyxusFormat();
  const documentsQuery = usePublicTrustDocuments();

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-6 bg-canvas px-4 py-10 tablet:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-panel-title font-semibold">Relyxus</p>
        <h1 className="text-page-title font-semibold">{translateTrust('publicTitle')}</h1>
        <p className="text-body text-fg-secondary">{translateTrust('publicDescription')}</p>
      </header>
      {documentsQuery.isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : documentsQuery.isError ? (
        <PageLoadFailedState
          error={documentsQuery.error}
          sectionName={translateTrust('publicTitle')}
          onRetry={() => void documentsQuery.refetch()}
        />
      ) : (
        trustDocumentCategories
          .map((category) => ({
            category,
            documents: documentsInDisplayOrder(
              documentsQuery.data.filter((document) => document.category === category),
            ),
          }))
          .filter(({ documents }) => documents.length > 0)
          .map(({ category, documents }) => (
            <Panel key={category} title={translateTrust(`categories.${category}`)}>
              <ul className="flex flex-col divide-y divide-divider">
                {documents.map((document) => (
                  <li
                    key={document.id}
                    className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="flex flex-col gap-0.5">
                      <span className="text-body font-semibold">{document.title}</span>
                      <span className="text-meta text-fg-secondary">
                        {translateTrust('documentMeta', {
                          version: document.version,
                          audience: translateTrust(`audiences.${document.audience}`),
                          updated: format.dateAndTime(new Date(document.updatedAt)),
                        })}{' '}
                        · <TrustDocumentStatusLabel status={document.status} />
                      </span>
                    </span>
                    <TrustDocumentAction document={document} />
                  </li>
                ))}
              </ul>
            </Panel>
          ))
      )}
    </main>
  );
}

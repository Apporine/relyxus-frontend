'use client';

import { Button, CodeBlock, Skeleton } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { QuerySection } from '@/lib/ui/query-section';

import type { EvidenceDetail } from './model';

function EvidenceDetailContent({ detail }: { detail: EvidenceDetail }) {
  const translateDetail = useTranslations('evidenceExplorer.detail');
  const translateIntegrity = useTranslations('evidenceExplorer.integrity');
  const format = useRelyxusFormat();

  const capturedAtText = translateDetail('capturedAt', {
    time: format.timeOfDay(new Date(detail.capturedAt), { includeSeconds: true }),
  });

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-meta font-semibold text-fg-secondary">{detail.sourceName}</p>
          <h2
            id="evidence-detail-heading"
            className="text-section-title font-semibold text-fg-primary"
          >
            {translateDetail('heading')}
          </h2>
          <p className="text-meta text-fg-tertiary">{capturedAtText}</p>
        </div>
        <span className="text-meta font-semibold text-healthy uppercase">
          {translateIntegrity(detail.integrity)}
        </span>
      </header>

      {detail.query === null ? null : (
        <section className="flex flex-col gap-2">
          <h3 className="text-meta font-semibold text-fg-secondary uppercase">
            {translateDetail('query')}
          </h3>
          <CodeBlock code={detail.query} label={translateDetail('query')} />
        </section>
      )}

      {detail.result === null ? null : (
        <section className="flex flex-col gap-2">
          <h3 className="text-meta font-semibold text-fg-secondary uppercase">
            {translateDetail('result')}
          </h3>
          <CodeBlock code={detail.result} label={translateDetail('result')} />
        </section>
      )}

      {detail.integrityDetail === null ? null : (
        <section className="flex flex-col gap-1">
          <h3 className="text-meta font-semibold text-fg-secondary uppercase">
            {translateDetail('integrityHeading')}
          </h3>
          <p className="text-body text-healthy">{detail.integrityDetail}</p>
          {detail.redactionNotice === null ? null : (
            <p className="text-meta text-fg-secondary">
              {translateDetail('redaction', { notice: detail.redactionNotice })}
            </p>
          )}
        </section>
      )}

      {detail.sourceUrl === null ? null : (
        <Button asChild variant="secondary">
          <a href={detail.sourceUrl} target="_blank" rel="noreferrer">
            {translateDetail('openInSource')}
            <ExternalLink aria-hidden className="size-4" />
          </a>
        </Button>
      )}

      <p className="text-meta text-fg-tertiary">{translateDetail('aiSeparationNotice')}</p>
    </div>
  );
}

/** Raw source evidence for the right column (Figma frame 07). */
export function EvidenceDetailPanel({
  detailQuery,
}: {
  detailQuery: UseQueryResult<EvidenceDetail>;
}) {
  const translateDetail = useTranslations('evidenceExplorer.detail');

  return (
    <section
      aria-labelledby="evidence-detail-heading"
      className="rounded-panel border border-control bg-surface-1 p-5"
    >
      <QuerySection
        query={detailQuery}
        sectionName={translateDetail('heading')}
        loadingPlaceholder={<Skeleton className="h-96 w-full" />}
      >
        {(detail) => <EvidenceDetailContent detail={detail} />}
      </QuerySection>
    </section>
  );
}

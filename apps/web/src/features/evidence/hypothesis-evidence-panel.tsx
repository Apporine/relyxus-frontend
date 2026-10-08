'use client';

import { confidenceBands, HypothesisCard, Skeleton } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { Investigation } from '@/features/war-room/model';
import { QuerySection } from '@/lib/ui/query-section';

import type { EvidenceSummary } from './model';

function useConfidenceBandLabels() {
  const translateBands = useTranslations('domain.confidenceBands');
  return Object.fromEntries(confidenceBands.map((band) => [band, translateBands(band)])) as Record<
    (typeof confidenceBands)[number],
    string
  >;
}

function HypothesisLinkCard({ summary, sourceName }: { summary: string; sourceName: string }) {
  return (
    <article className="flex flex-col gap-1 rounded-panel border border-control bg-surface-2 px-3 py-3">
      <p className="text-table text-fg-primary">{summary}</p>
      <p className="text-meta text-fg-tertiary">{sourceName}</p>
    </article>
  );
}

/** Hypothesis context with supporting and refuting links (Figma frame 07 centre column). */
export function HypothesisEvidencePanel({
  investigationQuery,
  hypothesisId,
  filteredItems,
}: {
  investigationQuery: UseQueryResult<Investigation>;
  hypothesisId: string | null;
  filteredItems: EvidenceSummary[];
}) {
  const translateHypothesis = useTranslations('evidenceExplorer.hypothesis');
  const translateInvestigation = useTranslations('warRoom.investigation');
  const confidenceBandLabels = useConfidenceBandLabels();

  return (
    <QuerySection
      query={investigationQuery}
      sectionName={translateHypothesis('heading')}
      loadingPlaceholder={<Skeleton className="h-96 w-full" />}
    >
      {(investigation) => {
        const activeHypothesisId =
          hypothesisId ??
          investigation.hypotheses.toSorted((first, second) => first.rank - second.rank)[0]?.id ??
          null;
        const hypothesis = investigation.hypotheses.find(
          (entry) => entry.id === activeHypothesisId,
        );

        if (hypothesis === undefined) {
          return (
            <p className="text-body text-fg-secondary">{translateHypothesis('noHypothesis')}</p>
          );
        }

        const verdictProps =
          hypothesis.status === 'ruled-out'
            ? { status: 'ruled-out' as const, ruledOutReason: hypothesis.ruledOutReason }
            : { status: hypothesis.status };

        const supporting = filteredItems.flatMap((item) =>
          item.hypothesisLinks
            .filter((link) => link.hypothesisId === hypothesis.id && link.role === 'supporting')
            .map((link) => ({ summary: link.summary, sourceName: item.sourceName })),
        );
        const refuting = filteredItems.flatMap((item) =>
          item.hypothesisLinks
            .filter((link) => link.hypothesisId === hypothesis.id && link.role === 'refuting')
            .map((link) => ({ summary: link.summary, sourceName: item.sourceName })),
        );

        return (
          <div className="flex flex-col gap-5">
            <HypothesisCard
              {...verdictProps}
              rank={hypothesis.rank}
              cause={hypothesis.cause}
              confidencePercent={hypothesis.confidencePercent}
              confidenceBandLabels={confidenceBandLabels}
              statusLabel={translateInvestigation(`hypothesisStatuses.${hypothesis.status}`)}
              supportingEvidence={{
                count: hypothesis.supportingEvidenceCount,
                label: translateInvestigation('supportingEvidence'),
              }}
              refutingEvidence={{
                count: hypothesis.refutingEvidenceCount,
                label: translateInvestigation('refutingEvidence'),
              }}
            />

            <div className="grid gap-4 tablet:grid-cols-2">
              <section className="flex flex-col gap-2">
                <h3 className="text-meta font-semibold text-healthy uppercase">
                  {translateHypothesis('supporting')}
                </h3>
                {supporting.length === 0 ? (
                  <p className="text-meta text-fg-secondary">{translateHypothesis('noLinks')}</p>
                ) : (
                  supporting.map((link, index) => (
                    <HypothesisLinkCard key={`${link.summary}-${index}`} {...link} />
                  ))
                )}
              </section>
              <section className="flex flex-col gap-2">
                <h3 className="text-meta font-semibold text-critical uppercase">
                  {translateHypothesis('refuting')}
                </h3>
                {refuting.length === 0 ? (
                  <p className="text-meta text-fg-secondary">{translateHypothesis('noLinks')}</p>
                ) : (
                  refuting.map((link, index) => (
                    <HypothesisLinkCard key={`${link.summary}-${index}`} {...link} />
                  ))
                )}
              </section>
            </div>

            {hypothesis.whatWasChecked === null ? null : (
              <section className="flex flex-col gap-2">
                <h3 className="text-table font-semibold text-fg-secondary">
                  {translateHypothesis('whatWasChecked')}
                </h3>
                <ul className="flex flex-col gap-1 text-body text-fg-primary">
                  {hypothesis.whatWasChecked
                    .split(/[.;]/)
                    .filter(Boolean)
                    .map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-healthy" />
                        {item.trim()}
                      </li>
                    ))}
                </ul>
              </section>
            )}
          </div>
        );
      }}
    </QuerySection>
  );
}

'use client';

import { AiMarker, Banner, confidenceBands, HypothesisCard, Skeleton } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { incidentEvidenceHref } from '@/features/incidents/routes';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { Panel } from '@/lib/ui/panel';
import { QuerySection } from '@/lib/ui/query-section';

import type { Hypothesis, Investigation } from './model';

function useConfidenceBandLabels() {
  const translateBands = useTranslations('domain.confidenceBands');
  return Object.fromEntries(confidenceBands.map((band) => [band, translateBands(band)])) as Record<
    (typeof confidenceBands)[number],
    string
  >;
}

type IncidentLocation = { workspaceSlug: string; incidentReference: string };

function RankedHypothesis({
  hypothesis,
  incidentLocation,
}: {
  hypothesis: Hypothesis;
  incidentLocation: IncidentLocation;
}) {
  const translateInvestigation = useTranslations('warRoom.investigation');
  const confidenceBandLabels = useConfidenceBandLabels();
  const verdictProps =
    hypothesis.status === 'ruled-out'
      ? { status: 'ruled-out' as const, ruledOutReason: hypothesis.ruledOutReason }
      : { status: hypothesis.status };

  return (
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
      whatWasChecked={
        hypothesis.whatWasChecked === null
          ? undefined
          : {
              heading: translateInvestigation('whatWasChecked'),
              summary: hypothesis.whatWasChecked,
            }
      }
      actions={
        <Link
          href={incidentEvidenceHref(
            incidentLocation.workspaceSlug,
            incidentLocation.incidentReference,
            {
              hypothesisId: hypothesis.id,
            },
          )}
          className="ms-auto inline-flex items-center gap-1.5 font-semibold text-fg-primary hover:underline"
        >
          {translateInvestigation('openEvidence')}
          <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </Link>
      }
    />
  );
}

function InvestigationContent({
  investigation,
  incidentLocation,
}: {
  investigation: Investigation;
  incidentLocation: IncidentLocation;
}) {
  const translateInvestigation = useTranslations('warRoom.investigation');
  const format = useRelyxusFormat();
  const { summary, hypotheses, degradedSources, status } = investigation;

  return (
    <div className="flex flex-col gap-5">
      {status === 'reasoning-paused' ? (
        <Banner tone="warning" title={translateInvestigation('paused')} />
      ) : null}
      {degradedSources.map((source) => (
        <Banner
          key={source.connectorName}
          tone="warning"
          title={translateInvestigation('degradedSource', {
            connector: source.connectorName,
            time: format.timeOfDay(new Date(source.degradedSince)),
          })}
        />
      ))}

      {summary === null ? (
        <p role="status" className="text-body text-fg-secondary">
          {translateInvestigation('investigating')}
        </p>
      ) : (
        <section
          aria-labelledby="current-assessment-heading"
          className="flex flex-col gap-2 rounded-panel border border-divider bg-surface-2 p-4"
        >
          <h3
            id="current-assessment-heading"
            className="text-meta font-semibold text-fg-secondary uppercase"
          >
            {translateInvestigation('currentAssessment')}
          </h3>
          <p className="text-body text-fg-primary">{summary.text}</p>
          <p className="text-meta text-fg-tertiary">
            {translateInvestigation('provenance', {
              model: summary.modelRoute,
              time: format.timeOfDay(new Date(summary.generatedAt), { includeSeconds: true }),
              count: summary.evidenceCount,
            })}
          </p>
        </section>
      )}

      <section aria-labelledby="ranked-hypotheses-heading" className="flex flex-col gap-3">
        <h3 id="ranked-hypotheses-heading" className="text-panel-title font-semibold">
          {translateInvestigation('rankedHypotheses')}
        </h3>
        {hypotheses.length === 0 ? (
          <p className="text-body text-fg-secondary">{translateInvestigation('noHypotheses')}</p>
        ) : (
          hypotheses
            .toSorted((first, second) => first.rank - second.rank)
            .map((hypothesis) => (
              <RankedHypothesis
                key={hypothesis.id}
                hypothesis={hypothesis}
                incidentLocation={incidentLocation}
              />
            ))
        )}
      </section>
    </div>
  );
}

/**
 * The AI investigation (UI/UX s. 10.4 centre panel). AI-written text carries the AI marker
 * and its provenance; every hypothesis leads to its evidence; low confidence shows what was
 * checked instead of a guess (Product s. 4 and 9).
 */
export function InvestigationPanel({
  workspaceSlug,
  incidentReference,
  query,
}: {
  workspaceSlug: string;
  incidentReference: string;
  query: UseQueryResult<Investigation>;
}) {
  const translatePanels = useTranslations('warRoom.panels');
  const translateInvestigation = useTranslations('warRoom.investigation');
  const summary = query.data?.summary;

  return (
    <Panel
      title={translatePanels('investigation')}
      action={
        summary ? (
          <AiMarker label={translateInvestigation('aiGenerated')} details={summary.modelRoute} />
        ) : null
      }
    >
      <QuerySection
        query={query}
        sectionName={translatePanels('investigation')}
        loadingPlaceholder={
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        }
      >
        {(investigation) => (
          <InvestigationContent
            investigation={investigation}
            incidentLocation={{ workspaceSlug, incidentReference }}
          />
        )}
      </QuerySection>
    </Panel>
  );
}

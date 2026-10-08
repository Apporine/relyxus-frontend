import type {
  EvidenceDetail,
  EvidenceHypothesisLink,
  EvidenceSummary,
} from '@/features/evidence/model';

import { warRoomFixtureFor } from './war-room-fixtures';

/*
 * DEVELOPMENT FIXTURE. Evidence for the Payments / UK demo workspace (Figma frame 07).
 * INC-2041 carries the full explorer dataset; other incidents get an empty list.
 */

const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_SECOND = 1_000;

type EvidenceDetailFields = {
  query: string | null;
  result: string | null;
  integrityDetail: string | null;
  redactionNotice: string | null;
  sourceUrl: string | null;
  hypothesisLinks: EvidenceHypothesisLink[];
};

type EvidenceSeed = Omit<EvidenceSummary, 'linkedHypothesisIds' | 'hypothesisLinks'> & {
  detail: EvidenceDetailFields;
};

function linkedHypothesisIds(links: EvidenceHypothesisLink[]): string[] {
  return [...new Set(links.map((link) => link.hypothesisId))];
}

function figmaEvidenceSeeds(startedAtMs: number): EvidenceSeed[] {
  const at = (minutesAfterStart: number, secondsAfterStart = 0) =>
    new Date(
      startedAtMs +
        minutesAfterStart * MILLISECONDS_PER_MINUTE +
        secondsAfterStart * MILLISECONDS_PER_SECOND,
    ).toISOString();

  return [
    {
      id: 'evidence-prometheus-5xx',
      sourceName: 'Prometheus',
      sourceHealth: 'degraded',
      title: '5xx rate spike',
      capturedAt: at(0, 31),
      freshness: 'fresh',
      staleDurationSeconds: null,
      integrity: 'verified',
      detail: {
        query: `sum(rate(http_requests_total{
service="payments-api",
status=~"5.."}[5m]))`,
        result: `12:02  0.8%
12:03  1.1%
12:04  22.4%
12:05  24.1%
12:06  23.7%`,
        integrityDetail: 'SHA256 verified',
        redactionNotice: null,
        sourceUrl: 'https://prometheus.example/query',
        hypothesisLinks: [
          {
            hypothesisId: 'hypothesis-config-regression',
            role: 'supporting',
            summary: 'Healthy comparison service unchanged',
          },
          {
            hypothesisId: 'hypothesis-db-pool',
            role: 'refuting',
            summary: 'Error rate rose before pool saturation signals',
          },
        ],
      },
    },
    {
      id: 'evidence-servicenow-chg',
      sourceName: 'ServiceNow',
      sourceHealth: null,
      title: 'CHG-88421 rollout',
      capturedAt: at(-3, 19),
      freshness: 'fresh',
      staleDurationSeconds: null,
      integrity: 'verified',
      detail: {
        query: 'CHG-88421',
        result: 'Rollout to payments-api revision 185 completed at 12:01 UTC.',
        integrityDetail: 'SHA256 verified',
        redactionNotice: null,
        sourceUrl: 'https://servicenow.example/change/CHG-88421',
        hypothesisLinks: [
          {
            hypothesisId: 'hypothesis-config-regression',
            role: 'supporting',
            summary: 'Rollout precedes failure by 3m',
          },
        ],
      },
    },
    {
      id: 'evidence-loki-config',
      sourceName: 'Grafana Loki',
      sourceHealth: null,
      title: 'Config loaded on 3 pods',
      capturedAt: at(-2, 57),
      freshness: 'fresh',
      staleDurationSeconds: null,
      integrity: 'verified',
      detail: {
        query: '{app="payments-api"} |= "config loaded"',
        result: '3 pods loaded revision 185 between 12:01:20 and 12:01:34 UTC.',
        integrityDetail: 'SHA256 verified',
        redactionNotice: null,
        sourceUrl: null,
        hypothesisLinks: [
          {
            hypothesisId: 'hypothesis-config-regression',
            role: 'supporting',
            summary: 'All failing pods on revision 185',
          },
          {
            hypothesisId: 'hypothesis-config-regression',
            role: 'supporting',
            summary: 'Error signature matches config path',
          },
          {
            hypothesisId: 'hypothesis-db-pool',
            role: 'refuting',
            summary: 'One request class failed before rollout',
          },
        ],
      },
    },
    {
      id: 'evidence-postgres-locks',
      sourceName: 'PostgreSQL',
      sourceHealth: null,
      title: 'No lock contention',
      capturedAt: at(1, 16),
      freshness: 'fresh',
      staleDurationSeconds: null,
      integrity: 'verified',
      detail: {
        query: 'SELECT * FROM pg_locks WHERE granted = false;',
        result: '0 rows',
        integrityDetail: 'SHA256 verified',
        redactionNotice: 'Sensitive connection strings were redacted before storage.',
        sourceUrl: null,
        hypothesisLinks: [
          {
            hypothesisId: 'hypothesis-db-pool',
            role: 'refuting',
            summary: 'No lock waits during the incident window',
          },
        ],
      },
    },
    {
      id: 'evidence-network-packet-loss',
      sourceName: 'Network',
      sourceHealth: 'degraded',
      title: 'No regional packet loss',
      capturedAt: at(1, 48),
      freshness: 'stale',
      staleDurationSeconds: 120,
      integrity: 'verified',
      detail: {
        query: 'packet_loss_percent{region="eu-west-2"}',
        result: '0.01% average over 5 minutes',
        integrityDetail: 'SHA256 verified',
        redactionNotice: null,
        sourceUrl: null,
        hypothesisLinks: [
          {
            hypothesisId: 'hypothesis-db-pool',
            role: 'refuting',
            summary: 'Regional packet loss within normal bounds',
          },
        ],
      },
    },
  ];
}

function toSummary(seed: EvidenceSeed): EvidenceSummary {
  return {
    id: seed.id,
    sourceName: seed.sourceName,
    sourceHealth: seed.sourceHealth,
    title: seed.title,
    capturedAt: seed.capturedAt,
    freshness: seed.freshness,
    staleDurationSeconds: seed.staleDurationSeconds,
    integrity: seed.integrity,
    hypothesisLinks: seed.detail.hypothesisLinks,
    linkedHypothesisIds: linkedHypothesisIds(seed.detail.hypothesisLinks),
  };
}

function toDetail(seed: EvidenceSeed): EvidenceDetail {
  const summary = toSummary(seed);
  return { ...summary, ...seed.detail };
}

function seedsFor(workspaceSlug: string, incidentReference: string): EvidenceSeed[] | null {
  const warRoom = warRoomFixtureFor(workspaceSlug, incidentReference);
  if (warRoom === null) {
    return null;
  }
  if (incidentReference !== 'INC-2041') {
    return [];
  }
  return figmaEvidenceSeeds(Date.parse(warRoom.incident.impactStartedAt));
}

export function evidenceSummariesFor(
  workspaceSlug: string,
  incidentReference: string,
): EvidenceSummary[] | null {
  const seeds = seedsFor(workspaceSlug, incidentReference);
  return seeds === null ? null : seeds.map(toSummary);
}

export function evidenceDetailFor(
  workspaceSlug: string,
  incidentReference: string,
  evidenceId: string,
): EvidenceDetail | null {
  const seed = seedsFor(workspaceSlug, incidentReference)?.find((entry) => entry.id === evidenceId);
  return seed === undefined ? null : toDetail(seed);
}

/** Distinct source names for filter pills on the explorer. */
export function evidenceSourcesFor(workspaceSlug: string, incidentReference: string): string[] {
  const summaries = evidenceSummariesFor(workspaceSlug, incidentReference);
  if (summaries === null) {
    return [];
  }
  return [...new Set(summaries.map((item) => item.sourceName))].sort();
}

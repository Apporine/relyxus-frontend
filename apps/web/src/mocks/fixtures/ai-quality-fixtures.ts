import type {
  ModelRoute,
  ReplayIncident,
  ReplayOutcome,
  ReplayRunDetail,
  ReplayRunSummary,
  Scorecard,
} from '@/features/ai-quality/model';

/*
 * DEVELOPMENT FIXTURE. Replay and AI quality for the Payments / UK demo workspace (Figma
 * frame 15). The fallback route shows a calibration regression and the pinned primary
 * version has a retirement date, so two of the UI/UX s. 11.7 states appear in the demo.
 */

const DEMO_WORKSPACE_SLUG = 'payments-uk';
const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_DAY = 24 * 60 * MILLISECONDS_PER_MINUTE;
const BASELINE_RUN_ID = 'replay-october-baseline';
const FALLBACK_RUN_ID = 'replay-fallback-september';

const minutesFromNow = (minutes: number) =>
  new Date(Date.now() + minutes * MILLISECONDS_PER_MINUTE).toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * MILLISECONDS_PER_DAY).toISOString();
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * MILLISECONDS_PER_DAY).toISOString();

function scorecardFixture(): Scorecard {
  return {
    windowDays: 30,
    incidentsScored: 42,
    minimumIncidents: 30,
    correctFirst: { percent: 72, changePoints: 4.2 },
    topThree: { percent: 87, changePoints: 1.1 },
    medianTimeToFirstHypothesisSeconds: 161,
    missCount: 19,
    regression: {
      metric: 'calibration',
      dropPoints: 3.1,
      tolerancePoints: 2,
      routeName: 'Bedrock model A',
    },
    calibration: [
      { predictedPercent: 15, actualPercent: 12, sampleSize: 24 },
      { predictedPercent: 35, actualPercent: 31, sampleSize: 40 },
      { predictedPercent: 55, actualPercent: 49, sampleSize: 62 },
      { predictedPercent: 75, actualPercent: 70, sampleSize: 81 },
      { predictedPercent: 90, actualPercent: 84, sampleSize: 57 },
    ],
    misses: {
      type: [
        { label: 'Configuration', count: 7 },
        { label: 'Dependency', count: 5 },
        { label: 'Capacity', count: 4 },
        { label: 'Network', count: 2 },
        { label: 'Unknown', count: 1 },
      ],
      service: [
        { label: 'payments-api', count: 6 },
        { label: 'settlement-worker', count: 5 },
        { label: 'customer-auth', count: 4 },
        { label: 'card-router', count: 3 },
        { label: 'ledger-sync', count: 1 },
      ],
      model: [
        { label: 'Claude Enterprise', count: 8 },
        { label: 'Bedrock model A', count: 7 },
        { label: 'Candidate B', count: 4 },
      ],
    },
  };
}

function modelRouteFixtures(): ModelRoute[] {
  return [
    {
      id: 'route-primary',
      role: 'primary',
      name: 'Claude Enterprise',
      modelVersion: 'enterprise-reasoning-2026-06',
      isPinned: true,
      region: 'UK',
      residency: 'UK only',
      isResidencyCompatible: true,
      status: 'approved',
      retiresAt: daysFromNow(120),
      lastReplayAt: daysAgo(2),
      accuracyPercent: 74,
      approval: {
        approvedByName: 'Priya Nair',
        approvedAt: daysAgo(2),
        replayRunId: BASELINE_RUN_ID,
      },
    },
    {
      id: 'route-fallback',
      role: 'fallback',
      name: 'Bedrock model A',
      modelVersion: 'bedrock-model-a-v3',
      isPinned: false,
      region: 'UK',
      residency: 'UK only',
      isResidencyCompatible: true,
      status: 'approved',
      retiresAt: null,
      lastReplayAt: daysAgo(2),
      accuracyPercent: 71,
      approval: {
        approvedByName: 'Priya Nair',
        approvedAt: daysAgo(31),
        replayRunId: FALLBACK_RUN_ID,
      },
    },
    {
      id: 'route-shadow',
      role: 'shadow',
      name: 'Candidate B',
      modelVersion: 'candidate-b-2026-09',
      isPinned: false,
      region: 'EU',
      residency: 'EU only',
      isResidencyCompatible: false,
      status: 'shadow',
      retiresAt: null,
      lastReplayAt: daysAgo(3),
      accuracyPercent: 76,
      approval: null,
    },
    {
      id: 'route-legacy',
      role: 'legacy',
      name: 'Legacy route',
      modelVersion: 'legacy-global-v1',
      isPinned: false,
      region: 'Global',
      residency: 'Not allowed',
      isResidencyCompatible: false,
      status: 'deprecated',
      retiresAt: null,
      lastReplayAt: daysAgo(8),
      accuracyPercent: 68,
      approval: null,
    },
  ];
}

const incidentTemplates = [
  {
    title: 'Card authorisation failures after config rollout',
    actualCause: 'Configuration regression in payments-api routing rules',
    topHypothesis: 'Configuration regression in payments-api routing rules',
  },
  {
    title: 'Settlement queue lag',
    actualCause: 'Database connection pool exhausted on postgres-pay',
    topHypothesis: 'Database connection pool exhausted on postgres-pay',
  },
  {
    title: 'Identity provider elevated latency',
    actualCause: 'Certificate rotation stalled token validation',
    topHypothesis: 'Regional network packet loss',
  },
  {
    title: 'Merchant webhook delay',
    actualCause: 'Message broker partition rebalance',
    topHypothesis: 'Message broker partition rebalance',
  },
] as const;

type ReplayOutcomeCounts = { incidents: number; correctFirst: number; topThree: number };

function outcomeForIndex(index: number, counts: ReplayOutcomeCounts): ReplayOutcome {
  if (index < counts.correctFirst) {
    return 'correct-first';
  }
  return index < counts.correctFirst + counts.topThree ? 'top-three' : 'missed';
}

/** Scored incidents whose outcomes add up to the run's rates. */
function replayIncidents(counts: ReplayOutcomeCounts): ReplayIncident[] {
  return Array.from({ length: counts.incidents }, (_, index) => {
    const template = incidentTemplates[index % incidentTemplates.length] ?? incidentTemplates[0];
    const outcome = outcomeForIndex(index, counts);
    const isMissed = outcome === 'missed';
    return {
      incidentReference: `INC-${1900 + index}`,
      incidentTitle: template.title,
      outcome,
      actualCause: template.actualCause,
      topHypothesis: isMissed ? 'Regional network packet loss' : template.topHypothesis,
      topHypothesisConfidencePercent: isMissed ? 41 : 78,
      missReason: isMissed
        ? 'The certificate store was not connected, so the evidence that pointed to the cause was never available.'
        : null,
      evidenceCutoffAt: daysAgo(90 - index),
      decisionTrace: [
        {
          step: 1,
          summary: 'Collected alerts, deploys and configuration changes up to the time fence.',
        },
        { step: 2, summary: 'Ranked hypotheses by supporting and refuting evidence.' },
        {
          step: 3,
          summary: isMissed
            ? 'Stopped at low confidence and listed what was checked.'
            : 'Confirmed the leading hypothesis against the change history.',
        },
      ],
    };
  });
}

function replayRunFixtures(): ReplayRunDetail[] {
  return [
    {
      id: BASELINE_RUN_ID,
      name: 'October baseline',
      status: 'completed',
      routeName: 'Claude Enterprise',
      incidentsTested: 42,
      startedAt: daysAgo(3),
      progressPercent: null,
      estimatedCompletionAt: null,
      results: {
        correctFirstPercent: 72,
        topThreePercent: 87,
        minutesSavedPerIncident: 31,
        completedAt: daysAgo(2),
      },
      modelVersion: 'enterprise-reasoning-2026-06',
      promptVersion: 'diagnosis-prompt-v14',
      // 30 correct first and 7 more in the top three: 72% and 87%, as on the scorecard.
      incidents: replayIncidents({ incidents: 42, correctFirst: 30, topThree: 7 }),
    },
    {
      id: FALLBACK_RUN_ID,
      name: 'September fallback check',
      status: 'completed',
      routeName: 'Bedrock model A',
      incidentsTested: 38,
      startedAt: daysAgo(32),
      progressPercent: null,
      estimatedCompletionAt: null,
      results: {
        correctFirstPercent: 69,
        topThreePercent: 84,
        minutesSavedPerIncident: 27,
        completedAt: daysAgo(31),
      },
      modelVersion: 'bedrock-model-a-v3',
      promptVersion: 'diagnosis-prompt-v13',
      incidents: replayIncidents({ incidents: 38, correctFirst: 26, topThree: 6 }),
    },
    {
      id: 'replay-candidate-b',
      name: 'Candidate B evaluation',
      status: 'running',
      routeName: 'Candidate B',
      incidentsTested: 42,
      startedAt: daysAgo(0),
      progressPercent: 64,
      estimatedCompletionAt: minutesFromNow(40),
      results: null,
      modelVersion: 'candidate-b-2026-09',
      promptVersion: 'diagnosis-prompt-v14',
      incidents: [],
    },
  ];
}

function isDemoWorkspace(workspaceSlug: string): boolean {
  return workspaceSlug === DEMO_WORKSPACE_SLUG;
}

export function scorecardFor(workspaceSlug: string): Scorecard | null {
  return isDemoWorkspace(workspaceSlug) ? scorecardFixture() : null;
}

export function modelRoutesFor(workspaceSlug: string): ModelRoute[] {
  return isDemoWorkspace(workspaceSlug) ? modelRouteFixtures() : [];
}

export function replayRunsFor(workspaceSlug: string): ReplayRunSummary[] {
  if (!isDemoWorkspace(workspaceSlug)) {
    return [];
  }
  return replayRunFixtures().map((run) => ({
    id: run.id,
    name: run.name,
    status: run.status,
    routeName: run.routeName,
    incidentsTested: run.incidentsTested,
    startedAt: run.startedAt,
    progressPercent: run.progressPercent,
    estimatedCompletionAt: run.estimatedCompletionAt,
    results: run.results,
  }));
}

export function replayRunDetailFor(workspaceSlug: string, runId: string): ReplayRunDetail | null {
  if (!isDemoWorkspace(workspaceSlug)) {
    return null;
  }
  return replayRunFixtures().find((run) => run.id === runId) ?? null;
}

import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ModelRoute, Scorecard } from '@/features/ai-quality/model';
import { LiveUpdatesProvider } from '@/lib/live/live-updates-provider';
import {
  modelRoutesFor,
  replayRunDetailFor,
  replayRunsFor,
  scorecardFor,
} from '@/mocks/fixtures/ai-quality-fixtures';
import { navigationState, nextNavigationMock } from '@/test/next-navigation-mock';
import { renderInWorkspace } from '@/test/render-in-workspace';
import { OpeningWebSocketStub, stubApi } from '@/test/stub-api';

import { AiQualityPage } from './ai-quality-page';
import { ReplayRunPage } from './replay-run-page';

vi.mock('next/navigation', () => nextNavigationMock);
// ECharts measures text on a canvas, which jsdom lacks; the chart option has its own unit
// test, so pages render a stand-in with the same accessible name.
vi.mock('@/lib/charts/echart', () => ({
  EChart: ({ label }: { label: string }) => <div role="img" aria-label={label} />,
}));

const WORKSPACE_SLUG = 'payments-uk';
const WORKSPACE_PATH = `/api/v1/workspaces/${WORKSPACE_SLUG}`;

function demoScorecard(): Scorecard {
  const scorecard = scorecardFor(WORKSPACE_SLUG);
  if (scorecard === null) {
    throw new Error('The demo workspace must have a scorecard fixture.');
  }
  return scorecard;
}

function stubAiQuality({
  scorecard = demoScorecard(),
  routes = modelRoutesFor(WORKSPACE_SLUG),
}: { scorecard?: Scorecard; routes?: ModelRoute[] } = {}) {
  return stubApi([
    { pathname: `${WORKSPACE_PATH}/ai-quality/scorecard`, respond: () => scorecard },
    {
      pathname: `${WORKSPACE_PATH}/ai-quality/model-routes`,
      respond: () => ({ items: routes, nextCursor: null }),
    },
    {
      pathname: `${WORKSPACE_PATH}/replay-runs`,
      respond: () => ({ items: replayRunsFor(WORKSPACE_SLUG), nextCursor: null }),
    },
  ]);
}

function renderInLiveWorkspace(page: React.ReactElement) {
  return renderInWorkspace(
    <LiveUpdatesProvider workspaceSlug={WORKSPACE_SLUG}>{page}</LiveUpdatesProvider>,
  );
}

describe('AiQualityPage', () => {
  beforeEach(() => {
    navigationState.currentPathname = `/w/${WORKSPACE_SLUG}/ai-quality`;
    navigationState.currentSearchParams = new URLSearchParams();
    vi.stubGlobal('WebSocket', OpeningWebSocketStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the scorecards with their change against the previous window', async () => {
    stubAiQuality();
    renderInLiveWorkspace(<AiQualityPage />);

    expect(await screen.findByText('72%')).toBeInTheDocument();
    expect(screen.getByText('87%')).toBeInTheDocument();
    expect(screen.getByText('+4.2 pts against the previous 30 days')).toBeInTheDocument();
    expect(screen.getByText('2m 41s')).toBeInTheDocument();
  });

  it('withholds the rates when too few incidents are scored', async () => {
    stubAiQuality({ scorecard: { ...demoScorecard(), incidentsScored: 12 } });
    renderInLiveWorkspace(<AiQualityPage />);

    expect(await screen.findAllByText('Not enough data: 12 of 30 incidents scored')).toHaveLength(
      3,
    );
    expect(screen.queryByText('72%')).not.toBeInTheDocument();
  });

  it('offers the calibration figures as a table beside the chart', async () => {
    stubAiQuality();
    renderInLiveWorkspace(<AiQualityPage />);

    expect(
      await screen.findByRole('img', {
        name: 'Calibration chart: predicted confidence against actual accuracy',
      }),
    ).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Calibration by confidence band' });
    expect(within(table).getAllByRole('row')).toHaveLength(6);
  });

  it('lists misses by type, most frequent first', async () => {
    stubAiQuality();
    renderInLiveWorkspace(<AiQualityPage />);

    const missesPanel = (await screen.findByRole('heading', { name: 'Misses' })).closest(
      'section',
    ) as HTMLElement;
    const items = within(missesPanel).getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Configuration7');
  });

  it('shows why each route was approved and links to its replay evidence', async () => {
    stubAiQuality();
    renderInLiveWorkspace(<AiQualityPage />);

    expect(
      await screen.findByRole('link', { name: 'Replay evidence for Claude Enterprise' }),
    ).toHaveAttribute('href', '/w/payments-uk/ai-quality/replays/replay-october-baseline');
    expect(screen.getByText('Primary · Claude Enterprise')).toBeInTheDocument();
    expect(screen.getAllByText('Breaks residency')).toHaveLength(2);
  });

  it('warns about a regression and a pinned version being retired', async () => {
    stubAiQuality();
    renderInLiveWorkspace(<AiQualityPage />);

    expect(
      await screen.findByText('Regression in calibration on Bedrock model A'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Pinned version enterprise-reasoning-2026-06 is being retired'),
    ).toBeInTheDocument();
  });

  it('alerts when a route is unavailable or a fallback would break residency', async () => {
    const routes = modelRoutesFor(WORKSPACE_SLUG).map((route) =>
      route.role === 'primary'
        ? { ...route, status: 'unavailable' as const }
        : route.role === 'fallback'
          ? { ...route, isResidencyCompatible: false }
          : route,
    );
    stubAiQuality({ routes });
    renderInLiveWorkspace(<AiQualityPage />);

    expect(
      await screen.findByText('Model route unavailable: Claude Enterprise'),
    ).toBeInTheDocument();
    expect(screen.getByText('Fallback would break residency: Bedrock model A')).toBeInTheDocument();
  });

  it('shows progress for a running replay and results for completed ones', async () => {
    stubAiQuality();
    renderInLiveWorkspace(<AiQualityPage />);

    expect(
      await screen.findByRole('progressbar', { name: 'Progress of Candidate B evaluation' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Correct first 72% · top three 87% · 31 minutes saved per incident'),
    ).toBeInTheDocument();
  });
});

describe('ReplayRunPage', () => {
  beforeEach(() => {
    navigationState.currentPathname = `/w/${WORKSPACE_SLUG}/ai-quality/replays/replay-october-baseline`;
    navigationState.currentSearchParams = new URLSearchParams();
    vi.stubGlobal('WebSocket', OpeningWebSocketStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubReplayRun(runId: string) {
    const run = replayRunDetailFor(WORKSPACE_SLUG, runId);
    stubApi([
      {
        pathname: `${WORKSPACE_PATH}/replay-runs/${runId}`,
        status: run === null ? 404 : 200,
        respond: () => run ?? { title: 'Replay run not found', status: 404 },
      },
    ]);
  }

  it('states everything needed to reproduce the evaluation', async () => {
    stubReplayRun('replay-october-baseline');
    renderInLiveWorkspace(<ReplayRunPage runId="replay-october-baseline" />);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'October baseline' }),
    ).toBeInTheDocument();
    expect(screen.getByText('enterprise-reasoning-2026-06')).toBeInTheDocument();
    expect(screen.getByText('diagnosis-prompt-v14')).toBeInTheDocument();
    expect(screen.getByText('Incidents tested').nextElementSibling).toHaveTextContent('42');
  });

  it('explains each miss with its time fence and decision trace', async () => {
    stubReplayRun('replay-october-baseline');
    navigationState.currentSearchParams = new URLSearchParams('outcome=missed');
    renderInLiveWorkspace(<ReplayRunPage runId="replay-october-baseline" />);

    const misses = await screen.findAllByRole('article');
    expect(misses).toHaveLength(5);
    const firstMiss = misses[0] as HTMLElement;
    expect(within(firstMiss).getByText('Missed')).toBeInTheDocument();
    expect(
      within(firstMiss).getByText(/The certificate store was not connected/),
    ).toBeInTheDocument();
    expect(within(firstMiss).getByText(/^Evidence up to/)).toBeInTheDocument();
    expect(within(firstMiss).getByText('Decision trace (3 steps)')).toBeInTheDocument();
  });

  it('shows the shared no-access state for a run that does not exist', async () => {
    stubReplayRun('replay-missing');
    renderInLiveWorkspace(<ReplayRunPage runId="replay-missing" />);

    expect(
      await screen.findByRole('heading', { name: "You don't have access to this item" }),
    ).toBeInTheDocument();
  });
});

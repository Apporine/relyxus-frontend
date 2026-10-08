import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { platformStatusFixture } from '@/mocks/fixtures/platform-status-fixture';
import { sessionFixture } from '@/mocks/fixtures/session-fixture';
import { nextNavigationMock } from '@/test/next-navigation-mock';
import { renderWithIntl } from '@/test/render-with-intl';

import { WorkspaceShell } from './workspace-shell';

vi.mock('next/navigation', () => nextNavigationMock);

class SilentWebSocket {
  onopen = null;
  onmessage = null;
  onclose = null;
  close(): void {}
}

function respondWith(body: unknown, status = 200, contentType = 'application/json'): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': contentType } });
}

describe('WorkspaceShell', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('WebSocket', SilentWebSocket);
    fetchMock.mockImplementation(async (input) =>
      String(input).endsWith('/platform/status')
        ? respondWith(platformStatusFixture)
        : respondWith(sessionFixture),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('renders the shell around the page for a workspace the person can open', async () => {
    renderWithIntl(
      <WorkspaceShell workspaceSlug="payments-uk" initialSidebarCollapsed={false}>
        <p>Page content</p>
      </WorkspaceShell>,
    );

    const pageContent = await screen.findByText('Page content');
    expect(screen.getByRole('main')).toContainElement(pageContent);
    expect(
      screen.getByRole('button', { name: 'Switch workspace, current: Payments / UK' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Healthy')).toBeInTheDocument();
  });

  it('does not reveal whether an inaccessible workspace exists', async () => {
    renderWithIntl(
      <WorkspaceShell workspaceSlug="treasury-sa" initialSidebarCollapsed={false}>
        <p>Page content</p>
      </WorkspaceShell>,
    );

    expect(
      await screen.findByRole('heading', { name: "You don't have access to this workspace" }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Page content')).not.toBeInTheDocument();
  });

  it('explains a session failure with its reference', async () => {
    fetchMock.mockResolvedValue(
      respondWith(
        { title: 'Identity provider timeout', correlationId: 'RX-7F2A' },
        500,
        'application/problem+json',
      ),
    );

    renderWithIntl(
      <WorkspaceShell workspaceSlug="payments-uk" initialSidebarCollapsed={false}>
        <p>Page content</p>
      </WorkspaceShell>,
    );

    expect(
      await screen.findByRole('heading', { name: 'Your session could not be loaded' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/RX-7F2A/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});

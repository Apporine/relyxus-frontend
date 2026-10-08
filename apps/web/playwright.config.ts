import { defineConfig, devices } from '@playwright/test';

/*
 * End-to-end tests run against the development server so the console talks to the Mock
 * Service Worker fixtures (ADR 0004). Specification acceptance criteria and the key flows in
 * UI/UX s. 18 become specs in tests/e2e.
 *
 * Next.js allows one development server per app, so when `pnpm dev` is already running,
 * set PLAYWRIGHT_BASE_URL (for example http://localhost:3000) to test against it.
 */

const E2E_PORT = 3200;
const isContinuousIntegration = process.env.CI !== undefined;
const existingServerUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isContinuousIntegration,
  retries: isContinuousIntegration ? 1 : 0,
  reporter: isContinuousIntegration ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: existingServerUrl ?? `http://localhost:${E2E_PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1024 },
        // Set to "chrome" or "msedge" to use an installed browser where Playwright's own
        // browser download is not reachable, for example behind a corporate proxy.
        channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL,
      },
    },
  ],
  webServer:
    existingServerUrl === undefined
      ? {
          command: `pnpm dev --port ${E2E_PORT}`,
          url: `http://localhost:${E2E_PORT}`,
          reuseExistingServer: !isContinuousIntegration,
          timeout: 180_000,
        }
      : undefined,
});

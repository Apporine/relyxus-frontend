import { vi } from 'vitest';

/**
 * Stand-in for next/navigation in component tests. Use with
 * `vi.mock('next/navigation', () => nextNavigationMock)` and set `currentPathname` or
 * `currentSearchParams`.
 */
export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
};

export const navigationState = {
  currentPathname: '/w/payments-uk/home',
  currentSearchParams: new URLSearchParams(),
};

export const nextNavigationMock = {
  useRouter: () => routerMock,
  usePathname: () => navigationState.currentPathname,
  useSearchParams: () => navigationState.currentSearchParams,
};

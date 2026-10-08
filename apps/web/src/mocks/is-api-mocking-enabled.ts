/**
 * Whether Mock Service Worker should intercept API calls in the browser.
 *
 * - `enabled`: on in every environment (public demo hosts such as Vercel preview).
 * - `disabled`: off everywhere (point at a real API during local development).
 * - unset: on in `next dev`, off in production builds.
 */
export function isApiMockingEnabled(): boolean {
  const setting = process.env.NEXT_PUBLIC_RELYXUS_API_MOCKING;
  if (setting === 'enabled') {
    return true;
  }
  if (setting === 'disabled') {
    return false;
  }
  return process.env.NODE_ENV === 'development';
}

/*
 * The sidebar remembers whether it is collapsed (UI/UX s. 4). The choice lives in a cookie so
 * the server renders the remembered width and the layout does not jump after hydration.
 */

export const SIDEBAR_COLLAPSED_COOKIE_NAME = 'relyxus-sidebar-collapsed';

const ONE_YEAR_IN_SECONDS = 31_536_000;

export function isSidebarCollapsedCookieValue(cookieValue: string | undefined): boolean {
  return cookieValue === 'true';
}

export function rememberSidebarCollapsed(isCollapsed: boolean): void {
  document.cookie = `${SIDEBAR_COLLAPSED_COOKIE_NAME}=${String(isCollapsed)}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
}

'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/*
 * One click switches every time on the page to UTC and back (UI/UX s. 16). The choice is
 * page state rather than a preference, so it resets on reload.
 */

const UTC_TIME_ZONE = 'UTC';

type TimeDisplayContextValue = {
  /** Zone every formatted time on the page currently uses. */
  displayTimeZone: string;
  preferredTimeZone: string;
  isShowingUtc: boolean;
  /** False when the preferred zone already is UTC, so the toggle has nothing to switch. */
  canToggleUtc: boolean;
  toggleUtc: () => void;
};

const TimeDisplayContext = createContext<TimeDisplayContextValue | null>(null);

export function TimeDisplayProvider({
  preferredTimeZone,
  children,
}: {
  preferredTimeZone: string;
  children: ReactNode;
}) {
  const [isShowingUtc, setIsShowingUtc] = useState(false);
  const toggleUtc = useCallback(() => setIsShowingUtc((current) => !current), []);
  const canToggleUtc = preferredTimeZone !== UTC_TIME_ZONE;

  const contextValue = useMemo(
    () => ({
      displayTimeZone: isShowingUtc || !canToggleUtc ? UTC_TIME_ZONE : preferredTimeZone,
      preferredTimeZone,
      isShowingUtc: isShowingUtc || !canToggleUtc,
      canToggleUtc,
      toggleUtc,
    }),
    [isShowingUtc, canToggleUtc, preferredTimeZone, toggleUtc],
  );

  return <TimeDisplayContext.Provider value={contextValue}>{children}</TimeDisplayContext.Provider>;
}

export function useTimeDisplay(): TimeDisplayContextValue {
  const context = useContext(TimeDisplayContext);
  if (context === null) {
    throw new Error(
      'useTimeDisplay must be used inside TimeDisplayProvider (mounted by AppProviders).',
    );
  }
  return context;
}

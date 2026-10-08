import { useCallback, useSyncExternalStore } from 'react';

/*
 * One shared ticking source per refresh interval, so a page full of countdowns runs a
 * single timer rather than one per clock.
 */

type TickingSource = {
  currentTime: Date;
  listeners: Set<() => void>;
  interval: ReturnType<typeof setInterval> | undefined;
};

const tickingSourcesByInterval = new Map<number, TickingSource>();

function tickingSourceFor(refreshIntervalMs: number): TickingSource {
  const existingSource = tickingSourcesByInterval.get(refreshIntervalMs);
  if (existingSource !== undefined) {
    return existingSource;
  }
  const newSource: TickingSource = {
    currentTime: new Date(),
    listeners: new Set(),
    interval: undefined,
  };
  tickingSourcesByInterval.set(refreshIntervalMs, newSource);
  return newSource;
}

function subscribeToTicks(refreshIntervalMs: number, onTick: () => void): () => void {
  const source = tickingSourceFor(refreshIntervalMs);
  source.listeners.add(onTick);

  if (source.interval === undefined) {
    source.currentTime = new Date();
    source.interval = setInterval(() => {
      source.currentTime = new Date();
      source.listeners.forEach((listener) => listener());
    }, refreshIntervalMs);
  }

  return () => {
    source.listeners.delete(onTick);
    if (source.listeners.size === 0) {
      clearInterval(source.interval);
      source.interval = undefined;
    }
  };
}

const serverTime = () => null;

/**
 * Current time, refreshed on an interval. Returns null during server rendering and
 * hydration, so markup never contains a time that disagrees with the browser's clock.
 */
export function useCurrentTime(refreshIntervalMs: number): Date | null {
  const subscribe = useCallback(
    (onTick: () => void) => subscribeToTicks(refreshIntervalMs, onTick),
    [refreshIntervalMs],
  );
  const readCurrentTime = useCallback(
    () => tickingSourceFor(refreshIntervalMs).currentTime,
    [refreshIntervalMs],
  );
  return useSyncExternalStore(subscribe, readCurrentTime, serverTime);
}

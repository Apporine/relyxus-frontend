'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { LiveConnection, type LiveConnectionStatus } from './live-connection';
import type { LiveEvent } from './live-event';

type LiveEventHandler = (event: LiveEvent) => void;

type LiveUpdatesContextValue = {
  status: LiveConnectionStatus;
  subscribe: (eventType: string, handler: LiveEventHandler) => () => void;
};

const LiveUpdatesContext = createContext<LiveUpdatesContextValue | null>(null);

const initialStatus: LiveConnectionStatus = {
  state: 'connecting',
  transport: 'websocket',
  lastEventReceivedAt: null,
};

/** Provisional endpoint paths, pending the published API contract (ADR 0004). */
function liveEndpointUrls(workspaceSlug: string): {
  webSocketUrl: string;
  serverSentEventsUrl: string;
} {
  const livePath = `/api/v1/workspaces/${encodeURIComponent(workspaceSlug)}/live`;
  const webSocketUrl = new URL(livePath, window.location.href);
  webSocketUrl.protocol = webSocketUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  return {
    webSocketUrl: webSocketUrl.toString(),
    serverSentEventsUrl: new URL(`${livePath}/events`, window.location.href).toString(),
  };
}

/** Owns the workspace's live connection and routes events to subscribers by event type. */
export function LiveUpdatesProvider({
  workspaceSlug,
  children,
}: {
  workspaceSlug: string;
  children: ReactNode;
}) {
  const [status, setStatus] = useState<LiveConnectionStatus>(initialStatus);
  const handlersByEventType = useRef(new Map<string, Set<LiveEventHandler>>());

  useEffect(() => {
    const connection = new LiveConnection({
      ...liveEndpointUrls(workspaceSlug),
      onStatusChange: setStatus,
      onEvent: (event) => {
        handlersByEventType.current.get(event.type)?.forEach((handler) => handler(event));
      },
      onInvalidMessage: (reason) => {
        // Reported without the payload, which may contain incident data.
        console.warn(`[relyxus-live] ${reason}`);
      },
    });
    const handleOffline = () => connection.markOffline();
    const handleOnline = () => connection.markOnline();

    connection.start();
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      connection.stop();
    };
  }, [workspaceSlug]);

  const subscribe = useCallback((eventType: string, handler: LiveEventHandler) => {
    const handlers = handlersByEventType.current.get(eventType) ?? new Set<LiveEventHandler>();
    handlers.add(handler);
    handlersByEventType.current.set(eventType, handlers);
    return () => {
      handlers.delete(handler);
    };
  }, []);

  const contextValue = useMemo(() => ({ status, subscribe }), [status, subscribe]);

  return <LiveUpdatesContext.Provider value={contextValue}>{children}</LiveUpdatesContext.Provider>;
}

function useLiveUpdatesContext(): LiveUpdatesContextValue {
  const context = useContext(LiveUpdatesContext);
  if (context === null) {
    throw new Error('Live update hooks must be used inside LiveUpdatesProvider.');
  }
  return context;
}

export function useLiveConnectionStatus(): LiveConnectionStatus {
  return useLiveUpdatesContext().status;
}

/**
 * State-changing actions are disabled while the live connection is down (UI/UX s. 8), so
 * nobody acts on a picture of the incident that may already be out of date.
 */
export function useCanChangeState(): boolean {
  return useLiveConnectionStatus().state === 'open';
}

/** Runs the handler for every live event of the given types, for example "incident.updated.v1". */
export function useLiveEvents(eventTypes: readonly string[], onEvent: LiveEventHandler): void {
  const { subscribe } = useLiveUpdatesContext();
  const handleEvent = useEffectEvent(onEvent);
  const eventTypesKey = eventTypes.join('|');

  useEffect(() => {
    const unsubscribers = eventTypesKey
      .split('|')
      .map((eventType) => subscribe(eventType, (event) => handleEvent(event)));
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [subscribe, eventTypesKey]);
}

/** Runs the handler for every live event of one type. */
export function useLiveEvent(eventType: string, onEvent: LiveEventHandler): void {
  useLiveEvents([eventType], onEvent);
}

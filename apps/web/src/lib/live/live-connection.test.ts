import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  LiveConnection,
  type LiveConnectionOptions,
  type LiveConnectionStatus,
} from './live-connection';

class FakeTransport {
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  isClosed = false;

  constructor(readonly url: string) {}

  close(): void {
    this.isClosed = true;
  }

  simulateOpen(): void {
    this.onopen?.(new Event('open'));
  }

  simulateMessage(payload: string): void {
    this.onmessage?.(new MessageEvent('message', { data: payload }));
  }

  simulateDrop(): void {
    this.onclose?.(new CloseEvent('close'));
    this.onerror?.(new Event('error'));
  }
}

const incidentUpdatedEvent = {
  specversion: '1.0',
  id: 'evt-1',
  type: 'incident.updated.v1',
  source: '/workspaces/payments-uk/incidents/INC-2041',
  time: '2026-10-07T12:04:31Z',
  data: { severity: 'SEV1' },
};

describe('LiveConnection', () => {
  let webSockets: FakeTransport[];
  let eventSources: FakeTransport[];
  let statuses: LiveConnectionStatus[];
  let options: LiveConnectionOptions;

  beforeEach(() => {
    vi.useFakeTimers();
    webSockets = [];
    eventSources = [];
    statuses = [];
    options = {
      webSocketUrl: 'wss://console.example/api/v1/workspaces/payments-uk/live',
      serverSentEventsUrl: 'https://console.example/api/v1/workspaces/payments-uk/live/events',
      onStatusChange: (status) => statuses.push(status),
      onEvent: vi.fn(),
      onInvalidMessage: vi.fn(),
      createWebSocket: (url) => {
        const transport = new FakeTransport(url);
        webSockets.push(transport);
        return transport as unknown as WebSocket;
      },
      createEventSource: (url) => {
        const transport = new FakeTransport(url);
        eventSources.push(transport);
        return transport;
      },
      now: () => new Date('2026-10-07T12:04:31Z'),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const latestStatus = () => statuses.at(-1);

  it('opens a WebSocket and delivers valid events', () => {
    const connection = new LiveConnection(options);
    connection.start();
    webSockets[0]?.simulateOpen();
    webSockets[0]?.simulateMessage(JSON.stringify(incidentUpdatedEvent));

    expect(latestStatus()).toEqual({
      state: 'open',
      transport: 'websocket',
      lastEventReceivedAt: new Date('2026-10-07T12:04:31Z'),
    });
    expect(options.onEvent).toHaveBeenCalledWith(incidentUpdatedEvent);
  });

  it('reports messages that are not valid events instead of dropping them silently', () => {
    const connection = new LiveConnection(options);
    connection.start();
    webSockets[0]?.simulateOpen();
    webSockets[0]?.simulateMessage('not json');
    webSockets[0]?.simulateMessage(JSON.stringify({ type: 'incident.updated.v1' }));

    expect(options.onEvent).not.toHaveBeenCalled();
    expect(options.onInvalidMessage).toHaveBeenCalledTimes(2);
  });

  it('reconnects with backoff after an established connection drops', () => {
    const connection = new LiveConnection(options);
    connection.start();
    webSockets[0]?.simulateOpen();
    webSockets[0]?.simulateDrop();

    expect(latestStatus()?.state).toBe('reconnecting');
    expect(webSockets).toHaveLength(1);

    vi.advanceTimersByTime(1_000);
    expect(webSockets).toHaveLength(2);

    webSockets[1]?.simulateOpen();
    expect(latestStatus()?.state).toBe('open');
  });

  it('falls back to Server-Sent Events when WebSockets never open', () => {
    const connection = new LiveConnection(options);
    connection.start();
    webSockets[0]?.simulateDrop();
    vi.advanceTimersByTime(1_000);
    webSockets[1]?.simulateDrop();

    expect(latestStatus()?.transport).toBe('server-sent-events');
    expect(eventSources).toHaveLength(1);
    expect(eventSources[0]?.url).toBe(options.serverSentEventsUrl);

    eventSources[0]?.simulateOpen();
    expect(latestStatus()?.state).toBe('open');
  });

  it('waits while offline and reconnects as soon as the network returns', () => {
    const connection = new LiveConnection(options);
    connection.start();
    webSockets[0]?.simulateOpen();

    connection.markOffline();
    expect(latestStatus()?.state).toBe('offline');
    expect(webSockets[0]?.isClosed).toBe(true);
    vi.advanceTimersByTime(60_000);
    expect(webSockets).toHaveLength(1);

    connection.markOnline();
    expect(webSockets).toHaveLength(2);
    expect(latestStatus()?.state).toBe('reconnecting');
  });

  it('closes the transport and stops reconnecting when stopped', () => {
    const connection = new LiveConnection(options);
    connection.start();
    webSockets[0]?.simulateOpen();

    connection.stop();
    webSockets[0]?.simulateDrop();
    vi.advanceTimersByTime(60_000);

    expect(webSockets[0]?.isClosed).toBe(true);
    expect(webSockets).toHaveLength(1);
  });
});

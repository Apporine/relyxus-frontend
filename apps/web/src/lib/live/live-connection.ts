import { liveEventSchema, type LiveEvent } from './live-event';

/*
 * Live updates use a WebSocket, falling back to Server-Sent Events when WebSockets cannot be
 * established, for example behind a proxy that strips upgrade headers (Tech stack s. 5).
 * Polling is never used as the primary path.
 */

export type LiveConnectionState = 'connecting' | 'open' | 'reconnecting' | 'offline';
export type LiveTransport = 'websocket' | 'server-sent-events';

export type LiveConnectionStatus = {
  state: LiveConnectionState;
  transport: LiveTransport;
  /** When the last event arrived; shown as "last update 12:04:31" while reconnecting. */
  lastEventReceivedAt: Date | null;
};

/** Consecutive WebSocket failures before any connection opens that trigger the SSE fallback. */
const WEBSOCKET_ATTEMPTS_BEFORE_FALLBACK = 2;
const INITIAL_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

type MinimalEventSource = Pick<EventSource, 'close'> & {
  onopen: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
};

export type LiveConnectionOptions = {
  webSocketUrl: string;
  serverSentEventsUrl: string;
  onStatusChange: (status: LiveConnectionStatus) => void;
  onEvent: (event: LiveEvent) => void;
  /** Called for payloads that are not valid events, so contract drift is visible. */
  onInvalidMessage: (reason: string) => void;
  createWebSocket?: (url: string) => WebSocket;
  createEventSource?: (url: string) => MinimalEventSource;
  now?: () => Date;
};

export class LiveConnection {
  private readonly options: Required<LiveConnectionOptions>;
  private status: LiveConnectionStatus = {
    state: 'connecting',
    transport: 'websocket',
    lastEventReceivedAt: null,
  };
  private activeWebSocket: WebSocket | null = null;
  private activeEventSource: MinimalEventSource | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  private failedAttemptsSinceOpen = 0;
  private hasEverOpened = false;
  private isStopped = false;

  constructor(options: LiveConnectionOptions) {
    this.options = {
      createWebSocket: (url) => new WebSocket(url),
      createEventSource: (url) => new EventSource(url, { withCredentials: true }),
      now: () => new Date(),
      ...options,
    };
  }

  start(): void {
    this.isStopped = false;
    this.connect();
  }

  stop(): void {
    this.isStopped = true;
    clearTimeout(this.reconnectTimer);
    this.closeTransports();
  }

  /** Browser reported loss of network: stop retrying until it is back. */
  markOffline(): void {
    clearTimeout(this.reconnectTimer);
    this.closeTransports();
    this.updateStatus({ state: 'offline' });
  }

  /** Browser reported the network is back: reconnect immediately. */
  markOnline(): void {
    if (this.isStopped) {
      return;
    }
    this.failedAttemptsSinceOpen = 0;
    this.connect();
  }

  private connect(): void {
    clearTimeout(this.reconnectTimer);
    this.closeTransports();
    this.updateStatus({ state: this.hasEverOpened ? 'reconnecting' : 'connecting' });

    if (this.status.transport === 'websocket') {
      this.connectWebSocket();
    } else {
      this.connectEventSource();
    }
  }

  private connectWebSocket(): void {
    const webSocket = this.options.createWebSocket(this.options.webSocketUrl);
    this.activeWebSocket = webSocket;
    webSocket.onopen = () => this.handleOpen();
    webSocket.onmessage = (message) => this.handleMessage(message.data);
    webSocket.onclose = () => this.handleDisconnect();
  }

  private connectEventSource(): void {
    const eventSource = this.options.createEventSource(this.options.serverSentEventsUrl);
    this.activeEventSource = eventSource;
    eventSource.onopen = () => this.handleOpen();
    eventSource.onmessage = (message) => this.handleMessage(message.data);
    eventSource.onerror = () => this.handleDisconnect();
  }

  private handleOpen(): void {
    this.hasEverOpened = true;
    this.failedAttemptsSinceOpen = 0;
    this.updateStatus({ state: 'open' });
  }

  private handleMessage(payload: unknown): void {
    if (typeof payload !== 'string') {
      this.options.onInvalidMessage('Live message was not text');
      return;
    }
    let decodedPayload: unknown;
    try {
      decodedPayload = JSON.parse(payload);
    } catch {
      this.options.onInvalidMessage('Live message was not valid JSON');
      return;
    }
    const parsedEvent = liveEventSchema.safeParse(decodedPayload);
    if (!parsedEvent.success) {
      this.options.onInvalidMessage('Live message did not match the event envelope');
      return;
    }
    this.updateStatus({ lastEventReceivedAt: this.options.now() });
    this.options.onEvent(parsedEvent.data);
  }

  private handleDisconnect(): void {
    if (this.isStopped || this.status.state === 'offline') {
      return;
    }
    this.closeTransports();
    this.failedAttemptsSinceOpen += 1;

    const shouldFallBack =
      this.status.transport === 'websocket' &&
      !this.hasEverOpened &&
      this.failedAttemptsSinceOpen >= WEBSOCKET_ATTEMPTS_BEFORE_FALLBACK;
    if (shouldFallBack) {
      this.failedAttemptsSinceOpen = 0;
      this.updateStatus({ transport: 'server-sent-events' });
      this.connect();
      return;
    }

    this.updateStatus({ state: this.hasEverOpened ? 'reconnecting' : 'connecting' });
    this.reconnectTimer = setTimeout(() => this.connect(), this.nextReconnectDelayMs());
  }

  private nextReconnectDelayMs(): number {
    const exponentialDelay = INITIAL_RECONNECT_DELAY_MS * 2 ** (this.failedAttemptsSinceOpen - 1);
    return Math.min(exponentialDelay, MAX_RECONNECT_DELAY_MS);
  }

  private closeTransports(): void {
    if (this.activeWebSocket !== null) {
      this.activeWebSocket.onopen = null;
      this.activeWebSocket.onmessage = null;
      this.activeWebSocket.onclose = null;
      this.activeWebSocket.close();
      this.activeWebSocket = null;
    }
    if (this.activeEventSource !== null) {
      this.activeEventSource.onopen = null;
      this.activeEventSource.onmessage = null;
      this.activeEventSource.onerror = null;
      this.activeEventSource.close();
      this.activeEventSource = null;
    }
  }

  private updateStatus(change: Partial<LiveConnectionStatus>): void {
    this.status = { ...this.status, ...change };
    this.options.onStatusChange(this.status);
  }
}

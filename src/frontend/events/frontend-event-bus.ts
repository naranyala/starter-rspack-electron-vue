/**
 * Frontend Event Bus with Vue Integration
 *
 * Extends the core event bus with:
 * - IPC communication with backend
 * - Vue composable for reactive event handling
 * - Automatic cleanup on component unmount
 */

import { EventBus, getEventBus } from '../../shared/events/event-bus';
import type { EventKey, EventPayload } from '../../shared/events/event-types';
import { createLogger } from '../../shared/logger';

const logger = createLogger('FrontendEventBus');

// IPC channels (must match backend)
export const EVENT_CHANNELS = {
  SUBSCRIBE: 'event:subscribe',
  UNSUBSCRIBE: 'event:unsubscribe',
  EMIT: 'event:emit',
  RECEIVE: 'event:receive',
} as const;

export class FrontendEventBus extends EventBus {
  private isInitialized = false;
  private ipcListeners: Array<{ channel: string; handler: (...args: unknown[]) => void }> = [];

  constructor() {
    super({
      debug: process.env.NODE_ENV === 'development',
      enableHistory: true,
      maxHistorySize: 100,
      enableCrossProcess: true,
    });
  }

  /**
   * Initialize the frontend event bus
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Frontend event bus already initialized');
      return;
    }

    if (!window.electronAPI) {
      logger.warn('Electron API not available - running in web mode');
      this.isInitialized = true;
      return;
    }

    this.setupIpcListeners();
    this.isInitialized = true;

    logger.info('Frontend event bus initialized');
  }

  /**
   * Setup IPC listeners for receiving events from backend
   */
  private setupIpcListeners(): void {
    const receiveHandler = (data: { type: EventKey; payload: unknown }) => {
      logger.debug(`Event received from backend: "${data.type}"`);
      this.emit(data.type, data.payload as EventPayload<EventKey>, 'cross-process');
    };

    window.electronAPI.on(EVENT_CHANNELS.RECEIVE, receiveHandler);
    this.ipcListeners.push({
      channel: EVENT_CHANNELS.RECEIVE,
      handler: receiveHandler,
    });
  }

  /**
   * Subscribe to an event with automatic IPC registration
   */
  on<K extends EventKey>(
    eventType: K,
    handler: (payload: EventPayload<K>) => void | Promise<void>,
    options: { once?: boolean; syncWithBackend?: boolean } = {}
  ) {
    const { once, syncWithBackend = true } = options;

    // Register with backend for cross-process events
    if (syncWithBackend && window.electronAPI) {
      window.electronAPI
        .getSetting(`event_sub_${eventType}`)
        .catch(() => {})
        .then(() => {
          window.electronAPI.setSetting(`event_sub_${eventType}`, true);
        });
    }

    return super.on(eventType, handler as never, { once });
  }

  /**
   * Emit an event with optional backend forwarding
   */
  async emit<K extends EventKey>(
    eventType: K,
    payload: EventPayload<K>,
    source: 'backend' | 'frontend' | 'cross-process' = 'frontend'
  ): Promise<void> {
    // Emit locally
    await super.emit(eventType, payload, source);

    // Forward to backend for cross-process distribution
    if (source === 'frontend' && window.electronAPI) {
      try {
        await window.electronAPI.setSetting(`event_emit_${eventType}`, {
          type: eventType,
          payload,
        });
      } catch (error) {
        logger.warn('Failed to emit event to backend', { eventType, error });
      }
    }
  }

  /**
   * Destroy the frontend event bus and cleanup IPC listeners
   */
  destroy(): void {
    // Remove IPC listeners
    for (const { channel, handler } of this.ipcListeners) {
      window.electronAPI?.removeListener(channel, handler);
    }
    this.ipcListeners = [];

    super.destroy();
    logger.info('Frontend event bus destroyed');
  }
}

// Singleton instance
let frontendEventBus: FrontendEventBus | null = null;

export function getFrontendEventBus(): FrontendEventBus {
  if (!frontendEventBus) {
    frontendEventBus = new FrontendEventBus();
  }
  return frontendEventBus;
}

/**
 * Initialize and get the frontend event bus
 */
export async function initializeFrontendEventBus(): Promise<FrontendEventBus> {
  const bus = getFrontendEventBus();
  await bus.initialize();
  return bus;
}

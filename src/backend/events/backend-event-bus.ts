/**
 * Backend Event Bus with IPC Bridge
 *
 * Extends the core event bus with:
 * - IPC handler registration for cross-process events
 * - Electron app lifecycle integration
 * - Cross-process event forwarding
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import { createLogger } from '../logger';
import { EventBus, getEventBus } from './event-bus';
import type { CrossProcessEvents, EventKey, EventPayload } from './event-types';

const logger = createLogger('BackendEventBus');

// IPC channels for cross-process events
export const EVENT_CHANNELS = {
  SUBSCRIBE: 'event:subscribe',
  UNSUBSCRIBE: 'event:unsubscribe',
  EMIT: 'event:emit',
  RECEIVE: 'event:receive',
} as const;

export class BackendEventBus extends EventBus {
  private windowSubscriptions: Map<number, Set<EventKey>> = new Map();
  private isInitialized = false;

  constructor() {
    super({
      debug: process.env.NODE_ENV === 'development',
      enableHistory: true,
      maxHistorySize: 200,
      enableCrossProcess: true,
    });
  }

  /**
   * Initialize the backend event bus
   */
  initialize(): void {
    if (this.isInitialized) {
      logger.warn('Backend event bus already initialized');
      return;
    }

    this.registerIpcHandlers();
    this.setupAppLifecycleEvents();
    this.isInitialized = true;

    logger.info('Backend event bus initialized');
  }

  /**
   * Register IPC handlers for cross-process communication
   */
  private registerIpcHandlers(): void {
    // Handle event subscription from renderer
    ipcMain.handle(EVENT_CHANNELS.SUBSCRIBE, async (_event, eventType: EventKey) => {
      const windowId = this.getWindowId(_event);
      this.subscribeWindow(windowId, eventType);
      logger.debug(`Window ${windowId} subscribed to "${eventType}"`);
      return { success: true };
    });

    // Handle event unsubscription from renderer
    ipcMain.handle(EVENT_CHANNELS.UNSUBSCRIBE, async (_event, eventType: EventKey) => {
      const windowId = this.getWindowId(_event);
      this.unsubscribeWindow(windowId, eventType);
      logger.debug(`Window ${windowId} unsubscribed from "${eventType}"`);
      return { success: true };
    });

    // Handle events emitted from renderer
    ipcMain.handle(EVENT_CHANNELS.EMIT, async (_event, eventType: EventKey, payload: unknown) => {
      const windowId = this.getWindowId(_event);
      logger.debug(`Event "${eventType}" received from window ${windowId}`);

      // Emit in backend
      await this.emit(eventType, payload as EventPayload<EventKey>, 'cross-process');

      // Broadcast to other windows (except sender)
      this.broadcastToWindows(eventType, payload, windowId);

      return { success: true };
    });
  }

  /**
   * Setup Electron app lifecycle event forwarding
   */
  private setupAppLifecycleEvents(): void {
    app.on('ready', () => {
      this.emit('app:ready', undefined);
    });

    app.on('before-quit', () => {
      this.emit('app:before-quit', undefined);
    });

    app.on('quit', () => {
      this.emit('app:quit', undefined);
      this.destroy();
    });
  }

  /**
   * Subscribe a window to receive events
   */
  subscribeWindow(windowId: number, eventType: EventKey): void {
    if (!this.windowSubscriptions.has(windowId)) {
      this.windowSubscriptions.set(windowId, new Set());
    }
    this.windowSubscriptions.get(windowId)!.add(eventType);
  }

  /**
   * Unsubscribe a window from events
   */
  unsubscribeWindow(windowId: number, eventType: EventKey): void {
    const subscriptions = this.windowSubscriptions.get(windowId);
    if (subscriptions) {
      subscriptions.delete(eventType);
      if (subscriptions.size === 0) {
        this.windowSubscriptions.delete(windowId);
      }
    }
  }

  /**
   * Broadcast event to subscribed windows
   */
  private broadcastToWindows(
    eventType: EventKey,
    payload: unknown,
    excludeWindowId?: number
  ): void {
    for (const [windowId, subscriptions] of this.windowSubscriptions.entries()) {
      if (windowId === excludeWindowId) continue;
      if (!subscriptions.has(eventType)) continue;

      const window = BrowserWindow.fromId(windowId);
      if (window && !window.isDestroyed()) {
        window.webContents.send(EVENT_CHANNELS.RECEIVE, {
          type: eventType,
          payload,
        });
      }
    }
  }

  /**
   * Emit event and broadcast to all subscribed windows
   */
  async emit<K extends EventKey>(
    eventType: K,
    payload: EventPayload<K>,
    source: 'backend' | 'frontend' | 'cross-process' = 'backend'
  ): Promise<void> {
    await super.emit(eventType, payload, source);

    // Broadcast to frontend
    if (source !== 'cross-process') {
      this.broadcastToWindows(eventType, payload);
    }
  }

  /**
   * Get window ID from IPC event
   */
  private getWindowId(event: Electron.IpcMainInvokeEvent): number {
    return event.sender.id;
  }

  /**
   * Get statistics including window subscriptions
   */
  getStats() {
    const stats = super.getStats();
    return {
      ...stats,
      subscribedWindows: this.windowSubscriptions.size,
      windowSubscriptions: Object.fromEntries(
        Array.from(this.windowSubscriptions.entries()).map(([id, events]) => [
          id,
          Array.from(events),
        ])
      ),
    };
  }

  /**
   * Destroy the backend event bus
   */
  destroy(): void {
    // Remove IPC handlers
    Object.values(EVENT_CHANNELS).forEach((channel) => {
      ipcMain.removeHandler(channel);
    });

    this.windowSubscriptions.clear();
    super.destroy();
    logger.info('Backend event bus destroyed');
  }
}

// Singleton instance
let backendEventBus: BackendEventBus | null = null;

export function getBackendEventBus(): BackendEventBus {
  if (!backendEventBus) {
    backendEventBus = new BackendEventBus();
  }
  return backendEventBus;
}

/**
 * Initialize and get the backend event bus
 */
export function initializeBackendEventBus(): BackendEventBus {
  const bus = getBackendEventBus();
  bus.initialize();
  return bus;
}

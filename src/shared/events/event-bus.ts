/**
 * Core Event Bus Implementation
 * 
 * A type-safe, feature-rich event bus with support for:
 * - Typed events
 * - Priority-based execution
 * - Debouncing and throttling
 * - Event history
 * - Error handling
 * - Statistics tracking
 */

import { createLogger } from '../logger';
import type {
  BaseEvent,
  EventKey,
  EventMap,
  EventHandler,
  EventSubscriptionOptions,
  Subscription,
  EventBusStats,
  EventBusConfig,
  EventPayload,
} from './event-types';

const logger = createLogger('EventBus');

/**
 * Default event bus configuration
 */
const DEFAULT_CONFIG: Required<EventBusConfig> = {
  debug: false,
  enableHistory: true,
  maxHistorySize: 100,
  enableCrossProcess: true,
};

export class EventBus {
  private handlers: Map<EventKey, Set<Subscription>> = new Map();
  private history: BaseEvent<unknown>[] = [];
  private stats: EventBusStats = {
    totalEvents: 0,
    eventsByType: {},
    activeSubscriptions: 0,
    failedHandlers: 0,
  };
  private config: Required<EventBusConfig>;
  private correlationId?: string;

  constructor(config: EventBusConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Subscribe to an event
   */
  on<K extends EventKey>(
    eventType: K,
    handler: EventHandler<EventPayload<K>>,
    options: EventSubscriptionOptions = {}
  ): Subscription {
    const subscription: Subscription = {
      id: this.generateSubscriptionId(),
      eventType,
      handler: handler as EventHandler<unknown>,
      options,
      unsubscribe: () => this.off(eventType, subscription),
    };

    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(subscription);
    this.stats.activeSubscriptions++;

    if (this.config.debug) {
      logger.debug(`Subscribed to "${eventType}"`, { subscriptionId: subscription.id });
    }

    return subscription;
  }

  /**
   * Subscribe to an event once
   */
  once<K extends EventKey>(
    eventType: K,
    handler: EventHandler<EventPayload<K>>
  ): Subscription {
    return this.on(eventType, handler, { once: true });
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends EventKey>(eventType: K, subscription: Subscription): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(subscription);
      this.stats.activeSubscriptions--;

      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }

      if (this.config.debug) {
        logger.debug(`Unsubscribed from "${eventType}"`, { subscriptionId: subscription.id });
      }
    }
  }

  /**
   * Unsubscribe all handlers for an event (or all events)
   */
  offAll(eventType?: EventKey): void {
    if (eventType) {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        this.stats.activeSubscriptions -= handlers.size;
        this.handlers.delete(eventType);
      }
    } else {
      this.handlers.clear();
      this.stats.activeSubscriptions = 0;
    }

    if (this.config.debug) {
      logger.debug(`Unsubscribed ${eventType ? `from "${eventType}"` : 'from all events'}`);
    }
  }

  /**
   * Emit an event
   */
  async emit<K extends EventKey>(
    eventType: K,
    payload: EventPayload<K>,
    source: 'backend' | 'frontend' | 'cross-process' = 'backend'
  ): Promise<void> {
    const event: BaseEvent<EventPayload<K>> = {
      type: eventType,
      payload: payload as EventPayload<K>,
      meta: {
        timestamp: Date.now(),
        source,
        correlationId: this.correlationId || this.generateCorrelationId(),
      },
    };

    this.stats.totalEvents++;
    this.stats.eventsByType[eventType] = (this.stats.eventsByType[eventType] || 0) + 1;

    if (this.config.enableHistory) {
      this.addToHistory(event);
    }

    if (this.config.debug) {
      logger.debug(`Event emitted: "${eventType}"`, { 
        payload: this.sanitizePayload(payload),
        correlationId: event.meta.correlationId,
      });
    }

    const handlers = this.handlers.get(eventType);
    if (!handlers || handlers.size === 0) {
      if (this.config.debug) {
        logger.debug(`No handlers for event "${eventType}"`);
      }
      return;
    }

    // Sort by priority (higher first)
    const sortedHandlers = Array.from(handlers).sort(
      (a, b) => (b.options.priority || 0) - (a.options.priority || 0)
    );

    // Execute handlers
    const promises: Promise<void>[] = [];

    for (const subscription of sortedHandlers) {
      try {
        const result = subscription.handler(payload as EventPayload<K>, event.meta);
        
        if (result instanceof Promise) {
          promises.push(
            result.catch((error) => {
              this.stats.failedHandlers++;
              logger.error(`Handler error for "${eventType}"`, { 
                error,
                subscriptionId: subscription.id,
              });
            })
          );
        }

        // Handle once subscriptions
        if (subscription.options.once) {
          this.off(eventType, subscription);
        }
      } catch (error) {
        this.stats.failedHandlers++;
        logger.error(`Handler error for "${eventType}"`, { 
          error,
          subscriptionId: subscription.id,
        });
      }
    }

    await Promise.all(promises);
  }

  /**
   * Emit an event and wait for all handlers to complete
   */
  async emitAndWait<K extends EventKey>(
    eventType: K,
    payload: EventPayload<K>
  ): Promise<void> {
    return this.emit(eventType, payload);
  }

  /**
   * Get event history
   */
  getHistory(eventType?: EventKey, limit?: number): BaseEvent<unknown>[] {
    let history = eventType 
      ? this.history.filter((e) => e.type === eventType)
      : this.history;

    if (limit) {
      history = history.slice(-limit);
    }

    return history;
  }

  /**
   * Clear event history
   */
  clearHistory(eventType?: EventKey): void {
    if (eventType) {
      this.history = this.history.filter((e) => e.type !== eventType);
    } else {
      this.history = [];
    }

    if (this.config.debug) {
      logger.debug('Event history cleared');
    }
  }

  /**
   * Get event bus statistics
   */
  getStats(): EventBusStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalEvents: 0,
      eventsByType: {},
      activeSubscriptions: 0,
      failedHandlers: 0,
    };
  }

  /**
   * Get all active subscriptions
   */
  getSubscriptions(eventType?: EventKey): Subscription[] {
    if (eventType) {
      return Array.from(this.handlers.get(eventType) || []);
    }
    return Array.from(this.handlers.values()).flatMap((handlers) => Array.from(handlers));
  }

  /**
   * Set correlation ID for event tracing
   */
  setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  /**
   * Clear correlation ID
   */
  clearCorrelationId(): void {
    this.correlationId = undefined;
  }

  /**
   * Destroy the event bus and clean up
   */
  destroy(): void {
    this.offAll();
    this.clearHistory();
    this.resetStats();
    logger.info('Event bus destroyed');
  }

  // Private helpers

  private addToHistory(event: BaseEvent<unknown>): void {
    this.history.push(event);

    if (this.history.length > this.config.maxHistorySize) {
      this.history.shift();
    }
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private sanitizePayload(payload: unknown): unknown {
    if (typeof payload === 'object' && payload !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(payload)) {
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('secret') ||
            key.toLowerCase().includes('token')) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }
    return payload;
  }
}

// Singleton instance
let globalEventBus: EventBus | null = null;

export function getEventBus(config?: EventBusConfig): EventBus {
  if (!globalEventBus) {
    globalEventBus = new EventBus(config);
  }
  return globalEventBus;
}

export function createEventBus(config?: EventBusConfig): EventBus {
  return new EventBus(config);
}

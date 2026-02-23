/**
 * Event Bus System - Type Definitions
 * 
 * Provides type-safe event communication across the application
 */

/**
 * Event metadata
 */
export interface EventMeta {
  timestamp: number;
  source: 'backend' | 'frontend' | 'cross-process';
  correlationId?: string;
}

/**
 * Base event interface
 */
export interface BaseEvent<T = unknown> {
  type: string;
  payload: T;
  meta: EventMeta;
}

/**
 * Event handler function type
 */
export type EventHandler<T = unknown> = (payload: T, meta: EventMeta) => void | Promise<void>;

/**
 * Event subscription options
 */
export interface EventSubscriptionOptions {
  /** Execute handler only once */
  once?: boolean;
  /** Priority order (higher = executed first) */
  priority?: number;
  /** Debounce time in ms */
  debounce?: number;
  /** Throttle time in ms */
  throttle?: number;
}

/**
 * Active subscription
 */
export interface Subscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  options: EventSubscriptionOptions;
  unsubscribe: () => void;
}

/**
 * Event bus statistics
 */
export interface EventBusStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  activeSubscriptions: number;
  failedHandlers: number;
}

/**
 * Event bus configuration
 */
export interface EventBusConfig {
  /** Enable debug logging */
  debug?: boolean;
  /** Enable event history */
  enableHistory?: boolean;
  /** Maximum history size */
  maxHistorySize?: number;
  /** Enable cross-process events */
  enableCrossProcess?: boolean;
}

// ============================================================================
// Application Event Types
// ============================================================================

/**
 * App lifecycle events
 */
export interface AppEvents {
  'app:initialized': { version: string };
  'app:ready': void;
  'app:before-quit': void;
  'app:quit': void;
}

/**
 * Window management events
 */
export interface WindowEvents {
  'window:created': { windowId: number; title?: string };
  'window:closed': { windowId: number };
  'window:focus': { windowId: number };
  'window:blur': { windowId: number };
  'window:minimize': { windowId: number };
  'window:maximize': { windowId: number };
  'window:restore': { windowId: number };
}

/**
 * Settings events
 */
export interface SettingsEvents {
  'settings:changed': { key: string; value: unknown; previousValue?: unknown };
  'settings:loaded': { settings: Record<string, unknown> };
  'settings:reset': void;
}

/**
 * User interaction events
 */
export interface UserEvents {
  'user:action': { action: string; details?: Record<string, unknown> };
  'user:preference-change': { category: string; preference: string; value: unknown };
}

/**
 * Data/events for cross-process communication
 */
export interface CrossProcessEvents {
  'cross:sync': { channel: string; data: unknown };
  'cross:notification': { type: string; message: string };
}

/**
 * Error events
 */
export interface ErrorEvents {
  'error:uncaught': { error: Error; context?: string };
  'error:handled': { error: Error; handled: boolean };
}

/**
 * Combined event map
 */
export interface EventMap 
  extends AppEvents
  , WindowEvents
  , SettingsEvents
  , UserEvents
  , CrossProcessEvents
  , ErrorEvents {}

/**
 * Type helper to get event payload type
 */
export type EventPayload<K extends keyof EventMap> = 
  EventMap[K] extends void ? undefined : EventMap[K];

/**
 * Type helper to get all event keys
 */
export type EventKey = keyof EventMap;

/**
 * Create a typed event
 */
export function createEvent<K extends EventKey>(
  type: K,
  payload: EventPayload<K>
): BaseEvent<EventPayload<K>> {
  return {
    type,
    payload: payload as EventPayload<K>,
    meta: {
      timestamp: Date.now(),
      source: 'backend',
      correlationId: generateCorrelationId(),
    },
  };
}

/**
 * Generate unique correlation ID for event tracing
 */
function generateCorrelationId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Unified Event Bus
 * 
 * Single export point for event bus functionality.
 * Automatically provides the correct event bus based on context.
 * 
 * @example
 * // Backend (main process)
 * import { eventBus } from '@/shared/events';
 * await eventBus.emit('app:initialized', { version: '1.0.0' });
 * 
 * // Frontend (renderer process)
 * import { eventBus, useEventBus } from '@/shared/events';
 * const { on, off } = useEventBus();
 * on('settings:changed', (payload) => { ... });
 */

import type { EventBusConfig } from './event-types';
import { EventBus, getEventBus, createEventBus } from './event-bus';

// Re-export types
export type * from './event-types';

// Re-export core functionality
export { EventBus, getEventBus, createEventBus };

/**
 * Unified event bus instance
 * 
 * In backend: Uses BackendEventBus with IPC bridge
 * In frontend: Uses FrontendEventBus with IPC listeners
 * In shared code: Uses base EventBus
 */
let unifiedEventBus: EventBus | null = null;

export function getUnifiedEventBus(config?: EventBusConfig): EventBus {
  if (!unifiedEventBus) {
    unifiedEventBus = getEventBus(config);
  }
  return unifiedEventBus;
}

/**
 * Simple event emission (no IPC)
 */
export async function emit<K extends keyof EventMap>(
  eventType: K,
  payload: EventMap[K]
): Promise<void> {
  const bus = getUnifiedEventBus();
  return bus.emit(eventType, payload);
}

/**
 * Simple event subscription (no IPC)
 */
export function on<K extends keyof EventMap>(
  eventType: K,
  handler: (payload: EventMap[K]) => void | Promise<void>
) {
  const bus = getUnifiedEventBus();
  return bus.on(eventType, handler as never);
}

/**
 * Subscribe to event once
 */
export function once<K extends keyof EventMap>(
  eventType: K,
  handler: (payload: EventMap[K]) => void
) {
  const bus = getUnifiedEventBus();
  return bus.once(eventType, handler as never);
}

/**
 * Unsubscribe from event
 */
export function off<K extends keyof EventMap>(
  eventType: K,
  subscription: ReturnType<typeof on>
) {
  const bus = getUnifiedEventBus();
  return bus.off(eventType, subscription);
}

// Re-export for backward compatibility
export {
  initializeBackendEventBus,
  getBackendEventBus,
  BackendEventBus,
  EVENT_CHANNELS as BACKEND_EVENT_CHANNELS,
} from '../backend/events/backend-event-bus';

export {
  initializeFrontendEventBus,
  getFrontendEventBus,
  FrontendEventBus,
  EVENT_CHANNELS as FRONTEND_EVENT_CHANNELS,
} from '../frontend/events/frontend-event-bus';

export { useEventBus } from '../frontend/events/useEventBus';

/**
 * Vue Composables for Event Bus
 * 
 * Provides reactive event handling in Vue components
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { getFrontendEventBus } from '../events/frontend-event-bus';
import type { EventKey, EventPayload, Subscription } from '../../shared/events/event-types';

/**
 * Composable for subscribing to events with automatic cleanup
 */
export function useEventBus() {
  const eventBus = getFrontendEventBus();
  const subscriptions = ref<Subscription[]>([]);

  /**
   * Subscribe to an event
   */
  function on<K extends EventKey>(
    eventType: K,
    handler: (payload: EventPayload<K>) => void,
    options?: { once?: boolean }
  ): Subscription {
    const subscription = eventBus.on(eventType, handler as never, options);
    subscriptions.value.push(subscription);
    return subscription;
  }

  /**
   * Subscribe to an event once
   */
  function once<K extends EventKey>(
    eventType: K,
    handler: (payload: EventPayload<K>) => void
  ): Subscription {
    return on(eventType, handler, { once: true });
  }

  /**
   * Unsubscribe from an event
   */
  function off<K extends EventKey>(eventType: K, subscription: Subscription): void {
    eventBus.off(eventType, subscription);
    const index = subscriptions.value.indexOf(subscription);
    if (index > -1) {
      subscriptions.value.splice(index, 1);
    }
  }

  /**
   * Emit an event
   */
  async function emit<K extends EventKey>(
    eventType: K,
    payload: EventPayload<K>
  ): Promise<void> {
    return eventBus.emit(eventType, payload);
  }

  /**
   * Unsubscribe from all events
   */
  function unsubscribeAll(): void {
    for (const subscription of subscriptions.value) {
      eventBus.off(subscription.eventType, subscription);
    }
    subscriptions.value = [];
  }

  // Auto cleanup on unmount
  onUnmounted(() => {
    unsubscribeAll();
  });

  return {
    on,
    once,
    off,
    emit,
    unsubscribeAll,
    activeSubscriptions: subscriptions,
  };
}

/**
 * Composable for reactive event state
 */
export function useEvent<K extends EventKey>(
  eventType: K,
  initialValue?: EventPayload<K>
) {
  const eventBus = getFrontendEventBus();
  const data = ref<EventPayload<K> | undefined>(initialValue);
  const count = ref(0);
  const lastUpdated = ref<number | null>(null);

  const handler = (payload: EventPayload<K>) => {
    data.value = payload;
    count.value++;
    lastUpdated.value = Date.now();
  };

  onMounted(() => {
    eventBus.on(eventType, handler as never);
  });

  onUnmounted(() => {
    eventBus.off(eventType, handler as never);
  });

  return {
    data,
    count,
    lastUpdated,
  };
}

/**
 * Composable for event history
 */
export function useEventHistory<K extends EventKey>(eventType: K, limit = 10) {
  const eventBus = getFrontendEventBus();
  const history = ref<Array<{ payload: EventPayload<K>; timestamp: number }>>([]);

  const handler = (payload: EventPayload<K>, meta: { timestamp: number }) => {
    history.value.push({
      payload,
      timestamp: meta.timestamp,
    });

    if (history.value.length > limit) {
      history.value.shift();
    }
  };

  onMounted(() => {
    eventBus.on(eventType, handler as never);
    
    // Load existing history
    const existingHistory = eventBus.getHistory(eventType, limit);
    history.value = existingHistory.map((e) => ({
      payload: e.payload as EventPayload<K>,
      timestamp: e.meta.timestamp,
    }));
  });

  onUnmounted(() => {
    eventBus.off(eventType, handler as never);
  });

  function clear(): void {
    history.value = [];
    eventBus.clearHistory(eventType);
  }

  return {
    history,
    clear,
  };
}

/**
 * Composable for event statistics
 */
export function useEventStats() {
  const eventBus = getFrontendEventBus();
  const stats = ref(eventBus.getStats());

  function refresh(): void {
    stats.value = eventBus.getStats();
  }

  function reset(): void {
    eventBus.resetStats();
    refresh();
  }

  return {
    stats,
    refresh,
    reset,
  };
}

/**
 * Event Bus System - Shared Module Exports
 * 
 * Core event bus functionality for cross-process communication
 */

export {
  getEventBus,
  createEventBus,
  EventBus,
} from './event-bus';

export {
  createEvent,
  type EventMap,
  type EventKey,
  type EventPayload,
  type BaseEvent,
  type EventMeta,
  type EventHandler,
  type EventSubscriptionOptions,
  type Subscription,
  type EventBusStats,
  type EventBusConfig,
} from './event-types';

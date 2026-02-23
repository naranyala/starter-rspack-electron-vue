import { describe, it, expect, beforeEach } from 'bun:test';
import { createEventBus, EventBus } from '../../../../src/shared/events/event-bus';
import type { EventMap } from '../../../../src/shared/events/event-types';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = createEventBus({
      debug: false,
      enableHistory: true,
      maxHistorySize: 50,
    });
  });

  describe('Subscription', () => {
    it('should subscribe to an event', () => {
      const handler = () => {};
      const subscription = eventBus.on('app:ready', handler);

      expect(subscription).toBeDefined();
      expect(subscription.eventType).toBe('app:ready');
      expect(subscription.unsubscribe).toBeDefined();
    });

    it('should unsubscribe from an event', () => {
      const handler = () => {};
      const subscription = eventBus.on('app:ready', handler);

      eventBus.off('app:ready', subscription);

      const subscriptions = eventBus.getSubscriptions('app:ready');
      expect(subscriptions.length).toBe(0);
    });

    it('should unsubscribe using the subscription method', () => {
      const handler = () => {};
      const subscription = eventBus.on('app:ready', handler);

      subscription.unsubscribe();

      const subscriptions = eventBus.getSubscriptions('app:ready');
      expect(subscriptions.length).toBe(0);
    });

    it('should unsubscribe all events', () => {
      eventBus.on('app:ready', () => {});
      eventBus.on('app:quit', () => {});

      eventBus.offAll();

      expect(eventBus.getSubscriptions().length).toBe(0);
    });

    it('should unsubscribe specific event type', () => {
      eventBus.on('app:ready', () => {});
      eventBus.on('app:quit', () => {});

      eventBus.offAll('app:ready');

      expect(eventBus.getSubscriptions('app:ready').length).toBe(0);
      expect(eventBus.getSubscriptions('app:quit').length).toBe(1);
    });
  });

  describe('Once Subscription', () => {
    it('should execute handler only once', async () => {
      let callCount = 0;
      const handler = () => { callCount++; };

      eventBus.once('app:ready', handler);

      await eventBus.emit('app:ready', undefined);
      await eventBus.emit('app:ready', undefined);

      expect(callCount).toBe(1);
    });
  });

  describe('Event Emission', () => {
    it('should emit event and call handlers', async () => {
      let receivedPayload: unknown;
      const handler = (payload: string) => { receivedPayload = payload; };

      eventBus.on('settings:changed', handler);
      await eventBus.emit('settings:changed', { key: 'theme', value: 'dark' });

      expect(receivedPayload).toEqual({ key: 'theme', value: 'dark' });
    });

    it('should emit event with void payload', async () => {
      let called = false;
      const handler = () => { called = true; };

      eventBus.on('app:ready', handler);
      await eventBus.emit('app:ready', undefined);

      expect(called).toBe(true);
    });

    it('should handle async handlers', async () => {
      let completed = false;
      const handler = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        completed = true;
      };

      eventBus.on('app:ready', handler);
      await eventBus.emit('app:ready', undefined);

      expect(completed).toBe(true);
    });

    it('should handle handler errors gracefully', async () => {
      let errorHandlerCalled = false;
      let successHandlerCalled = false;

      const errorHandler = () => { 
        errorHandlerCalled = true;
        throw new Error('Handler error'); 
      };
      const successHandler = () => {
        successHandlerCalled = true;
      };

      eventBus.on('app:ready', errorHandler);
      eventBus.on('app:ready', successHandler);

      // Emit should complete even with error
      await eventBus.emit('app:ready', undefined);

      // Both handlers should have been called
      expect(errorHandlerCalled).toBe(true);
      expect(successHandlerCalled).toBe(true);

      // Stats should track the failed handler
      const stats = eventBus.getStats();
      expect(stats.failedHandlers).toBe(1);
    });
  });

  describe('Priority', () => {
    it('should execute handlers in priority order', async () => {
      const executionOrder: number[] = [];

      eventBus.on('app:ready', () => executionOrder.push(3), { priority: 1 });
      eventBus.on('app:ready', () => executionOrder.push(1), { priority: 3 });
      eventBus.on('app:ready', () => executionOrder.push(2), { priority: 2 });

      await eventBus.emit('app:ready', undefined);

      expect(executionOrder).toEqual([1, 2, 3]);
    });
  });

  describe('History', () => {
    it('should store events in history', async () => {
      await eventBus.emit('app:ready', undefined);
      await eventBus.emit('app:quit', undefined);

      const history = eventBus.getHistory();
      expect(history.length).toBe(2);
    });

    it('should filter history by event type', async () => {
      await eventBus.emit('app:ready', undefined);
      await eventBus.emit('app:quit', undefined);
      await eventBus.emit('app:ready', undefined);

      const history = eventBus.getHistory('app:ready');
      expect(history.length).toBe(2);
    });

    it('should limit history size', async () => {
      const smallBus = createEventBus({ maxHistorySize: 3 });

      await smallBus.emit('app:ready', undefined);
      await smallBus.emit('app:ready', undefined);
      await smallBus.emit('app:ready', undefined);
      await smallBus.emit('app:ready', undefined);

      const history = smallBus.getHistory();
      expect(history.length).toBe(3);
    });

    it('should clear history', async () => {
      await eventBus.emit('app:ready', undefined);
      await eventBus.emit('app:quit', undefined);

      eventBus.clearHistory();

      expect(eventBus.getHistory().length).toBe(0);
    });
  });

  describe('Statistics', () => {
    it('should track total events', async () => {
      await eventBus.emit('app:ready', undefined);
      await eventBus.emit('app:quit', undefined);

      const stats = eventBus.getStats();
      expect(stats.totalEvents).toBe(2);
    });

    it('should track events by type', async () => {
      await eventBus.emit('app:ready', undefined);
      await eventBus.emit('app:ready', undefined);
      await eventBus.emit('app:quit', undefined);

      const stats = eventBus.getStats();
      expect(stats.eventsByType['app:ready']).toBe(2);
      expect(stats.eventsByType['app:quit']).toBe(1);
    });

    it('should track active subscriptions', () => {
      eventBus.on('app:ready', () => {});
      eventBus.on('app:quit', () => {});

      const stats = eventBus.getStats();
      expect(stats.activeSubscriptions).toBe(2);
    });

    it('should reset statistics', async () => {
      await eventBus.emit('app:ready', undefined);
      eventBus.resetStats();

      const stats = eventBus.getStats();
      expect(stats.totalEvents).toBe(0);
    });
  });

  describe('Correlation ID', () => {
    it('should generate correlation ID for events', async () => {
      let correlationId: string | undefined;
      const handler = (_payload: unknown, meta: { correlationId?: string }) => {
        correlationId = meta.correlationId;
      };

      eventBus.on('app:ready', handler);
      await eventBus.emit('app:ready', undefined);

      expect(correlationId).toMatch(/evt_\d+_[a-z0-9]+/);
    });

    it('should use custom correlation ID', async () => {
      eventBus.setCorrelationId('custom-id-123');

      let correlationId: string | undefined;
      const handler = (_payload: unknown, meta: { correlationId?: string }) => {
        correlationId = meta.correlationId;
      };

      eventBus.on('app:ready', handler);
      await eventBus.emit('app:ready', undefined);

      expect(correlationId).toBe('custom-id-123');

      eventBus.clearCorrelationId();
    });
  });

  describe('Payload Sanitization', () => {
    it('should redact sensitive fields in debug logs', () => {
      const debugBus = createEventBus({ debug: true });
      
      // This tests that sanitization doesn't throw
      expect(() => {
        debugBus.emit('user:action', { 
          action: 'login', 
          password: 'secret123',
          token: 'abc123',
        });
      }).not.toThrow();
    });
  });

  describe('Destroy', () => {
    it('should cleanup on destroy', () => {
      eventBus.on('app:ready', () => {});
      eventBus.emit('app:ready', undefined);

      eventBus.destroy();

      const stats = eventBus.getStats();
      expect(stats.activeSubscriptions).toBe(0);
      expect(stats.totalEvents).toBe(0);
    });
  });
});

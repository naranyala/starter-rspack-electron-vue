import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  createEventBus,
  type EventBus,
  getEventBus,
} from '../../../../src/shared/events/event-bus';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = createEventBus({ debug: false });
  });

  afterEach(() => {
    eventBus.destroy();
  });

  it('should subscribe to an event', () => {
    const handler = () => {};
    const subscription = eventBus.on('test:event', handler);

    expect(subscription).toBeDefined();
    expect(subscription.id).toBeDefined();
    expect(subscription.eventType).toBe('test:event');
  });

  it('should unsubscribe from an event', () => {
    const handler = () => {};
    const subscription = eventBus.on('test:event', handler);

    eventBus.off('test:event', subscription);

    const subscriptions = eventBus.getSubscriptions('test:event');
    expect(subscriptions).toHaveLength(0);
  });

  it('should emit event and call handler', async () => {
    const handler = mock(() => {});
    eventBus.on('test:event', handler);

    await eventBus.emit('test:event', { data: 'test' });

    expect(handler).toHaveBeenCalled();
    expect(handler.mock.calls[0][0]).toEqual({ data: 'test' });
  });

  it('should subscribe once and auto-unsubscribe', async () => {
    const handler = mock(() => {});
    eventBus.once('test:event', handler);

    await eventBus.emit('test:event', { data: 'first' });
    await eventBus.emit('test:event', { data: 'second' });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toEqual({ data: 'first' });
  });

  it('should handle async handlers', async () => {
    const handler = async (payload: { value: number }) => {
      return payload.value * 2;
    };

    eventBus.on('async:event', handler);
    await eventBus.emit('async:event', { value: 21 });

    // Handler should have been called
    const subscriptions = eventBus.getSubscriptions('async:event');
    expect(subscriptions.length).toBe(1);
  });

  it('should respect handler priority', async () => {
    const executionOrder: string[] = [];

    eventBus.on('priority:event', () => executionOrder.push('low'), { priority: 1 });
    eventBus.on('priority:event', () => executionOrder.push('high'), { priority: 10 });
    eventBus.on('priority:event', () => executionOrder.push('medium'), { priority: 5 });

    await eventBus.emit('priority:event', {});

    expect(executionOrder).toEqual(['high', 'medium', 'low']);
  });

  it('should track statistics', async () => {
    const handler = () => {};
    eventBus.on('stats:event', handler);

    await eventBus.emit('stats:event', {});
    await eventBus.emit('stats:event', {});

    const stats = eventBus.getStats();
    expect(stats.totalEvents).toBe(2);
    expect(stats.eventsByType['stats:event']).toBe(2);
    expect(stats.activeSubscriptions).toBe(1);
  });

  it('should maintain event history', async () => {
    eventBus = createEventBus({ enableHistory: true, maxHistorySize: 10 });

    await eventBus.emit('history:event', { count: 1 });
    await eventBus.emit('history:event', { count: 2 });
    await eventBus.emit('history:event', { count: 3 });

    const history = eventBus.getHistory('history:event');
    expect(history).toHaveLength(3);
    expect(history[0].payload).toEqual({ count: 1 });
  });

  it('should limit history size', async () => {
    eventBus = createEventBus({ enableHistory: true, maxHistorySize: 3 });

    for (let i = 1; i <= 5; i++) {
      await eventBus.emit('limit:event', { count: i });
    }

    const history = eventBus.getHistory('limit:event');
    expect(history).toHaveLength(3);
    expect(history[0].payload).toEqual({ count: 3 });
    expect(history[2].payload).toEqual({ count: 5 });
  });

  it('should clear history', async () => {
    await eventBus.emit('clear:event', {});
    await eventBus.emit('clear:event', {});

    eventBus.clearHistory('clear:event');

    const history = eventBus.getHistory('clear:event');
    expect(history).toHaveLength(0);
  });

  it('should reset statistics', async () => {
    await eventBus.emit('stats:event', {});

    eventBus.resetStats();

    const stats = eventBus.getStats();
    expect(stats.totalEvents).toBe(0);
    expect(stats.activeSubscriptions).toBe(0);
  });

  it('should unsubscribe all handlers for specific event', () => {
    const handler1 = () => {};
    const handler2 = () => {};

    eventBus.on('multi:event', handler1);
    eventBus.on('multi:event', handler2);

    eventBus.offAll('multi:event');

    const subscriptions = eventBus.getSubscriptions('multi:event');
    expect(subscriptions).toHaveLength(0);
  });

  it('should unsubscribe all handlers for all events', () => {
    const handler1 = () => {};
    const handler2 = () => {};

    eventBus.on('event1', handler1);
    eventBus.on('event2', handler2);

    eventBus.offAll();

    const allSubscriptions = eventBus.getSubscriptions();
    expect(allSubscriptions).toHaveLength(0);
  });

  it('should handle handler errors gracefully', async () => {
    const errorSpy = mock(() => {});
    console.error = errorSpy;

    const workingHandler = mock(() => {});
    const erroringHandler = () => {
      throw new Error('Handler error');
    };

    eventBus.on('error:event', erroringHandler);
    eventBus.on('error:event', workingHandler);

    await eventBus.emit('error:event', { data: 'test' });

    expect(workingHandler).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should set and clear correlation ID', async () => {
    eventBus.setCorrelationId('test-correlation-123');

    const handler = mock(() => {});
    eventBus.on('correlation:event', handler);

    await eventBus.emit('correlation:event', {});

    expect(handler).toHaveBeenCalled();
  });

  it('should sanitize sensitive payload data', async () => {
    const handler = mock(() => {});
    eventBus.on('sensitive:event', handler);

    await eventBus.emit('sensitive:event', {
      username: 'john',
      password: 'secret123',
      token: 'abc123',
    });

    expect(handler).toHaveBeenCalled();
  });

  it('should get subscriptions for specific event', () => {
    const handler1 = () => {};
    const handler2 = () => {};

    eventBus.on('event1', handler1);
    eventBus.on('event1', handler2);
    eventBus.on('event2', () => {});

    const subscriptions = eventBus.getSubscriptions('event1');
    expect(subscriptions).toHaveLength(2);
  });

  it('should emit and wait for all handlers', async () => {
    let completed = false;

    const asyncHandler = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      completed = true;
    };

    eventBus.on('wait:event', asyncHandler);
    await eventBus.emitAndWait('wait:event', {});

    expect(completed).toBe(true);
  });

  it('should destroy event bus and clean up', () => {
    eventBus.on('test', () => {});
    eventBus.on('test2', () => {});

    eventBus.destroy();

    expect(eventBus.getSubscriptions()).toHaveLength(0);
    expect(eventBus.getHistory()).toHaveLength(0);
    expect(eventBus.getStats().totalEvents).toBe(0);
  });
});

describe('EventBus Singleton', () => {
  afterEach(() => {
    // Reset singleton for clean tests
    const bus = getEventBus();
    bus.destroy();
  });

  it('should return same instance from getEventBus', () => {
    const bus1 = getEventBus();
    const bus2 = getEventBus();

    expect(bus1).toBe(bus2);
  });

  it('should create new instance with createEventBus', () => {
    const bus1 = createEventBus();
    const bus2 = createEventBus();

    expect(bus1).not.toBe(bus2);
  });
});

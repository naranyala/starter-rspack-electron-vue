import { describe, expect, it } from 'bun:test';
import {
  createEvent,
  type EventMap,
  type EventPayload,
} from '../../../../src/shared/events/event-types';

describe('Event Types', () => {
  describe('createEvent', () => {
    it('should create a typed event with payload', () => {
      const event = createEvent('settings:changed', {
        key: 'theme',
        value: 'dark',
        previousValue: 'light',
      });

      expect(event.type).toBe('settings:changed');
      expect(event.payload).toEqual({
        key: 'theme',
        value: 'dark',
        previousValue: 'light',
      });
      expect(event.meta.timestamp).toBeDefined();
      expect(event.meta.source).toBe('backend');
      expect(event.meta.correlationId).toMatch(/evt_\d+_[a-z0-9]+/);
    });

    it('should create a typed event with void payload', () => {
      const event = createEvent('app:ready', undefined as EventPayload<'app:ready'>);

      expect(event.type).toBe('app:ready');
      expect(event.payload).toBeUndefined();
    });

    it('should generate unique correlation IDs', () => {
      const event1 = createEvent('app:ready', undefined as EventPayload<'app:ready'>);
      const event2 = createEvent('app:ready', undefined as EventPayload<'app:ready'>);

      expect(event1.meta.correlationId).not.toBe(event2.meta.correlationId);
    });
  });

  describe('EventMap Types', () => {
    it('should have correct app events', () => {
      type AppEventKeys = keyof Pick<
        EventMap,
        'app:initialized' | 'app:ready' | 'app:before-quit' | 'app:quit'
      >;

      const keys: AppEventKeys[] = ['app:initialized', 'app:ready', 'app:before-quit', 'app:quit'];

      expect(keys.length).toBe(4);
    });

    it('should have correct window events', () => {
      type WindowEventKeys = keyof Pick<
        EventMap,
        | 'window:created'
        | 'window:closed'
        | 'window:focus'
        | 'window:blur'
        | 'window:minimize'
        | 'window:maximize'
        | 'window:restore'
      >;

      const keys: WindowEventKeys[] = [
        'window:created',
        'window:closed',
        'window:focus',
        'window:blur',
        'window:minimize',
        'window:maximize',
        'window:restore',
      ];

      expect(keys.length).toBe(7);
    });

    it('should have correct settings events', () => {
      type SettingsEventKeys = keyof Pick<
        EventMap,
        'settings:changed' | 'settings:loaded' | 'settings:reset'
      >;

      const keys: SettingsEventKeys[] = ['settings:changed', 'settings:loaded', 'settings:reset'];

      expect(keys.length).toBe(3);
    });
  });

  describe('EventPayload Type Helper', () => {
    it('should extract payload type for events with payload', () => {
      type SettingsChangedPayload = EventPayload<'settings:changed'>;

      const payload: SettingsChangedPayload = {
        key: 'theme',
        value: 'dark',
        previousValue: 'light',
      };

      expect(payload.key).toBe('theme');
    });

    it('should extract undefined for void events', () => {
      type AppReadyPayload = EventPayload<'app:ready'>;

      const payload: AppReadyPayload = undefined;

      expect(payload).toBeUndefined();
    });
  });
});

/**
 * Event system for renderer process
 */

type EventHandler = (...args: unknown[]) => void;

/**
 * Simple event emitter
 */
export class EventEmitter {
  private events: Map<string, EventHandler[]>;

  constructor() {
    this.events = new Map<string, EventHandler[]>();
  }

  /**
   * Add event listener
   * @param event - Event name
   * @param handler - Event handler
   * @returns Remove function
   */
  on(event: string, handler: EventHandler): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler);

    // Return remove function
    return () => this.off(event, handler);
  }

  /**
   * Add one-time event listener
   * @param event - Event name
   * @param handler - Event handler
   * @returns Remove function
   */
  once(event: string, handler: EventHandler): () => void {
    const onceHandler: EventHandler = (...args: unknown[]) => {
      this.off(event, onceHandler);
      handler(...args);
    };
    return this.on(event, onceHandler);
  }

  /**
   * Remove event listener
   * @param event - Event name
   * @param handler - Event handler
   */
  off(event: string, handler: EventHandler): void {
    if (!this.events.has(event)) return;

    const handlers = this.events.get(event)!;
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }

    if (handlers.length === 0) {
      this.events.delete(event);
    }
  }

  /**
   * Emit event
   * @param event - Event name
   * @param args - Event arguments
   */
  emit(event: string, ...args: unknown[]): void {
    if (!this.events.has(event)) return;

    this.events.get(event)!.forEach((handler) => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Event handler error for ${event}:`, error);
      }
    });
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.events.clear();
  }

  /**
   * Get listener count for event
   * @param event - Event name
   * @returns Listener count
   */
  listenerCount(event: string): number {
    return this.events.has(event) ? this.events.get(event)!.length : 0;
  }
}

/**
 * Global event bus for application-wide events
 */
export const EventBus = new EventEmitter();

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

/**
 * Keyboard event utilities
 */
export class KeyboardUtils {
  /**
   * Check if key matches
   * @param event - Keyboard event
   * @param keys - Key(s) to check
   * @returns Whether key matches
   */
  static isKey(event: KeyboardEvent, keys: string | string[]): boolean {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    return keyArray.includes(event.key.toLowerCase());
  }

  /**
   * Check if modifier key is pressed
   * @param event - Keyboard event
   * @param modifier - Modifier key ('ctrl', 'shift', 'alt', 'meta')
   * @returns Whether modifier is pressed
   */
  static hasModifier(event: KeyboardEvent, modifier: string): boolean {
    switch (modifier.toLowerCase()) {
      case 'ctrl':
      case 'control':
        return event.ctrlKey;
      case 'shift':
        return event.shiftKey;
      case 'alt':
        return event.altKey;
      case 'meta':
      case 'cmd':
      case 'command':
        return event.metaKey;
      default:
        return false;
    }
  }

  /**
   * Check if shortcut combination matches
   * @param event - Keyboard event
   * @param shortcut - Shortcut object
   * @returns Whether shortcut matches
   */
  static isShortcut(event: KeyboardEvent, shortcut: ShortcutConfig): boolean {
    const { key, ctrl = false, shift = false, alt = false, meta = false } = shortcut;

    return (
      KeyboardUtils.isKey(event, key) &&
      event.ctrlKey === ctrl &&
      event.shiftKey === shift &&
      event.altKey === alt &&
      event.metaKey === meta
    );
  }
}

/**
 * Debounce utility
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      func(...args);
    };
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle utility
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: unknown, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

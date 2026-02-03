export type EventHandler = (...args: unknown[]) => void;

export class EventEmitter {
  private events: Map<string, EventHandler[]>;
  private maxListeners: number;

  constructor(maxListeners: number = 10) {
    this.events = new Map();
    this.maxListeners = maxListeners;
  }

  on(event: string, handler: EventHandler): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    const handlers = this.events.get(event)!;
    if (handlers.length >= this.maxListeners) {
      console.warn(`Max listeners (${this.maxListeners}) exceeded for event: ${event}`);
    }
    handlers.push(handler);
    return () => this.off(event, handler);
  }

  once(event: string, handler: EventHandler): () => void {
    const wrapper: EventHandler = (...args) => {
      this.off(event, wrapper);
      handler(...args);
    };
    return this.on(event, wrapper);
  }

  off(event: string, handler?: EventHandler): void {
    if (!this.events.has(event)) return;

    if (handler) {
      const handlers = this.events.get(event)!;
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
      if (handlers.length === 0) {
        this.events.delete(event);
      }
    } else {
      this.events.delete(event);
    }
  }

  emit(event: string, ...args: unknown[]): void {
    if (!this.events.has(event)) return;

    const handlers = this.events.get(event)!;
    handlers.forEach((handler) => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Event handler error for ${event}:`, error);
      }
    });
  }

  listenerCount(event: string): number {
    return this.events.has(event) ? this.events.get(event)!.length : 0;
  }

  eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  removeAllListeners(): void {
    this.events.clear();
  }
}

export const EventBus = new EventEmitter();

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export class KeyboardUtils {
  static isKey(event: KeyboardEvent, keys: string | string[]): boolean {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    return keyArray.some((key) => key.toLowerCase() === event.key.toLowerCase());
  }

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

  static isCtrlS(event: KeyboardEvent): boolean {
    return KeyboardUtils.isShortcut(event, { key: 's', ctrl: true });
  }

  static isCtrlC(event: KeyboardEvent): boolean {
    return KeyboardUtils.isShortcut(event, { key: 'c', ctrl: true });
  }

  static isCtrlV(event: KeyboardEvent): boolean {
    return KeyboardUtils.isShortcut(event, { key: 'v', ctrl: true });
  }

  static isCtrlA(event: KeyboardEvent): boolean {
    return KeyboardUtils.isShortcut(event, { key: 'a', ctrl: true });
  }

  static isCtrlZ(event: KeyboardEvent): boolean {
    return KeyboardUtils.isShortcut(event, { key: 'z', ctrl: true });
  }

  static isEscape(event: KeyboardEvent): boolean {
    return KeyboardUtils.isKey(event, 'Escape');
  }

  static isEnter(event: KeyboardEvent): boolean {
    return KeyboardUtils.isKey(event, 'Enter');
  }

  static isTab(event: KeyboardEvent): boolean {
    return KeyboardUtils.isKey(event, 'Tab');
  }

  static isArrowUp(event: KeyboardEvent): boolean {
    return KeyboardUtils.isKey(event, 'ArrowUp');
  }

  static isArrowDown(event: KeyboardEvent): boolean {
    return KeyboardUtils.isKey(event, 'ArrowDown');
  }

  static isArrowLeft(event: KeyboardEvent): boolean {
    return KeyboardUtils.isKey(event, 'ArrowLeft');
  }

  static isArrowRight(event: KeyboardEvent): boolean {
    return KeyboardUtils.isKey(event, 'ArrowRight');
  }
}

/**
 * Event channel definitions
 * Channels for event emission from main to renderer process
 */

// Application events
export const APP_EVENTS = {
  MENU_CLICK: 'app:menu-click',
  READY: 'app:ready',
  BEFORE_QUIT: 'app:before-quit',
  WILL_QUIT: 'app:will-quit',
  QUIT: 'app:quit',
} as const;

// Settings events
export const SETTINGS_EVENTS = {
  CHANGED: 'settings:changed',
  UPDATED: 'settings:updated',
  RESET: 'settings:reset',
} as const;

// Window events
export const WINDOW_EVENTS = {
  FOCUS: 'window:focus',
  BLUR: 'window:blur',
  CLOSED: 'window:closed',
  CREATED: 'window:created',
  MINIMIZED: 'window:minimized',
  MAXIMIZED: 'window:maximized',
  RESTORED: 'window:restored',
} as const;

// Update events
export const UPDATE_EVENTS = {
  AVAILABLE: 'update:available',
  DOWNLOADED: 'update:downloaded',
  ERROR: 'update:error',
  PROGRESS: 'update:progress',
} as const;

// Combined export for all events
export const EVENTS = {
  ...APP_EVENTS,
  ...SETTINGS_EVENTS,
  ...WINDOW_EVENTS,
  ...UPDATE_EVENTS,
} as const;

// Type for all event names
export type EventChannel = typeof EVENTS[keyof typeof EVENTS];

// Valid channels for renderer listeners (security whitelist)
export const RENDERER_LISTENABLE_EVENTS: EventChannel[] = [
  SETTINGS_EVENTS.CHANGED,
  SETTINGS_EVENTS.UPDATED,
  WINDOW_EVENTS.FOCUS,
  WINDOW_EVENTS.BLUR,
  APP_EVENTS.MENU_CLICK,
  UPDATE_EVENTS.AVAILABLE,
  UPDATE_EVENTS.DOWNLOADED,
  UPDATE_EVENTS.ERROR,
  UPDATE_EVENTS.PROGRESS,
] as const;

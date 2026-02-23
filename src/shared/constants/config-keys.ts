/**
 * Configuration key definitions
 * Centralized keys for application settings and configuration
 */

// Application settings
export const APP_CONFIG_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  AUTO_SAVE: 'autoSave',
  START_ON_LOGIN: 'startOnLogin',
  MINIMIZE_TO_TRAY: 'minimizeToTray',
  CLOSE_TO_TRAY: 'closeToTray',
} as const;

// Window settings
export const WINDOW_CONFIG_KEYS = {
  WIDTH: 'window.width',
  HEIGHT: 'window.height',
  X: 'window.x',
  Y: 'window.y',
  IS_MAXIMIZED: 'window.isMaximized',
  STATE: 'window.state',
} as const;

// Development settings
export const DEV_CONFIG_KEYS = {
  DEV_TOOLS_AUTO_OPEN: 'dev.autoOpenDevTools',
  HOT_RELOAD: 'dev.hotReload',
  LOG_LEVEL: 'dev.logLevel',
} as const;

// Update settings
export const UPDATE_CONFIG_KEYS = {
  AUTO_CHECK: 'update.autoCheck',
  AUTO_DOWNLOAD: 'update.autoDownload',
  AUTO_INSTALL: 'update.autoInstall',
  CHANNEL: 'update.channel',
} as const;

// Combined export for all config keys
export const CONFIG_KEYS = {
  ...APP_CONFIG_KEYS,
  ...WINDOW_CONFIG_KEYS,
  ...DEV_CONFIG_KEYS,
  ...UPDATE_CONFIG_KEYS,
} as const;

// Type for all config keys
export type ConfigKey = typeof CONFIG_KEYS[keyof typeof CONFIG_KEYS];

// Default configuration values
export const DEFAULT_CONFIG: Record<ConfigKey, unknown> = {
  [APP_CONFIG_KEYS.THEME]: 'light',
  [APP_CONFIG_KEYS.LANGUAGE]: 'en',
  [APP_CONFIG_KEYS.AUTO_SAVE]: true,
  [APP_CONFIG_KEYS.START_ON_LOGIN]: false,
  [APP_CONFIG_KEYS.MINIMIZE_TO_TRAY]: false,
  [APP_CONFIG_KEYS.CLOSE_TO_TRAY]: false,
  [WINDOW_CONFIG_KEYS.WIDTH]: 1200,
  [WINDOW_CONFIG_KEYS.HEIGHT]: 800,
  [WINDOW_CONFIG_KEYS.X]: undefined,
  [WINDOW_CONFIG_KEYS.Y]: undefined,
  [WINDOW_CONFIG_KEYS.IS_MAXIMIZED]: false,
  [WINDOW_CONFIG_KEYS.STATE]: 'normal',
  [DEV_CONFIG_KEYS.DEV_TOOLS_AUTO_OPEN]: false,
  [DEV_CONFIG_KEYS.HOT_RELOAD]: true,
  [DEV_CONFIG_KEYS.LOG_LEVEL]: 'info',
  [UPDATE_CONFIG_KEYS.AUTO_CHECK]: true,
  [UPDATE_CONFIG_KEYS.AUTO_DOWNLOAD]: false,
  [UPDATE_CONFIG_KEYS.AUTO_INSTALL]: false,
  [UPDATE_CONFIG_KEYS.CHANNEL]: 'latest',
} as const;

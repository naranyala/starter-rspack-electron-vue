/**
 * IPC Channel definitions
 * Centralized channel names for inter-process communication
 * Use these constants instead of string literals to prevent typos
 */

// App channels
export const APP_CHANNELS = {
  GET_VERSION: 'app:getVersion',
  GET_NAME: 'app:getName',
} as const;

// Settings channels
export const SETTINGS_CHANNELS = {
  GET: 'settings:get',
  SET: 'settings:set',
  GET_ALL: 'settings:getAll',
} as const;

// Window channels
export const WINDOW_CHANNELS = {
  MINIMIZE: 'window:minimize',
  MAXIMIZE: 'window:maximize',
  CLOSE: 'window:close',
} as const;

// Dialog channels
export const DIALOG_CHANNELS = {
  SHOW_MESSAGE_BOX: 'dialog:showMessageBox',
} as const;

// Use case channels - Electron demos
export const ELECTRON_CHANNELS = {
  // Intro
  INTRO_GET_STARTED: 'electron:intro.getStarted',
  INTRO_SHOW_TOC: 'electron:intro.showToc',
  
  // Architecture
  ARCH_GET_OVERVIEW: 'electron:architecture.getOverview',
  ARCH_GET_PROCESS_INFO: 'electron:architecture.getProcessInfo',
  
  // Security
  SECURITY_GET_BEST_PRACTICES: 'electron:security.getBestPractices',
  SECURITY_CHECK_STATUS: 'electron:security.checkStatus',
  
  // Packaging
  PACKAGING_GET_GUIDE: 'electron:packaging.getGuide',
  PACKAGING_GET_PLATFORM_INFO: 'electron:packaging.getPlatformInfo',
  
  // Native APIs
  NATIVE_GET_APIS: 'electron:native.getApis',
  NATIVE_GET_EXAMPLE: 'electron:native.getExample',
  
  // Performance
  PERFORMANCE_GET_TIPS: 'electron:performance.getTips',
  PERFORMANCE_GET_METRICS: 'electron:performance.getMetrics',
  
  // Development
  DEV_GET_WORKFLOW: 'electron:development.getWorkflow',
  DEV_GET_DEBUGGING_TIPS: 'electron:development.getDebuggingTips',
  
  // Versions
  VERSIONS_GET_INFO: 'electron:versions.getInfo',
  VERSIONS_CHECK_UPDATE: 'electron:versions.checkUpdate',
} as const;

// Combined export for all channels
export const IPC_CHANNELS = {
  ...APP_CHANNELS,
  ...SETTINGS_CHANNELS,
  ...WINDOW_CHANNELS,
  ...DIALOG_CHANNELS,
  ...ELECTRON_CHANNELS,
} as const;

// Type for all channel names
export type IPCChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];

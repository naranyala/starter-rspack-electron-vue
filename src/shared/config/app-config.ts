/**
 * Application configuration
 * Runtime configuration for the application
 */

import { getEnvConfig, isDevelopment } from './env-config.ts';

/**
 * Main window configuration
 */
export interface MainWindowConfig {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  title: string;
  show: boolean;
}

/**
 * Application configuration interface
 */
export interface AppConfig {
  appName: string;
  appVersion: string;
  mainWindow: MainWindowConfig;
  isDevelopment: boolean;
  enableDevTools: boolean;
  logLevel: string;
}

/**
 * Default application configuration
 */
export const appConfig: AppConfig = {
  appName: 'Electron Vue Rspack Starter',
  appVersion: process.env.npm_package_version || '0.1.0',
  mainWindow: {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Electron Vue Rspack Starter',
    show: false,
  },
  isDevelopment: isDevelopment(),
  enableDevTools: getEnvConfig().ENABLE_DEVTOOLS,
  logLevel: getEnvConfig().LOG_LEVEL,
};

/**
 * Get a specific configuration value
 */
export function getConfig<K extends keyof AppConfig>(key: K): AppConfig[K] {
  return appConfig[key];
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: string): boolean {
  const featureFlags: Record<string, boolean> = {
    devTools: appConfig.enableDevTools,
    hotReload: appConfig.isDevelopment,
  };
  return featureFlags[feature] ?? false;
}

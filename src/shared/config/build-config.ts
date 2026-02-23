/**
 * Build configuration
 * Configuration for build and packaging processes
 */

import { getEnvConfig } from './env-config';

/**
 * Build configuration interface
 */
export interface BuildConfig {
  outputDir: string;
  publicPath: string;
  sourceMap: boolean;
  minify: boolean;
  target: 'electron-renderer' | 'electron-main' | 'web';
}

/**
 * Development build configuration
 */
export const devBuildConfig: BuildConfig = {
  outputDir: 'dist',
  publicPath: '/',
  sourceMap: true,
  minify: false,
  target: 'electron-renderer',
};

/**
 * Production build configuration
 */
export const prodBuildConfig: BuildConfig = {
  outputDir: 'dist',
  publicPath: './',
  sourceMap: false,
  minify: true,
  target: 'electron-renderer',
};

/**
 * Get build configuration based on environment
 */
export function getBuildConfig(): BuildConfig {
  const env = getEnvConfig();
  return env.NODE_ENV === 'production' ? prodBuildConfig : devBuildConfig;
}

/**
 * Platform-specific build configuration
 */
export const platformConfig = {
  linux: {
    target: ['AppImage', 'deb'],
    category: 'Utility',
  },
  win: {
    target: 'msi',
  },
  mac: {
    target: 'dmg',
    category: 'public.app-category.utilities',
  },
};

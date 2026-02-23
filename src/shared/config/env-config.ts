/**
 * Environment configuration loader
 * Loads and validates environment variables from .env files
 */

import { config as loadDotenv } from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Environment variable schema
 */
export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  ELECTRON_START_URL: string;
  BUILD_OUTPUT_DIR: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  ENABLE_DEVTOOLS: boolean;
  ENABLE_HMR: boolean;
}

/**
 * Default configuration values
 */
const DEFAULTS: EnvConfig = {
  NODE_ENV: 'development',
  PORT: 1234,
  ELECTRON_START_URL: 'http://localhost:1234',
  BUILD_OUTPUT_DIR: 'dist',
  LOG_LEVEL: 'info',
  ENABLE_DEVTOOLS: true,
  ENABLE_HMR: true,
};

/**
 * Load environment variables from .env files
 * Priority order:
 * 1. Process environment variables
 * 2. .env.{NODE_ENV}.local
 * 3. .env.{NODE_ENV}
 * 4. .env.local
 * 5. .env
 */
export function loadEnvConfig(): EnvConfig {
  const projectRoot = process.cwd();
  const nodeEnv = process.env.NODE_ENV || 'development';

  // List of env files to load in priority order (lowest to highest)
  const envFiles = [
    '.env',
    '.env.local',
    `.env.${nodeEnv}`,
    `.env.${nodeEnv}.local`,
  ];

  // Load each env file if it exists
  envFiles.forEach((file) => {
    const envPath = path.join(projectRoot, file);
    if (fs.existsSync(envPath)) {
      loadDotenv({ path: envPath });
    }
  });

  // Build config from environment with defaults
  const config: EnvConfig = {
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || DEFAULTS.NODE_ENV,
    PORT: parseInt(process.env.PORT || String(DEFAULTS.PORT), 10),
    ELECTRON_START_URL: process.env.ELECTRON_START_URL || DEFAULTS.ELECTRON_START_URL,
    BUILD_OUTPUT_DIR: process.env.BUILD_OUTPUT_DIR || DEFAULTS.BUILD_OUTPUT_DIR,
    LOG_LEVEL: (process.env.LOG_LEVEL as EnvConfig['LOG_LEVEL']) || DEFAULTS.LOG_LEVEL,
    ENABLE_DEVTOOLS: process.env.ENABLE_DEVTOOLS !== 'false',
    ENABLE_HMR: process.env.ENABLE_HMR !== 'false',
  };

  // Validate config
  validateConfig(config);

  return config;
}

/**
 * Validate environment configuration
 */
function validateConfig(config: EnvConfig): void {
  const validEnvs = ['development', 'production', 'test'];
  if (!validEnvs.includes(config.NODE_ENV)) {
    throw new Error(
      `Invalid NODE_ENV: ${config.NODE_ENV}. Must be one of: ${validEnvs.join(', ')}`
    );
  }

  const validLogLevels = ['debug', 'info', 'warn', 'error'];
  if (!validLogLevels.includes(config.LOG_LEVEL)) {
    throw new Error(
      `Invalid LOG_LEVEL: ${config.LOG_LEVEL}. Must be one of: ${validLogLevels.join(', ')}`
    );
  }

  if (config.PORT < 1 || config.PORT > 65535) {
    throw new Error(`Invalid PORT: ${config.PORT}. Must be between 1 and 65535`);
  }
}

/**
 * Get a single environment variable with type safety
 */
export function getEnv<K extends keyof EnvConfig>(
  key: K,
  defaultValue?: EnvConfig[K]
): EnvConfig[K] {
  const config = loadEnvConfig();
  return config[key] ?? (defaultValue as EnvConfig[K]);
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return loadEnvConfig().NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return loadEnvConfig().NODE_ENV === 'production';
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
  return loadEnvConfig().NODE_ENV === 'test';
}

// Cache the loaded config
let cachedConfig: EnvConfig | null = null;

/**
 * Get the cached environment configuration
 * Loads it if not already loaded
 */
export function getEnvConfig(): EnvConfig {
  if (!cachedConfig) {
    cachedConfig = loadEnvConfig();
  }
  return cachedConfig;
}

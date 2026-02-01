#!/usr/bin/env node
/**
 * Shared Utilities Module
 * Provides common functions used across all build scripts
 */

import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createLogger } from './logger';

const log = createLogger('utils');

// Package manager types
export type PackageManager = 'bun' | 'npm' | 'yarn';

/**
 * Check if a shell command exists
 */
export function commandExists(command: string): boolean {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if an npm package is installed
 */
export function packageExists(packageName: string): boolean {
  try {
    const packagePath = path.join(process.cwd(), 'node_modules', packageName);
    return fs.existsSync(packagePath);
  } catch {
    return false;
  }
}

/**
 * Detect the best available package manager
 */
export function detectPackageManager(): PackageManager {
  if (commandExists('bun')) {
    return 'bun';
  }
  if (commandExists('npm')) {
    return 'npm';
  }
  if (commandExists('yarn')) {
    return 'yarn';
  }

  log.fatal('No package manager found. Please install bun, npm, or yarn.');
  // This line is unreachable but needed for TypeScript
  throw new Error('No package manager found');
}

/**
 * Get install command arguments for a package manager
 */
export function getInstallArgs(
  manager: PackageManager,
  packageName: string,
  isDev: boolean = false
): string[] {
  switch (manager) {
    case 'bun':
      return ['add', packageName, isDev ? '--dev' : ''].filter(Boolean);
    case 'npm':
      return ['install', packageName, isDev ? '--save-dev' : ''].filter(Boolean);
    case 'yarn':
      return ['add', packageName, isDev ? '--dev' : ''].filter(Boolean);
    default:
      return ['add', packageName, isDev ? '--dev' : ''].filter(Boolean);
  }
}

/**
 * Execute a shell command with proper error handling
 */
export function executeCommand(
  command: string,
  args: string[],
  options: { stdio?: 'inherit' | 'pipe' | 'ignore'; env?: NodeJS.ProcessEnv } = {}
): Promise<number> {
  return new Promise((resolve, reject) => {
    log.command(command, args);

    const child = spawn(command, args, {
      stdio: options.stdio || 'inherit',
      env: options.env || process.env,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Install a package using the available package manager
 */
export async function installPackage(
  packageName: string,
  options: { dev?: boolean; retries?: number } = {}
): Promise<boolean> {
  const { dev = false, retries = 2 } = options;

  if (packageExists(packageName)) {
    log.debug(`${packageName} is already installed`);
    return true;
  }

  const manager = detectPackageManager();
  const args = getInstallArgs(manager, packageName, dev);

  log.warning(`${packageName} not found. Installing with ${manager}...`);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      log.info(`Installing ${packageName} (attempt ${attempt + 1}/${retries + 1})...`);
      await executeCommand(manager, args);
      log.success(`${packageName} installed successfully`);
      return true;
    } catch (error) {
      log.warning(
        `Failed to install ${packageName} (attempt ${attempt + 1}): ${(error as Error).message}`
      );

      if (attempt < retries) {
        log.info('Waiting 2 seconds before retry...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  log.error(`Failed to install ${packageName} after ${retries + 1} attempts`);
  return false;
}

/**
 * Ensure a directory exists, create if not
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log.debug(`Created directory: ${dirPath}`);
  }
}

/**
 * Copy a file from source to destination
 */
export function copyFile(source: string, dest: string): boolean {
  try {
    if (!fs.existsSync(source)) {
      log.warning(`Source file does not exist: ${source}`);
      return false;
    }

    ensureDir(path.dirname(dest));
    fs.copyFileSync(source, dest);
    log.success(`Copied: ${path.basename(source)}`);
    return true;
  } catch (error) {
    log.error(`Failed to copy ${source}: ${(error as Error).message}`);
    return false;
  }
}

/**
 * Kill processes on a specific port
 */
export async function killPort(port: number): Promise<void> {
  try {
    if (process.platform === 'win32') {
      // Windows: use netstat and taskkill
      try {
        const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
        const lines = result.trim().split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(parseInt(pid))) {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          }
        }
        log.success(`Killed processes on port ${port}`);
      } catch {
        // No processes found
      }
    } else {
      // Unix/Linux/Mac
      try {
        // Try fuser first
        execSync(`fuser -k ${port}/tcp`, { stdio: 'ignore' });
        log.success(`Killed processes on port ${port} using fuser`);
      } catch {
        // Fallback to lsof
        try {
          const pids = execSync(`lsof -ti :${port}`, { encoding: 'utf8' }).trim();
          if (pids) {
            execSync(`kill -9 ${pids}`, { stdio: 'ignore' });
            log.success(`Killed processes on port ${port} using lsof`);
          }
        } catch {
          log.debug(`No processes found on port ${port}`);
        }
      }
    }
  } catch (error) {
    log.warning(`Could not kill processes on port ${port}: ${(error as Error).message}`);
  }
}

/**
 * Wait for a server to be ready
 */
export async function waitForServer(
  url: string,
  timeout: number = 30000,
  interval: number = 1000
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        return true;
      }
    } catch {
      // Server not ready yet
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  return false;
}

/**
 * Get available port
 */
export async function getAvailablePort(preferredPort: number = 3000): Promise<number> {
  // Simple port check - just return preferred if available
  // In production, you'd want to actually check if port is in use
  return preferredPort;
}

/**
 * Project paths
 */
export const PATHS = {
  root: process.cwd(),
  src: path.join(process.cwd(), 'src'),
  dist: path.join(process.cwd(), 'dist'),
  assets: path.join(process.cwd(), 'src', 'assets'),
  icons: path.join(process.cwd(), 'src', 'assets', 'icons'),
  nodeModules: path.join(process.cwd(), 'node_modules'),
  electronBinary: path.join(process.cwd(), 'node_modules', '.bin', 'electron'),
} as const;

/**
 * Critical dependencies that must be installed
 */
export const CRITICAL_DEPS = ['electron', 'vue', '@rspack/cli', '@rspack/core', 'vue-loader'];

/**
 * Optional dependencies
 */
export const OPTIONAL_DEPS = ['winbox', 'electron-builder', '@biomejs/biome', 'typescript'];

// Re-export logger for convenience
export { createLogger, Logger } from './logger';

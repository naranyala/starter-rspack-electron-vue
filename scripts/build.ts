#!/usr/bin/env node

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
} as const;

function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message: string): void {
  log(`❌ ERROR: ${message}`, 'red');
}

function logSuccess(message: string): void {
  log(`✅ ${message}`, 'green');
}

function logWarning(message: string): void {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message: string): void {
  log(`ℹ️  ${message}`, 'blue');
}

// Execute command with promise
function _executeCommand(
  command: string,
  args: string[],
  options: Record<string, unknown> = {}
): Promise<number> {
  return new Promise((resolve, reject) => {
    logInfo(`Executing: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options,
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

// Copy icon files to dist directory
function copyIcons(): void {
  const assetsDir = path.join(__dirname, '..', 'src', 'assets');
  const distDir = path.join(__dirname, '..', 'dist');

  // Create dist directory if it doesn't exist
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Copy icon files
  const iconFiles = ['icon.png', 'icon.ico', 'icon.icns', 'icon.svg'];
  for (const iconFile of iconFiles) {
    const srcPath = path.join(assetsDir, 'icons', iconFile);
    const destPath = path.join(distDir, iconFile);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      logSuccess(`Copied ${iconFile} to dist directory`);
    } else {
      logWarning(`Icon file ${iconFile} not found at ${srcPath}`);
    }
  }
}

// Main function to handle command line arguments
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  try {
    switch (command) {
      case 'icons':
        copyIcons();
        break;
      default:
        copyIcons();
        logSuccess('Icon copying completed!');
        break;
    }
  } catch (error) {
    logError(`Operation failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main();
}

export { copyIcons };

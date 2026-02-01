#!/usr/bin/env node

import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import getPortModule from 'get-port';
import waitOn from 'wait-on';

// Handle both CommonJS and ES module formats for get-port
const getPort = typeof getPortModule === 'function' ? getPortModule : getPortModule.default;

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

// Check if a command exists
function commandExists(command: string): boolean {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch (_error) {
    return false;
  }
}

// Check if npm/bun package is installed
function packageExists(packageName: string): boolean {
  try {
    const packagePath = path.join(process.cwd(), 'node_modules', packageName);
    return fs.existsSync(packagePath);
  } catch (_error) {
    return false;
  }
}

// Enhanced Electron detection and installation
async function ensureElectronInstalled(): Promise<boolean> {
  const electronPkg = 'electron';

  // Check if electron is installed
  if (!packageExists(electronPkg)) {
    logWarning('Electron not found. Installing...');

    // Try multiple installation methods
    const methods = [
      { cmd: 'bun', args: ['add', electronPkg, '--dev'] },
      { cmd: 'npm', args: ['install', electronPkg, '--save-dev'] },
      { cmd: 'yarn', args: ['add', electronPkg, '--dev'] },
    ] as const;

    for (const method of methods) {
      if (commandExists(method.cmd)) {
        try {
          logInfo(`Installing Electron using ${method.cmd}...`);
          await executeCommand(method.cmd, method.args);
          logSuccess('Electron installed successfully');
          return true;
        } catch (error) {
          logWarning(`Failed to install with ${method.cmd}: ${(error as Error).message}`);
        }
      }
    }

    // Last resort: try with different registry
    try {
      logInfo('Trying alternative npm registry...');
      await executeCommand('npm', [
        'install',
        electronPkg,
        '--save-dev',
        '--registry',
        'https://registry.npmjs.org/',
      ]);
      logSuccess('Electron installed successfully with alternative registry');
      return true;
    } catch (error) {
      logError(`All Electron installation methods failed: ${(error as Error).message}`);
      return false;
    }
  }

  // Verify electron binary exists
  try {
    const electronPath = path.join(process.cwd(), 'node_modules', '.bin', 'electron');
    if (!fs.existsSync(electronPath) && !fs.existsSync(`${electronPath}.cmd`)) {
      logWarning('Electron binary not found, reinstalling...');
      await executeCommand('npm', ['rebuild', electronPkg]);
    }
  } catch (error) {
    logWarning(`Electron binary verification failed: ${(error as Error).message}`);
  }

  return true;
}

// Install package if missing with enhanced error handling
async function installPackage(
  packageName: string,
  options: { force?: boolean; dev?: boolean; retries?: number } = {}
): Promise<boolean> {
  const { force = false, dev = false, retries = 2 } = options;

  if (!force && packageExists(packageName)) {
    logInfo(`${packageName} is already installed`);
    return true;
  }

  logWarning(`${packageName} not found. Installing...`);

  const installCmd = dev ? 'install' : 'add';
  const args = [installCmd, packageName, dev ? '--dev' : ''];

  // Try different package managers
  const packageManagers = [] as Array<{ cmd: string; args: string[] }>;

  if (process.env.USE_BUN === 'true' || commandExists('bun')) {
    packageManagers.push({ cmd: 'bun', args: args.filter(Boolean) });
  }
  if (commandExists('npm')) {
    packageManagers.push({ cmd: 'npm', args: args.filter(Boolean) });
  }
  if (commandExists('yarn')) {
    packageManagers.push({
      cmd: 'yarn',
      args: dev ? ['add', packageName, '--dev'] : ['add', packageName],
    });
  }

  for (const manager of packageManagers) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        logInfo(`Installing ${packageName} using ${manager.cmd} (attempt ${attempt + 1})...`);
        await executeCommand(manager.cmd, manager.args);
        logSuccess(`${packageName} installed successfully`);
        return true;
      } catch (error) {
        logWarning(
          `Failed with ${manager.cmd} (attempt ${attempt + 1}): ${(error as Error).message}`
        );
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait before retry
        }
      }
    }
  }

  logError(`Failed to install ${packageName} with all available package managers`);
  return false;
}

// Execute command with promise
function executeCommand(
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

// Validate all dependencies with enhanced Electron handling
async function validateDependencies(): Promise<void> {
  logInfo('Validating project dependencies...');

  // Ensure Electron is properly installed first
  const electronOk = await ensureElectronInstalled();
  if (!electronOk) {
    throw new Error('Failed to install Electron');
  }

  const criticalDeps = ['vue', '@rspack/cli'];
  const devDeps = ['@rspack/core', 'vue-loader'];

  for (const dep of criticalDeps) {
    if (!packageExists(dep)) {
      logWarning(`Missing critical dependency: ${dep}`);
      const success = await installPackage(dep);
      if (!success) {
        throw new Error(`Failed to install critical dependency: ${dep}`);
      }
    }
  }

  for (const dep of devDeps) {
    if (!packageExists(dep)) {
      logWarning(`Missing dev dependency: ${dep}`);
      const success = await installPackage(dep, { dev: true });
      if (!success) {
        logWarning(`Continuing without dev dependency: ${dep}`);
      }
    }
  }

  logSuccess('Dependencies validated');
}

// Check if port is available and wait for server
async function waitForServer(port: number, retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      logInfo(`Waiting for server on port ${port} (attempt ${i + 1}/${retries})...`);
      await waitOn({
        resources: [`http://localhost:${port}`],
        timeout: 30000,
        interval: 2000,
      });
      logSuccess(`Server is ready on port ${port}`);
      return true;
    } catch (error) {
      logWarning(`Attempt ${i + 1} failed: ${(error as Error).message}`);
      if (i === retries - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  return false;
}

// Kill processes on port
async function killPortProcesses(port: number): Promise<void> {
  try {
    if (process.platform === 'win32') {
      // Windows approach
      await executeCommand('cmd', ['/c', `netstat -ano | findstr :${port} | findstr LISTENING`]);
    } else {
      // Unix/Linux approach - use fuser if available, fallback to lsof
      try {
        await executeCommand('fuser', ['-k', `${port}/tcp`]);
        logInfo(`Killed processes on port ${port} using fuser`);
      } catch (_fuserError) {
        // Check if lsof is available before trying to use it
        try {
          execSync('which lsof', { encoding: 'utf8' });
          // lsof is available, use it
          const pids = execSync(`lsof -ti :${port}`, { encoding: 'utf8' }).trim();
          if (pids) {
            execSync(`kill -9 ${pids}`);
            logInfo(`Killed processes on port ${port} using lsof`);
          }
        } catch (_lsofCheckError) {
          // lsof is not available, try alternative approaches
          logWarning('lsof not available, skipping port cleanup');
        }
      }
    }
  } catch (_error) {
    logWarning('Could not kill processes on port');
  }
}

// Start development server with rspack
async function startDevServer(): Promise<void> {
  let rspackProcess: import('child_process').ChildProcess | null = null;
  let electronProcess: import('child_process').ChildProcess | null = null;

  try {
    log('🚀 Starting Electron + Vue + Rspack Development Server', 'cyan');

    // Validate dependencies first
    await validateDependencies();

    // Get a random available port
    const port = await getPort({ port: 1234 });
    logInfo(`Using port: ${port}`);

    // Set environment variables
    process.env.PORT = port.toString();
    process.env.NODE_ENV = 'development';

    // Kill any existing processes on the port
    await killPortProcesses(port);

    // Start Rspack dev server
    logInfo('Starting Rspack development server...');
    rspackProcess = spawn('./node_modules/.bin/rspack', ['serve', '--port', port.toString()], {
      stdio: 'inherit',
      env: { ...process.env },
    });

    // Wait for server to be ready
    await waitForServer(port);

    // Set Electron start URL
    process.env.ELECTRON_START_URL = `http://localhost:${port}`;

    // Start Electron
    logInfo('Starting Electron application...');

    // Check if main.cjs exists
    if (!fs.existsSync('main.cjs')) {
      throw new Error('main.cjs not found. Please ensure the main process file exists.');
    }

    // Determine the correct way to run electron based on available package managers
    let electronArgs: string[];
    let electronOptions: { stdio: 'inherit'; env: Record<string, string | undefined> };

    // Set the environment for the electron process
    const electronEnv = { ...process.env, ELECTRON_START_URL: `http://localhost:${port}` };
    electronOptions = { stdio: 'inherit', env: electronEnv };

    // Use the direct path to electron binary if available, otherwise use bunx/npx
    const electronPath = path.join(process.cwd(), 'node_modules', '.bin', 'electron');
    if (fs.existsSync(electronPath) || fs.existsSync(`${electronPath}.cmd`)) {
      // Use local electron binary directly
      electronArgs = [electronPath, 'main.cjs', '--start-dev'];
      electronProcess = spawn(electronPath, ['main.cjs', '--start-dev'], electronOptions);
    } else {
      // Fallback to bunx or npx
      const electronCommand = commandExists('bunx') ? 'bunx' : 'npx';
      electronArgs = [electronCommand, 'electron', 'main.cjs', '--start-dev'];

      // Use shell execution to properly handle bunx/npx commands
      electronProcess = spawn(process.platform === 'win32' ? 'cmd' : 'sh', [
        process.platform === 'win32' ? '/c' : '-c',
        electronArgs.join(' ')
      ], {
        stdio: 'inherit',
        env: electronEnv,
        shell: true
      });
    }

    // Handle process cleanup
    const cleanup = () => {
      logInfo('Shutting down development server...');
      if (electronProcess) {
        electronProcess.kill('SIGTERM');
      }
      if (rspackProcess) {
        rspackProcess.kill('SIGTERM');
      }
    };

    // Handle exit signals
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    electronProcess.on('close', (code) => {
      logInfo(`Electron process exited with code ${code}`);
      if (rspackProcess) {
        rspackProcess.kill('SIGTERM');
      }

      // If Electron exits unexpectedly, don't immediately kill the dev server
      if (code !== 0 && code !== null) {
        logWarning('Electron exited with an error. Dev server will continue running.');
        logInfo('You can restart Electron by pressing Ctrl+C and running the command again.');
      }
    });

    electronProcess.on('error', (error) => {
      logError(`Electron process error: ${(error as Error).message}`);
    });

    rspackProcess.on('close', (code) => {
      logInfo(`Rspack process exited with code ${code}`);
      if (electronProcess) {
        electronProcess.kill('SIGTERM');
      }
    });

    logSuccess('Development server started successfully!');
    log('Press Ctrl+C to stop the server', 'yellow');
  } catch (error) {
    logError(`Failed to start development server: ${(error as Error).message}`);

    // Cleanup on error
    if (electronProcess) {
      electronProcess.kill('SIGTERM');
    }
    if (rspackProcess) {
      rspackProcess.kill('SIGTERM');
    }

    // Try to recover by reinstalling dependencies
    logInfo('Attempting recovery by reinstalling dependencies...');
    try {
      await validateDependencies();
      logSuccess('Recovery completed. Please try running the command again.');
    } catch (recoveryError) {
      logError(`Recovery failed: ${(recoveryError as Error).message}`);
      logError('Please run "npm install" or "bun install" manually and try again.');
    }

    process.exit(1);
  }
}

// Build the application
async function buildApp(): Promise<void> {
  try {
    log('📦 Building application...', 'cyan');

    // Validate dependencies
    await validateDependencies();

    // Run rspack build
    logInfo('Running rspack build...');
    await executeCommand('./node_modules/.bin/rspack', ['build']);

    logSuccess('Build completed successfully!');
  } catch (error) {
    logError(`Build failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

// Package the application
async function packageApp(): Promise<void> {
  try {
    log('📦 Packaging Electron Application', 'cyan');

    // Ensure Electron is properly installed first
    const electronOk = await ensureElectronInstalled();
    if (!electronOk) {
      throw new Error('Failed to install Electron');
    }

    // Verify electron binary exists
    try {
      const electronPath = path.join(process.cwd(), 'node_modules', '.bin', 'electron');
      if (!fs.existsSync(electronPath) && !fs.existsSync(`${electronPath}.cmd`)) {
        logWarning('Electron binary not found, reinstalling...');
        await executeCommand('npm', ['rebuild', 'electron']);
      }
    } catch (_error) {
      logWarning('Electron binary verification failed, continuing...');
    }

    // Install electron-builder if not present
    if (!packageExists('electron-builder')) {
      logInfo('Installing electron-builder...');
      await installPackage('electron-builder', { dev: true });
    }

    // Run electron builder
    logInfo('Building Electron application...');
    await executeCommand('bunx', ['electron-builder', '--dir']);

    logSuccess('Packaging completed successfully!');
  } catch (error) {
    logError(`Packaging failed: ${(error as Error).message}`);
    process.exit(1);
  }
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
  const command = args[0] || 'dev';

  switch (command) {
    case 'dev':
    case 'develop':
    case 'start':
      await startDevServer();
      break;
    case 'build':
      await buildApp();
      break;
    case 'package':
    case 'dist':
      await packageApp();
      break;
    case 'icons':
      copyIcons();
      break;
    default:
      log(`Usage: node ${__filename} [dev|build|package|icons]`, 'yellow');
      log('  dev      - Start development server', 'yellow');
      log('  build    - Build the application', 'yellow');
      log('  package  - Package the application for distribution', 'yellow');
      log('  icons    - Copy icon files to dist directory', 'yellow');
      process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception: ${(error as Error).message}`);
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main();
}

export { startDevServer, buildApp, packageApp, validateDependencies, installPackage };

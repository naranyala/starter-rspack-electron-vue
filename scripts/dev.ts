#!/usr/bin/env node
/**
 * Development Server Script
 * Starts the development server with hot reload and Electron
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import getPort from 'get-port';
import { createLogger, installPackage, killPort, PATHS, waitForServer } from './utils';

const log = createLogger('dev');

async function startDevServer() {
  log.section('Starting Development Server');

  // Get available port
  const port = await getPort({ port: 1234 });
  log.info(`Using port: ${port}`);

  // Kill any existing processes on port
  await killPort(port);

  // Ensure critical dependencies
  log.info('Checking dependencies...');
  const deps = ['electron', '@rspack/cli'];
  for (const dep of deps) {
    const success = await installPackage(dep, { dev: true });
    if (!success) {
      log.fatal(`Failed to install ${dep}`);
    }
  }

  // Check for main.cjs
  if (!fs.existsSync('main.cjs')) {
    log.fatal('main.cjs not found. Please ensure the main process file exists.');
  }

  // Start Rspack dev server
  log.info('Starting Rspack development server...');
  const rspackProcess = spawn('./node_modules/.bin/rspack', ['serve', '--port', port.toString()], {
    stdio: 'inherit',
    env: { ...process.env, PORT: port.toString(), NODE_ENV: 'development' },
  });

  // Wait for server to be ready
  log.info('Waiting for server to be ready...');
  const serverReady = await waitForServer(`http://localhost:${port}`, 60000, 2000);
  if (!serverReady) {
    log.fatal('Server failed to start within 60 seconds');
  }
  log.success('Server is ready!');

  // Start Electron
  log.info('Starting Electron...');
  const electronProcess = spawn(PATHS.electronBinary, ['main.cjs', '--start-dev'], {
    stdio: 'inherit',
    env: { ...process.env, ELECTRON_START_URL: `http://localhost:${port}` },
  });

  // Handle cleanup
  const cleanup = () => {
    log.info('Shutting down development server...');
    electronProcess.kill('SIGTERM');
    rspackProcess.kill('SIGTERM');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Handle process exits
  electronProcess.on('close', (code) => {
    log.info(`Electron exited with code ${code}`);
    rspackProcess.kill('SIGTERM');
  });

  rspackProcess.on('close', (code) => {
    log.info(`Rspack exited with code ${code}`);
    electronProcess.kill('SIGTERM');
  });

  log.success('Development server started successfully!');
  log.info('Press Ctrl+C to stop');
}

// Run
startDevServer().catch((error) => {
  log.fatal(`Development server failed: ${(error as Error).message}`);
});

#!/usr/bin/env node
/**
 * Build Script
 * Builds the application for production
 */

import { createLogger, executeCommand, installPackage } from './utils';

const log = createLogger('build');

async function build() {
  log.section('Building Application');

  // Check critical dependencies
  log.info('Checking build dependencies...');
  const deps = ['@rspack/cli', '@rspack/core'];
  for (const dep of deps) {
    const success = await installPackage(dep, { dev: true });
    if (!success) {
      log.fatal(`Failed to install ${dep}`);
    }
  }

  // Run rspack build
  log.info('Running production build...');
  try {
    await executeCommand('./node_modules/.bin/rspack', ['build']);
    log.success('Build completed successfully!');
  } catch (error) {
    log.fatal(`Build failed: ${(error as Error).message}`);
  }
}

// Run
build().catch((error) => {
  log.fatal(`Build script failed: ${(error as Error).message}`);
});

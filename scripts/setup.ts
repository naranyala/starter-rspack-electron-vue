#!/usr/bin/env node
/**
 * Setup Script
 * Sets up the project by installing all required dependencies
 */

import fs from 'node:fs';
import {
  CRITICAL_DEPS,
  createLogger,
  detectPackageManager,
  installPackage,
  OPTIONAL_DEPS,
} from './utils';

const log = createLogger('setup');

async function setup() {
  log.section('Setting Up Project');

  // Check package manager
  const manager = detectPackageManager();
  log.success(`Using package manager: ${manager}`);

  // Validate project structure
  log.info('Validating project structure...');
  const requiredFiles = ['package.json', 'main.cjs'];
  const requiredDirs = ['src', 'src/backend', 'src/frontend'];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      log.fatal(`Required file not found: ${file}`);
    }
  }

  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      log.fatal(`Required directory not found: ${dir}`);
    }
  }
  log.success('Project structure validated');

  // Install critical dependencies
  log.section('Installing Critical Dependencies');
  for (const dep of CRITICAL_DEPS) {
    const isDev = ['@rspack/cli', '@rspack/core', 'vue-loader'].includes(dep);
    const success = await installPackage(dep, { dev: isDev });
    if (!success) {
      log.fatal(`Failed to install critical dependency: ${dep}`);
    }
  }

  // Install optional dependencies
  log.section('Installing Optional Dependencies');
  for (const dep of OPTIONAL_DEPS) {
    const isDev = ['electron-builder', '@biomejs/biome', 'typescript'].includes(dep);
    await installPackage(dep, { dev: isDev });
  }

  log.section('Setup Complete');
  log.success('Project setup completed successfully!');
  log.info('You can now run:');
  log.info('  npm run dev     - Start development server');
  log.info('  npm run build   - Build for production');
  log.info('  npm run package - Package application');
}

// Run
setup().catch((error) => {
  log.fatal(`Setup failed: ${(error as Error).message}`);
});

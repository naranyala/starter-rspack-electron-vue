#!/usr/bin/env node
/**
 * Clean Script
 * Cleans the dist directory and other build artifacts
 */

import fs from 'node:fs';
import path from 'node:path';
import { createLogger, PATHS } from './utils';

const log = createLogger('clean');

function cleanDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    log.debug(`Directory does not exist: ${dirPath}`);
    return;
  }

  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    log.success(`Cleaned: ${path.relative(PATHS.root, dirPath)}`);
  } catch (error) {
    log.error(`Failed to clean ${dirPath}: ${(error as Error).message}`);
  }
}

function clean() {
  log.section('Cleaning Build Artifacts');

  // Clean dist directory
  cleanDirectory(PATHS.dist);

  // Clean node_modules/.cache if exists
  const cacheDir = path.join(PATHS.nodeModules, '.cache');
  cleanDirectory(cacheDir);

  // Clean any .tmp directories
  const tmpDir = path.join(PATHS.root, '.tmp');
  cleanDirectory(tmpDir);

  log.section('Clean Complete');
  log.success('Build artifacts cleaned successfully!');
}

// Run
try {
  clean();
} catch (error) {
  log.fatal(`Clean script failed: ${(error as Error).message}`);
}

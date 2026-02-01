#!/usr/bin/env node
/**
 * Icons Script
 * Copies icon files to the dist directory
 */

import { copyFile, createLogger, ensureDir, PATHS } from './utils';

const log = createLogger('icons');

const ICON_FILES = ['icon.png', 'icon.ico', 'icon.icns', 'icon.svg'];

function copyIcons() {
  log.section('Copying Icon Files');

  // Ensure dist directory exists
  ensureDir(PATHS.dist);

  let copied = 0;
  let skipped = 0;

  for (const iconFile of ICON_FILES) {
    const srcPath = `${PATHS.icons}/${iconFile}`;
    const destPath = `${PATHS.dist}/${iconFile}`;

    if (copyFile(srcPath, destPath)) {
      copied++;
    } else {
      log.warning(`Skipped ${iconFile}`);
      skipped++;
    }
  }

  log.section('Summary');
  log.success(`Copied ${copied} icon files`);
  if (skipped > 0) {
    log.warning(`Skipped ${skipped} missing files`);
  }
}

// Run
try {
  copyIcons();
} catch (error) {
  log.fatal(`Icons script failed: ${(error as Error).message}`);
}

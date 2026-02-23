#!/usr/bin/env bun

import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { executeCommand } from './utils';
import { createLogger } from './utils/logger';

const log = createLogger('security-package');

/**
 * Security-Focused Packaging Script
 * Packages the application with security checks
 */

async function securityPackage() {
  log.section('Starting Security-Focused Packaging');

  // Run security checks before packaging
  log.info('Running pre-package security checks...');

  try {
    // Run dependency security audit
    await runDependencyAudit();

    // Run security tests
    await runSecurityTests();

    // Check for security misconfigurations
    await checkSecurityMisconfigurations();

    // Build the application first
    log.info('Building application before packaging...');
    await executeCommand('./node_modules/.bin/rspack', ['build']);

    // Package the application
    log.info('Packaging application...');
    await executeCommand('bunx', ['electron-builder']);

    // Post-package security checks
    await runPostPackageSecurityChecks();

    log.success('Security-focused packaging completed successfully!');
  } catch (error) {
    log.fatal(`Security packaging failed: ${(error as Error).message}`);
  }
}

/**
 * Run dependency security audit
 */
async function runDependencyAudit() {
  log.info('Running dependency security audit...');

  try {
    // Try to run npm audit if available
    const auditResult = execSync('npm audit --audit-level=moderate --json', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'], // Suppress stderr
    });

    const auditJson = JSON.parse(auditResult);
    const vulnerabilities = auditJson.metadata.vulnerabilities;

    log.info(`Found ${vulnerabilities.total} total vulnerabilities:`);
    log.info(`  - Critical: ${vulnerabilities.critical}`);
    log.info(`  - High: ${vulnerabilities.high}`);
    log.info(`  - Moderate: ${vulnerabilities.moderate}`);
    log.info(`  - Low: ${vulnerabilities.low}`);

    if (vulnerabilities.critical > 0 || vulnerabilities.high > 0) {
      log.fatal(`High or critical vulnerabilities detected. Packaging aborted.`);
    }

    log.success('Dependency audit passed');
  } catch (error) {
    log.warning(`Dependency audit failed: ${(error as Error).message}`);
    // Don't fail the build if audit tool isn't available
  }
}

/**
 * Run security tests
 */
async function runSecurityTests() {
  log.info('Running security tests...');

  try {
    await executeCommand('bun', ['test', 'test/security/', '--timeout=30000']);
    log.success('Security tests passed');
  } catch (error) {
    log.fatal(`Security tests failed: ${(error as Error).message}`);
  }
}

/**
 * Check for security misconfigurations
 */
async function checkSecurityMisconfigurations() {
  log.info('Checking for security misconfigurations...');

  // Check for common security misconfigurations
  await checkElectronSecurityConfig();
  await checkGitIgnoreConfig();
  await checkSecretsInCode();

  log.success('Security misconfiguration checks passed');
}

/**
 * Check Electron security configuration
 */
async function checkElectronSecurityConfig() {
  try {
    const mainContent = await fs.readFile('main.cjs', 'utf8');

    // Check for insecure configurations
    if (mainContent.includes('nodeIntegration: true')) {
      log.fatal('Security misconfiguration: nodeIntegration is enabled in main.cjs');
    }

    if (mainContent.includes('contextIsolation: false')) {
      log.fatal('Security misconfiguration: contextIsolation is disabled in main.cjs');
    }

    if (mainContent.includes('webSecurity: false')) {
      log.fatal('Security misconfiguration: webSecurity is disabled in main.cjs');
    }

    if (!mainContent.includes('sandbox: true')) {
      log.warning('Recommendation: Enable sandbox mode in main.cjs for enhanced security');
    }
  } catch (error) {
    log.warning(`Could not read main.cjs for security check: ${(error as Error).message}`);
  }
}

/**
 * Check .gitignore configuration
 */
async function checkGitIgnoreConfig() {
  try {
    const gitignoreContent = await fs.readFile('.gitignore', 'utf8');

    // Check for sensitive files that should be ignored
    const requiredPatterns = [
      '*.env',
      '.env.local',
      '.env.development.local',
      '.env.test.local',
      '.env.production.local',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      'node_modules/',
      'dist/',
      'build/',
    ];

    for (const pattern of requiredPatterns) {
      if (!gitignoreContent.includes(pattern)) {
        log.warning(`Missing pattern in .gitignore: ${pattern}`);
      }
    }
  } catch (error) {
    log.warning(`Could not read .gitignore for security check: ${(error as Error).message}`);
  }
}

/**
 * Check for secrets in code
 */
async function checkSecretsInCode() {
  try {
    // Scan source files for potential secrets
    const srcPath = path.join(process.cwd(), 'src');
    const mainPath = path.join(process.cwd(), 'main.cjs');

    // Check main.cjs for secrets
    const mainContent = await fs.readFile(mainPath, 'utf8');
    const secretPatterns = [
      /(?:secret|token|key|password|api_key|auth_token)\s*[:=]\s*['"][^'"]{10,}['"]/i,
      /(?:AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|SECRET_KEY).*=/i,
    ];

    for (const pattern of secretPatterns) {
      if (pattern.test(mainContent)) {
        log.fatal('Potential secret found in main.cjs');
      }
    }

    // Check src directory for secrets
    if (await pathExists(srcPath)) {
      await scanDirectoryForSecrets(srcPath);
    }
  } catch (error) {
    log.warning(`Could not scan for secrets: ${(error as Error).message}`);
  }
}

/**
 * Scan directory for secrets
 */
async function scanDirectoryForSecrets(dirPath: string) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (
        entry.isFile() &&
        (entry.name.endsWith('.js') || entry.name.endsWith('.ts') || entry.name.endsWith('.vue'))
      ) {
        const content = await fs.readFile(fullPath, 'utf8');

        const secretPatterns = [
          /(?:secret|token|key|password|api_key|auth_token)\s*[:=]\s*['"][^'"]{10,}['"]/i,
          /(?:AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|SECRET_KEY).*=/i,
        ];

        for (const pattern of secretPatterns) {
          if (pattern.test(content)) {
            log.fatal(`Potential secret found in ${fullPath}`);
          }
        }
      } else if (entry.isDirectory()) {
        await scanDirectoryForSecrets(fullPath);
      }
    }
  } catch (error) {
    log.warning(`Could not scan directory ${dirPath}: ${(error as Error).message}`);
  }
}

/**
 * Run post-package security checks
 */
async function runPostPackageSecurityChecks() {
  log.info('Running post-package security checks...');

  // Check if dist directory exists (where packaged files are typically placed)
  if (await pathExists('dist')) {
    // Verify that packaged files don't contain sensitive information
    await verifyPackagedFilesSecurity();
  }

  log.success('Post-package security checks passed');
}

/**
 * Verify that packaged files don't contain sensitive information
 */
async function verifyPackagedFilesSecurity() {
  try {
    const distPath = path.join(process.cwd(), 'dist');
    const files = await scanDirectory(distPath);

    for (const file of files) {
      if (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.asar')) {
        // For .asar files, we'll just check the filename
        if (file.endsWith('.asar')) {
          if (/secret|password|key|token/i.test(file)) {
            log.warning(`Potentially sensitive filename in package: ${file}`);
          }
        } else {
          const content = await fs.readFile(file, 'utf8');

          const secretPatterns = [
            /(?:secret|token|key|password|api_key|auth_token)\s*[:=]\s*['"][^'"]{10,}['"]/i,
            /(?:AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|SECRET_KEY).*=/i,
          ];

          for (const pattern of secretPatterns) {
            if (pattern.test(content)) {
              log.fatal(`Potential secret found in packaged file: ${file}`);
            }
          }
        }
      }
    }
  } catch (error) {
    log.warning(`Could not verify packaged files security: ${(error as Error).message}`);
  }
}

/**
 * Check if path exists
 */
async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Scan directory for files
 */
async function scanDirectory(dirPath: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isFile()) {
        files.push(fullPath);
      } else if (entry.isDirectory()) {
        const subFiles = await scanDirectory(fullPath);
        files.push(...subFiles);
      }
    }
  } catch (error) {
    // Directory doesn't exist or isn't readable
  }

  return files;
}

// Run the security package
securityPackage().catch((error) => {
  log.fatal(`Security package script failed: ${(error as Error).message}`);
});

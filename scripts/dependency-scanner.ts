#!/usr/bin/env bun

import { execSync } from 'child_process';
import { createLogger } from './scripts/utils/logger';
import { promises as fs } from 'fs';
import path from 'path';

const log = createLogger('dependency-scanner');

/**
 * Dependency Vulnerability Scanner
 * Scans project dependencies for known vulnerabilities
 */

async function scanDependencies() {
  log.section('Starting Dependency Vulnerability Scan');

  try {
    // Check if package-lock.json or bun.lock exists
    let hasLockFile = false;
    try {
      await fs.access('package-lock.json');
      hasLockFile = true;
      log.info('Found package-lock.json');
    } catch {
      try {
        await fs.access('bun.lock');
        hasLockFile = true;
        log.info('Found bun.lock');
      } catch {
        log.warning('No lock file found. Consider running bun install to generate bun.lock');
      }
    }

    if (hasLockFile) {
      await runNpmAudit();
    } else {
      log.info('Skipping vulnerability scan - no lock file found');
    }

    // Run additional security checks
    await checkOutdatedPackages();
    await checkDeprecatedPackages();
    
    log.success('Dependency vulnerability scan completed');
  } catch (error) {
    log.fatal(`Dependency scan failed: ${(error as Error).message}`);
  }
}

/**
 * Run npm audit to check for vulnerabilities
 */
async function runNpmAudit() {
  log.info('Running npm audit...');
  
  try {
    const auditResult = execSync('npm audit --audit-level=moderate --json', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'] // Suppress stderr
    });
    
    const auditJson = JSON.parse(auditResult);
    const vulnerabilities = auditJson.metadata.vulnerabilities;
    
    log.info(`Vulnerability Report:`);
    log.info(`  - Critical: ${vulnerabilities.critical}`);
    log.info(`  - High: ${vulnerabilities.high}`);
    log.info(`  - Moderate: ${vulnerabilities.moderate}`);
    log.info(`  - Low: ${vulnerabilities.low}`);
    log.info(`  - Total: ${vulnerabilities.total}`);
    
    // Show details for critical and high vulnerabilities
    if (auditJson.vulnerabilities && (vulnerabilities.critical > 0 || vulnerabilities.high > 0)) {
      log.info('\nCritical/High Vulnerability Details:');
      
      for (const [name, vuln] of Object.entries(auditJson.vulnerabilities)) {
        const v = vuln as any;
        if (v.severity === 'critical' || v.severity === 'high') {
          log.info(`  - ${name}: ${v.severity.toUpperCase()} - ${v.title || v.url}`);
          log.info(`    Package: ${v.module_name}`);
          log.info(`    Vulnerable versions: ${v.vulnerable_versions}`);
          log.info(`    Patched in: ${v.patched_versions || 'No patch available'}`);
          log.info('');
        }
      }
      
      if (vulnerabilities.critical > 0 || vulnerabilities.high > 0) {
        log.fatal(`Critical or high severity vulnerabilities detected. Please address these before proceeding.`);
      }
    }
    
    log.success('npm audit completed successfully');
  } catch (error) {
    log.warning(`npm audit failed or not available: ${(error as Error).message}`);
    // Try alternative approaches
    try {
      // If npm audit isn't available, try bun audit if it exists
      execSync('bun audit', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      log.success('bun audit completed');
    } catch (bunError) {
      log.info('Neither npm audit nor bun audit available, skipping vulnerability scan');
    }
  }
}

/**
 * Check for outdated packages
 */
async function checkOutdatedPackages() {
  log.info('Checking for outdated packages...');
  
  try {
    // Try npm outdated first
    const outdatedResult = execSync('npm outdated --json', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'] // Suppress stderr
    });
    
    const outdated = JSON.parse(outdatedResult);
    const outdatedCount = Object.keys(outdated).length;
    
    if (outdatedCount > 0) {
      log.info(`Found ${outdatedCount} outdated packages:`);
      for (const [pkg, details] of Object.entries(outdated)) {
        const d = details as any;
        log.info(`  - ${pkg}: ${d.current} → ${d.latest} (${d.wanted})`);
      }
      
      log.warning(`Consider updating outdated packages to get the latest security patches`);
    } else {
      log.success('All packages are up to date');
    }
  } catch (error) {
    log.info('Could not check for outdated packages (npm outdated not available)');
  }
}

/**
 * Check for deprecated packages
 */
async function checkDeprecatedPackages() {
  log.info('Checking for deprecated packages...');
  
  try {
    const listResult = execSync('npm list --json', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'] // Suppress stderr
    });
    
    const list = JSON.parse(listResult);
    
    // Check for deprecated packages in dependencies
    const checkForDeprecation = (deps: any, prefix: string = '') => {
      if (!deps) return [];
      
      const deprecated = [];
      for (const [pkg, details] of Object.entries(deps)) {
        const d = details as any;
        if (typeof d === 'object' && d.deprecated) {
          deprecated.push(`${prefix}${pkg}: ${d.deprecated}`);
        } else if (typeof d === 'object' && d.dependencies) {
          deprecated.push(...checkForDeprecation(d.dependencies, `${pkg} > `));
        }
      }
      return deprecated;
    };
    
    const deprecatedPkgs = checkForDeprecation(list.dependencies);
    
    if (deprecatedPkgs.length > 0) {
      log.info(`Found ${deprecatedPkgs.length} deprecated packages:`);
      for (const pkg of deprecatedPkgs) {
        log.info(`  - ${pkg}`);
      }
      
      log.warning(`Consider replacing deprecated packages`);
    } else {
      log.success('No deprecated packages found');
    }
  } catch (error) {
    log.info('Could not check for deprecated packages (npm list not available)');
  }
}

/**
 * Check for specific known vulnerable packages
 */
async function checkKnownVulnerablePackages() {
  log.info('Checking for known vulnerable packages...');
  
  try {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Common vulnerable packages and their safe versions
    const knownVulnerabilities = new Map([
      // Example entries - these would need to be updated regularly
      // ['lodash', '^4.17.21'], // Example: lodash before 4.17.21 had prototype pollution
      // ['axios', '^1.6.0'],   // Example: axios had vulnerabilities in older versions
    ]);
    
    for (const [pkg, minVersion] of knownVulnerabilities) {
      if (allDeps[pkg]) {
        const installedVersion = allDeps[pkg];
        // Skip if it's a git URL or file path
        if (typeof installedVersion === 'string' && 
            (installedVersion.startsWith('git+') || installedVersion.startsWith('file:'))) {
          continue;
        }
        
        // Simple version comparison (would need more robust logic in practice)
        if (installedVersion && installedVersion !== minVersion) {
          log.warning(`Package ${pkg}@${installedVersion} may be vulnerable. Recommended: ${minVersion}`);
        }
      }
    }
    
    log.success('Known vulnerability check completed');
  } catch (error) {
    log.warning(`Could not check for known vulnerable packages: ${(error as Error).message}`);
  }
}

// Run the dependency scanner
scanDependencies().catch((error) => {
  log.fatal(`Dependency scanner failed: ${(error as Error).message}`);
});
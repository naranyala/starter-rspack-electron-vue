#!/usr/bin/env bun

import { execSync, spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

type LogLevel = 'debug' | 'info' | 'success' | 'warning' | 'error' | 'fatal';

interface LogConfig {
  level: LogLevel;
  prefix: string;
  color: string;
  emoji: string;
}

const LOG_CONFIGS: Record<LogLevel, LogConfig> = {
  debug: { level: 'debug', prefix: '[DEBUG]', color: '\x1b[90m', emoji: '🔍' },
  info: { level: 'info', prefix: '[INFO]', color: '\x1b[36m', emoji: 'ℹ️' },
  success: { level: 'success', prefix: '[SUCCESS]', color: '\x1b[32m', emoji: '✅' },
  warning: { level: 'warning', prefix: '[WARN]', color: '\x1b[33m', emoji: '⚠️' },
  error: { level: 'error', prefix: '[ERROR]', color: '\x1b[31m', emoji: '❌' },
  fatal: { level: 'fatal', prefix: '[FATAL]', color: '\x1b[35m', emoji: '💥' },
};

const RESET = '\x1b[0m';
const BRIGHT = '\x1b[1m';

class SecurityBuildLogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const config = LOG_CONFIGS[level];
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    return `${config.color}${config.emoji} ${BRIGHT}${config.prefix}${RESET} ${config.color}[${timestamp}] [${this.context}]${RESET} ${message}`;
  }

  debug(message: string): void {
    console.log(this.formatMessage('debug', message));
  }
  info(message: string): void {
    console.log(this.formatMessage('info', message));
  }
  success(message: string): void {
    console.log(this.formatMessage('success', message));
  }
  warning(message: string): void {
    console.warn(this.formatMessage('warning', message));
  }
  error(message: string): void {
    console.error(this.formatMessage('error', message));
  }
  fatal(message: string): never {
    console.error(this.formatMessage('fatal', message));
    process.exit(1);
  }

  section(title: string): void {
    const line = '━'.repeat(50);
    console.log(`\n${BRIGHT}\x1b[34m${line}${RESET}`);
    console.log(`${BRIGHT}\x1b[34m┏━ ${title}${RESET}`);
    console.log(`${BRIGHT}\x1b[34m${line}${RESET}\n`);
  }
}

const log = new SecurityBuildLogger('security-build');

async function securityBuild(): Promise<void> {
  log.section('Starting Security-Focused Build');

  try {
    log.info('Running pre-build security checks...');
    await runDependencyAudit();
    await runOutdatedCheck();
    await runSecurityTests();
    await checkSecurityMisconfigurations();

    log.info('Building application with rspack...');
    await executeCommand('./node_modules/.bin/rspack', ['build']);

    await runPostBuildSecurityChecks();
    log.success('Security-focused build completed successfully!');
  } catch (error) {
    log.fatal(`Security build failed: ${(error as Error).message}`);
  }
}

async function runDependencyAudit(): Promise<void> {
  log.info('Running dependency security audit...');

  try {
    const result = execSync('npm audit --audit-level=moderate --json', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const auditJson = JSON.parse(result);
    const vulnerabilities = auditJson.metadata?.vulnerabilities || {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
      total: 0,
    };

    log.info(`Found ${vulnerabilities.total} total vulnerabilities:`);
    log.info(`  - Critical: ${vulnerabilities.critical}`);
    log.info(`  - High: ${vulnerabilities.high}`);
    log.info(`  - Moderate: ${vulnerabilities.moderate}`);
    log.info(`  - Low: ${vulnerabilities.low}`);

    if (vulnerabilities.critical > 0) {
      log.fatal('Critical vulnerabilities detected. Build aborted.');
    }

    if (vulnerabilities.high > 0) {
      log.warning('High vulnerabilities detected. Consider fixing before production use.');
    }

    log.success('Dependency audit passed');
  } catch (error) {
    log.warning(`Dependency audit tool not available: ${(error as Error).message}`);
  }
}

async function runOutdatedCheck(): Promise<void> {
  log.info('Checking for outdated dependencies...');

  try {
    const result = execSync('npm outdated --json', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const outdatedJson = JSON.parse(result);
    const outdatedPackages = Object.keys(outdatedJson);

    if (outdatedPackages.length > 0) {
      log.warning('Outdated dependencies found:');
      for (const pkg of outdatedPackages) {
        const versions = outdatedJson[pkg];
        log.warning(`  - ${pkg}: ${versions.current} -> ${versions.latest}`);
      }
    } else {
      log.success('All dependencies are up to date.');
    }
  } catch (error) {
    // npm outdated returns a non-zero exit code if outdated packages are found
    if (error instanceof Error && 'stdout' in error) {
      const outdatedJson = JSON.parse(error.stdout as string);
      const outdatedPackages = Object.keys(outdatedJson);

      if (outdatedPackages.length > 0) {
        log.warning('Outdated dependencies found:');
        for (const pkg of outdatedPackages) {
          const versions = outdatedJson[pkg];
          log.warning(`  - ${pkg}: ${versions.current} -> ${versions.latest}`);
        }
      }
    } else {
      log.warning(`Could not check for outdated dependencies: ${(error as Error).message}`);
    }
  }
}

async function runSecurityTests(): Promise<void> {
  log.info('Running security tests...');

  try {
    await executeCommand('bun', ['test', 'test/security/', '--timeout=30000']);
    log.success('Security tests passed');
  } catch (error) {
    log.fatal(`Security tests failed: ${(error as Error).message}`);
  }
}

async function checkSecurityMisconfigurations(): Promise<void> {
  log.info('Checking for security misconfigurations...');

  await checkElectronSecurityConfig();
  await checkGitIgnoreConfig();
  await checkSecretsInCode();
  await checkPackageJsonSecurity();
  await checkTsConfigSecurity();

  log.success('Security misconfiguration checks passed');
}

async function checkElectronSecurityConfig(): Promise<void> {
  try {
    const mainPath = path.join(process.cwd(), 'main.cjs');
    const mainContent = await fs.readFile(mainPath, 'utf8');

    const securityChecks = [
      {
        pattern: /nodeIntegration:\s*true/,
        message: 'nodeIntegration is enabled',
        severity: 'fatal',
      },
      {
        pattern: /contextIsolation:\s*false/,
        message: 'contextIsolation is disabled',
        severity: 'fatal',
      },
      { pattern: /webSecurity:\s*false/, message: 'webSecurity is disabled', severity: 'fatal' },
      {
        pattern: /allowRunningInsecureContent:\s*true/,
        message: 'Insecure content allowed',
        severity: 'fatal',
      },
      {
        pattern: /experimentalFeatures:\s*true/,
        message: 'Experimental features enabled',
        severity: 'warning',
      },
      {
        pattern: /enableRemoteModule:\s*true/,
        message: 'Remote module enabled',
        severity: 'warning',
      },
      { pattern: /webviewTag:\s*true/, message: 'Webview tag enabled', severity: 'warning' },
    ];

    for (const check of securityChecks) {
      if (check.pattern.test(mainContent)) {
        if (check.severity === 'fatal') {
          log.fatal(`Security misconfiguration: ${check.message} in main.cjs`);
        } else {
          log.warning(`Security warning: ${check.message} in main.cjs`);
        }
      }
    }

    if (!/sandbox:\s*true/.test(mainContent)) {
      log.warning('Recommendation: Enable sandbox mode in main.cjs for enhanced security');
    }

    if (!/preload:/.test(mainContent)) {
      log.warning('Recommendation: Add preload script for secure IPC communication');
    }
  } catch (error) {
    log.warning(`Could not read main.cjs for security check: ${(error as Error).message}`);
  }
}

async function checkGitIgnoreConfig(): Promise<void> {
  try {
    const gitignoreContent = await fs.readFile(path.join(process.cwd(), '.gitignore'), 'utf8');

    const requiredPatterns = [
      '*.env',
      '.env.local',
      '.env.*.local',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      'node_modules/',
      'dist/',
      'build/',
      '*.pem',
      '*.key',
      '*.crt',
    ];

    const missingPatterns: string[] = [];

    for (const pattern of requiredPatterns) {
      const globPattern = pattern.replace('*', '[^*]*').replace('.', '\\.');
      if (!new RegExp(globPattern).test(gitignoreContent)) {
        missingPatterns.push(pattern);
      }
    }

    if (missingPatterns.length > 0) {
      log.warning('Missing patterns in .gitignore:');
      for (const pattern of missingPatterns) {
        log.warning(`  - ${pattern}`);
      }
    }
  } catch (error) {
    log.warning(`Could not read .gitignore: ${(error as Error).message}`);
  }
}

async function checkSecretsInCode(): Promise<void> {
  try {
    const secretPatterns = [
      // Generic high-entropy string
      /[a-zA-Z0-9\-_]{32,}/,
      // API Keys
      /(?:secret|token|key|password|api_key|auth_token)\s*[:=]\s*['"][^'"]{10,}['"]/gi,
      // AWS
      /(?:AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|SECRET_KEY).*=/gi,
      /AKIA[0-9A-Z]{16}/,
      // Stripe
      /sk_live_[0-9a-zA-Z]{24}/,
      // Google
      /AIzaSy[0-9A-Za-z\-_]{33}/,
    ];

    const mainPath = path.join(process.cwd(), 'main.cjs');
    const mainContent = await fs.readFile(mainPath, 'utf8');

    for (const pattern of secretPatterns) {
      const matches = mainContent.match(pattern);
      if (matches) {
        log.fatal(`Potential secret found in main.cjs: ${matches[0].substring(0, 50)}...`);
      }
    }

    const srcPath = path.join(process.cwd(), 'src');
    await scanDirectoryForSecrets(srcPath, secretPatterns);
  } catch (error) {
    log.warning(`Could not scan for secrets: ${(error as Error).message}`);
  }
}

async function scanDirectoryForSecrets(dirPath: string, patterns: RegExp[]): Promise<void> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isFile() && /\.(js|ts|vue|cjs|mjs)$/.test(entry.name)) {
        const content = await fs.readFile(fullPath, 'utf8');

        for (const pattern of patterns) {
          const matches = content.match(pattern);
          if (matches) {
            log.fatal(`Potential secret found in ${fullPath}`);
          }
        }
      } else if (entry.isDirectory() && !/^\.|node_modules/.test(entry.name)) {
        await scanDirectoryForSecrets(fullPath, patterns);
      }
    }
  } catch {
    // Directory doesn't exist or isn't readable
  }
}

async function checkPackageJsonSecurity(): Promise<void> {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

    if (packageJson.scripts?.postinstall) {
      log.warning('postinstall script detected - ensure it does not execute arbitrary code');
    }

    if (packageJson.dependencies) {
      for (const [name, version] of Object.entries(packageJson.dependencies)) {
        if (
          typeof version === 'string' &&
          (version.startsWith('git+') || version.startsWith('http'))
        ) {
          log.warning(`External dependency URL detected: ${name}@${version}`);
        }
      }
    }
  } catch (error). {
    log.warning(`Could not check package.json security: ${(error as Error).message}`);
  }
}

async function checkTsConfigSecurity(): Promise<void> {
  try {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf8'));

    const compilerOptions = tsconfig.compilerOptions || {};

    if (compilerOptions.allowJs === true) {
      log.warning('allowJs is enabled - ensure all JS files are validated');
    }

    if (compilerOptions.checkJs !== true) {
      log.warning('Consider enabling checkJs for JavaScript security validation');
    }
  } catch {
    // tsconfig.json doesn't exist or can't be read
  }
}

async function runPostBuildSecurityChecks(): Promise<void> {
  log.info('Running post-build security checks...');

  await verifyBuiltFilesSecurity();
  await checkDistDirectorySecurity();

  log.success('Post-build security checks passed');
}

async function verifyBuiltFilesSecurity(): Promise<void> {
  try {
    const distPath = path.join(process.cwd(), 'dist');
    const files = await scanDirectory(distPath);

    const secretPatterns = [
      /(?:secret|token|key|password|api_key|auth_token)\s*[:=]\s*['"][^'"]{10,}['"]/gi,
    ];

    for (const file of files) {
      if (/\.(js|html|css)$/.test(file)) {
        const content = await fs.readFile(file, 'utf8');

        for (const pattern of secretPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            log.fatal(`Potential secret found in built file: ${file}`);
          }
        }
      }
    }
  } catch (error) {
    log.warning(`Could not verify built files security: ${(error as Error).message}`);
  }
}

async function checkDistDirectorySecurity(): Promise<void> {
  try {
    const distPath = path.join(process.cwd(), 'dist');
    const stat = await fs.stat(distPath);

    if ((stat.mode & 0o002) !== 0) {
      log.warning('dist directory has world-write permissions');
    }
  } catch {
    // dist directory doesn't exist
  }
}

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
  } catch {
    return [];
  }

  return files;
}

function executeCommand(command: string, args: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    log.info(`Executing: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      stdio: 'inherit',
      env: process.env,
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

securityBuild().catch((error) => {
  log.fatal(`Security build script failed: ${error.message}`);
});

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ERROR: ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Check if a command exists
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Check if package is installed and get version info
function packageExists(packageName) {
  try {
    const packagePath = path.join(process.cwd(), 'node_modules', packageName);
    if (!fs.existsSync(packagePath)) {
      return { exists: false };
    }

    // Try to get package version
    const packageJsonPath = path.join(packagePath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return {
        exists: true,
        version: packageJson.version,
        name: packageJson.name,
      };
    }

    return { exists: true };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

// Validate package versions against requirements
function validatePackageVersion(packageName, minVersion) {
  const pkgInfo = packageExists(packageName);
  if (!pkgInfo.exists) {
    return { valid: false, reason: 'Package not installed' };
  }

  if (!pkgInfo.version) {
    return { valid: true, reason: 'Version info unavailable' }; // Assume valid if we can't check
  }

  try {
    const semver = require('semver');
    const isValid = semver.gte(pkgInfo.version, minVersion);
    return {
      valid: isValid,
      currentVersion: pkgInfo.version,
      requiredVersion: minVersion,
      reason: isValid ? 'OK' : `Version ${pkgInfo.version} is below required ${minVersion}`,
    };
  } catch (error) {
    // semver not available, assume valid
    return { valid: true, reason: 'Version validation unavailable' };
  }
}

// Enhanced Electron detection and installation
async function ensureElectronInstalled() {
  const electronPkg = 'electron';

  // Check if electron is installed
  if (!packageExists(electronPkg)) {
    logWarning('Electron not found. Installing...');

    // Try multiple installation methods
    const methods = [
      { cmd: 'bun', args: ['add', electronPkg, '--dev'] },
      { cmd: 'npm', args: ['install', electronPkg, '--save-dev'] },
      { cmd: 'yarn', args: ['add', electronPkg, '--dev'] },
    ];

    for (const method of methods) {
      if (commandExists(method.cmd)) {
        try {
          logInfo(`Installing Electron using ${method.cmd}...`);
          await executeCommand(method.cmd, method.args);
          logSuccess('Electron installed successfully');
          return true;
        } catch (error) {
          logWarning(`Failed to install with ${method.cmd}: ${error.message}`);
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
      logError(`All Electron installation methods failed: ${error.message}`);
      return false;
    }
  }

  // Verify electron binary exists
  try {
    const electronPath = path.join(process.cwd(), 'node_modules', '.bin', 'electron');
    if (!fs.existsSync(electronPath) && !fs.existsSync(electronPath + '.cmd')) {
      logWarning('Electron binary not found, reinstalling...');
      await executeCommand('npm', ['rebuild', electronPkg]);
    }
  } catch (error) {
    logWarning(`Electron binary verification failed: ${error.message}`);
  }

  return true;
}

// Install package if missing with enhanced error handling
async function installPackage(packageName, options = {}) {
  const { force = false, dev = false, retries = 2 } = options;

  if (!force && packageExists(packageName)) {
    logInfo(`${packageName} is already installed`);
    return true;
  }

  logWarning(`${packageName} not found. Installing...`);

  const installCmd = dev ? 'install' : 'add';
  const args = [installCmd, packageName, dev ? '--dev' : ''];

  // Try different package managers
  const packageManagers = [];

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
        logWarning(`Failed with ${manager.cmd} (attempt ${attempt + 1}): ${error.message}`);
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait before retry
        }
      }
    }
  }

  logError(`Failed to install ${packageName} with all available package managers`);
  return false;
}

// Network connectivity check
async function checkNetworkConnectivity() {
  try {
    const { spawn } = require('child_process');
    await new Promise((resolve, reject) => {
      const ping = spawn('ping', ['-c', '1', '8.8.8.8'], { stdio: 'ignore' });
      ping.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('No network connectivity'));
      });
      ping.on('error', reject);
    });
    return true;
  } catch (error) {
    logWarning(`Network connectivity check failed: ${error.message}`);
    return false;
  }
}

// Enhanced command execution with timeout and better error handling
function executeCommand(command, args, options = {}) {
  const { timeout = 120000, retries = 1 } = options;

  return new Promise((resolve, reject) => {
    logInfo(`Executing: ${command} ${args.join(' ')}`);

    let attempt = 0;
    const attemptCommand = () => {
      attempt++;

      const child = spawn(command, args, {
        stdio: 'inherit',
        ...options,
      });

      const timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);

      child.on('close', (code) => {
        clearTimeout(timeoutId);
        if (code === 0) {
          resolve(code);
        } else if (attempt < retries) {
          logWarning(`Command failed, retrying (${attempt}/${retries})...`);
          setTimeout(attemptCommand, 2000);
        } else {
          reject(new Error(`Command failed with exit code ${code} after ${retries} attempts`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        if (attempt < retries) {
          logWarning(`Command error, retrying (${attempt}/${retries})...`);
          setTimeout(attemptCommand, 2000);
        } else {
          reject(error);
        }
      });
    };

    attemptCommand();
  });
}

// Build the application
async function build() {
  try {
    log('🏗️  Building Electron + Vue Application', 'cyan');

    // Validate dependencies with enhanced Electron handling and version checking
    logInfo('Checking build dependencies...');

    // Define required packages with minimum versions
    const requiredPackages = [
      { name: '@rspack/cli', minVersion: '1.0.0', dev: true },
      { name: 'vue', minVersion: '3.0.0', dev: false },
      { name: 'vue-loader', minVersion: '17.0.0', dev: true },
    ];

    // Ensure Electron is properly installed first
    const electronOk = await ensureElectronInstalled();
    if (!electronOk) {
      throw new Error('Failed to install Electron');
    }

    // Validate each required package
    for (const pkgConfig of requiredPackages) {
      const pkgInfo = packageExists(pkgConfig.name);

      if (!pkgInfo.exists) {
        logWarning(`Missing dependency: ${pkgConfig.name}`);
        const success = await installPackage(pkgConfig.name, { dev: pkgConfig.dev });
        if (!success) {
          throw new Error(`Failed to install required package: ${pkgConfig.name}`);
        }
      } else {
        // Check version if available
        const versionCheck = validatePackageVersion(pkgConfig.name, pkgConfig.minVersion);
        if (!versionCheck.valid) {
          logWarning(`Version issue with ${pkgConfig.name}: ${versionCheck.reason}`);
          const success = await installPackage(pkgConfig.name, { dev: pkgConfig.dev, force: true });
          if (!success) {
            logWarning(`Failed to update ${pkgConfig.name}, continuing with current version`);
          }
        } else {
          logInfo(`${pkgConfig.name} v${pkgInfo.version || 'unknown'} ✓`);
        }
      }
    }

    // Clean previous build
    if (fs.existsSync('dist')) {
      logInfo('Cleaning previous build...');
      await executeCommand('rm', ['-rf', 'dist']);
    }

    // Check network connectivity before building
    const hasNetwork = await checkNetworkConnectivity();
    if (!hasNetwork) {
      logWarning(
        'Limited network connectivity detected, proceeding with available dependencies...'
      );
    }

    // Build with Rspack with enhanced error handling
    logInfo('Building with Rspack...');
    try {
      await executeCommand('./node_modules/.bin/rspack', ['build'], {
        timeout: 300000,
        retries: 2,
      });
    } catch (buildError) {
      // Try alternative build methods
      logWarning('Primary build method failed, trying alternatives...');

      try {
        // Try using npx
        await executeCommand('npx', ['rspack', 'build'], { timeout: 300000 });
      } catch (npxError) {
        // Try using bunx if available
        if (commandExists('bun')) {
          await executeCommand('bunx', ['rspack', 'build'], { timeout: 300000 });
        } else {
          throw buildError; // Re-throw original error if all alternatives fail
        }
      }
    }

    logSuccess('Build completed successfully!');
    logInfo('Output directory: dist/');
  } catch (error) {
    logError(`Build failed: ${error.message}`);

    // Enhanced recovery with multiple strategies
    logInfo('Attempting comprehensive recovery...');
    try {
      // Strategy 1: Ensure Electron is installed
      await ensureElectronInstalled();

      // Strategy 2: Reinstall core dependencies
      await installPackage('@rspack/cli', { dev: true, force: true });
      await installPackage('vue', { force: true });
      await installPackage('vue-loader', { dev: true, force: true });

      // Strategy 3: Clear npm cache and retry
      logInfo('Clearing package manager cache...');
      if (commandExists('bun')) {
        await executeCommand('bun', ['pm', 'cache', 'clear']);
      } else {
        await executeCommand('npm', ['cache', 'clean', '--force']);
      }

      // Strategy 4: Reinstall all dependencies
      logInfo('Reinstalling all dependencies...');
      if (commandExists('bun')) {
        await executeCommand('bun', ['install', '--force']);
      } else {
        await executeCommand('npm', ['install', '--force']);
      }

      logSuccess('Comprehensive recovery completed. Please try building again.');
    } catch (recoveryError) {
      logError(`Recovery failed: ${recoveryError.message}`);
      logError(
        'Please run "rm -rf node_modules package-lock.json" then "npm install" or "bun install" manually and try again.'
      );
    }

    process.exit(1);
  }
}

// Run the build
if (require.main === module) {
  build();
}

module.exports = { build, installPackage };

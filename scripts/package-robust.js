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
  cyan: '\x1b[36m'
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

// Check if package is installed
function packageExists(packageName) {
  try {
    const packagePath = path.join(process.cwd(), 'node_modules', packageName);
    return fs.existsSync(packagePath);
  } catch (error) {
    return false;
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
      { cmd: 'yarn', args: ['add', electronPkg, '--dev'] }
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
      await executeCommand('npm', ['install', electronPkg, '--save-dev', '--registry', 'https://registry.npmjs.org/']);
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
    packageManagers.push({ cmd: 'yarn', args: dev ? ['add', packageName, '--dev'] : ['add', packageName] });
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
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait before retry
        }
      }
    }
  }

  logError(`Failed to install ${packageName} with all available package managers`);
  return false;
}

// Execute command with promise
function executeCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    logInfo(`Executing: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options
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

// Package the application
async function package() {
  try {
    log('📦 Packaging Electron Application', 'cyan');
    
    // Ensure Electron is properly installed first
    const electronOk = await ensureElectronInstalled();
    if (!electronOk) {
      throw new Error('Failed to install Electron');
    }

    // First build the application
    logInfo('Building application before packaging...');
    const { build } = require('./build-robust');
    await build();
    
    // Check if electron-builder is installed
    if (!packageExists('electron-builder')) {
      logWarning('electron-builder not found. Installing...');
      const success = await installPackage('electron-builder', { dev: true });
      if (!success) {
        throw new Error('Failed to install electron-builder');
      }
    }
    
    // Check if main.cjs exists
    if (!fs.existsSync('main.cjs')) {
      throw new Error('main.cjs not found. Please ensure the main process file exists.');
    }
    
    // Package with electron-builder
    logInfo('Packaging with electron-builder...');
    await executeCommand('./node_modules/.bin/electron-builder', ['--publish=never']);
    
    logSuccess('Packaging completed successfully!');
    logInfo('Check the dist/ directory for packaged application.');
    
  } catch (error) {
    logError(`Packaging failed: ${error.message}`);
    
    // Enhanced recovery with multiple strategies
    logInfo('Attempting comprehensive recovery...');
    try {
      // Strategy 1: Ensure Electron is installed
      await ensureElectronInstalled();
      
      // Strategy 2: Reinstall electron-builder
      await installPackage('electron-builder', { dev: true, force: true });
      
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
      
      logSuccess('Comprehensive recovery completed. Please try packaging again.');
    } catch (recoveryError) {
      logError(`Recovery failed: ${recoveryError.message}`);
      logError('Please run "rm -rf node_modules package-lock.json" then "npm install" or "bun install" manually and try again.');
    }
    
    process.exit(1);
  }
}

// Run the packaging
if (require.main === module) {
  package();
}

module.exports = { package, installPackage };
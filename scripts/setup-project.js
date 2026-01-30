#!/usr/bin/env node

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

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

// Check if command exists
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch (_error) {
    return false;
  }
}

// Check if package is installed
function packageExists(packageName) {
  try {
    const packagePath = path.join(process.cwd(), 'node_modules', packageName);
    return fs.existsSync(packagePath);
  } catch (_error) {
    return false;
  }
}

// Install package if missing
async function installPackage(packageName, options = {}) {
  const { force = false, dev = false, global = false } = options;

  if (!force && !global && packageExists(packageName)) {
    logInfo(`${packageName} is already installed`);
    return true;
  }

  logWarning(`${packageName} not found. Installing...`);

  try {
    let command, args;

    if (global) {
      // Global installation
      if (process.env.USE_BUN === 'true' || commandExists('bun')) {
        command = 'bun';
        args = ['install', '-g', packageName];
      } else {
        command = 'npm';
        args = ['install', '-g', packageName];
      }
    } else {
      // Local installation
      const installCmd = dev ? 'install' : 'add';
      if (process.env.USE_BUN === 'true' || commandExists('bun')) {
        command = 'bun';
        args = [installCmd, packageName, dev ? '--dev' : ''];
      } else {
        command = 'npm';
        args = [installCmd, packageName, dev ? '--save-dev' : ''];
      }
    }

    await executeCommand(command, args.filter(Boolean));

    logSuccess(`${packageName} installed successfully`);
    return true;
  } catch (error) {
    logError(`Failed to install ${packageName}: ${error.message}`);
    return false;
  }
}

// Execute command with promise
function executeCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    logInfo(`Executing: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options,
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

// Check and install package manager
async function ensurePackageManager() {
  const hasBun = commandExists('bun');
  const hasNpm = commandExists('npm');

  if (!hasBun && !hasNpm) {
    logError('Neither bun nor npm found. Please install a package manager first.');
    logInfo('To install bun: curl -fsSL https://bun.sh/install | bash');
    logInfo('To install npm: https://nodejs.org/');
    process.exit(1);
  }

  if (hasBun) {
    logInfo('Using bun as package manager');
    process.env.USE_BUN = 'true';
  } else {
    logInfo('Using npm as package manager');
  }
}

// Validate project structure
function validateProjectStructure() {
  const requiredFiles = ['package.json', 'main.cjs', 'src/renderer/App.vue'];
  const requiredDirs = ['src', 'src/main', 'src/renderer'];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Required file not found: ${file}`);
    }
  }

  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      throw new Error(`Required directory not found: ${dir}`);
    }
  }

  logSuccess('Project structure validated');
}

// Full project setup
async function setupProject() {
  try {
    log('🔧 Setting up Electron + Vue + Rspack Project', 'cyan');

    // Ensure package manager
    await ensurePackageManager();

    // Validate project structure
    validateProjectStructure();

    // Install critical dependencies
    logInfo('Installing critical dependencies...');
    const criticalDeps = ['electron', 'vue', '@rspack/cli', '@rspack/core', 'vue-loader'];

    for (const dep of criticalDeps) {
      const isDev = ['@rspack/cli', '@rspack/core', 'vue-loader'].includes(dep);
      const success = await installPackage(dep, { dev: isDev });
      if (!success) {
        throw new Error(`Failed to install critical dependency: ${dep}`);
      }
    }

    // Install optional dependencies
    logInfo('Installing optional dependencies...');
    const optionalDeps = ['winbox', 'electron-builder', '@biomejs/biome', 'typescript'];

    for (const dep of optionalDeps) {
      const isDev = ['electron-builder', '@biomejs/biome', 'typescript'].includes(dep);
      await installPackage(dep, { dev: isDev });
    }

    // Run post-install scripts
    if (packageExists('electron-builder')) {
      logInfo('Running electron-builder post-install...');
      try {
        await executeCommand('./node_modules/.bin/electron-builder', ['install-app-deps']);
      } catch (_error) {
        logWarning('electron-builder post-install failed, but continuing...');
      }
    }

    logSuccess('Project setup completed successfully!');
    logInfo('You can now run:');
    logInfo('  npm run dev     - Start development server');
    logInfo('  npm run build   - Build for production');
    logInfo('  npm run package - Package application');
  } catch (error) {
    logError(`Project setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run setup
if (require.main === module) {
  setupProject();
}

module.exports = { setupProject, installPackage, ensurePackageManager };

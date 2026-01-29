const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const getPortModule = require('get-port');
const waitOn = require('wait-on');

// Handle both CommonJS and ES module formats for get-port
const getPort = typeof getPortModule === 'function' ? getPortModule : getPortModule.default;

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

// Check if npm/bun package is installed
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

// Validate all dependencies with enhanced Electron handling
async function validateDependencies() {
  logInfo('Validating project dependencies...');

  // Ensure Electron is properly installed first
  const electronOk = await ensureElectronInstalled();
  if (!electronOk) {
    throw new Error('Failed to install Electron');
  }

  const criticalDeps = ['vue', '@rspack/cli'];
  const devDeps = ['@rspack/core', 'vue-loader'];

  for (const dep of criticalDeps) {
    if (!packageExists(dep)) {
      logWarning(`Missing critical dependency: ${dep}`);
      const success = await installPackage(dep);
      if (!success) {
        throw new Error(`Failed to install critical dependency: ${dep}`);
      }
    }
  }

  for (const dep of devDeps) {
    if (!packageExists(dep)) {
      logWarning(`Missing dev dependency: ${dep}`);
      const success = await installPackage(dep, { dev: true });
      if (!success) {
        logWarning(`Continuing without dev dependency: ${dep}`);
      }
    }
  }

  logSuccess('Dependencies validated');
}

// Check if port is available and wait for server
async function waitForServer(port, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      logInfo(`Waiting for server on port ${port} (attempt ${i + 1}/${retries})...`);
      await waitOn({
        resources: [`http://localhost:${port}`],
        timeout: 30000,
        interval: 2000,
      });
      logSuccess(`Server is ready on port ${port}`);
      return true;
    } catch (error) {
      logWarning(`Attempt ${i + 1} failed: ${error.message}`);
      if (i === retries - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

// Kill processes on port
async function killPortProcesses(port) {
  try {
    if (process.platform === 'win32') {
      // Windows approach
      await executeCommand('cmd', ['/c', `netstat -ano | findstr :${port} | findstr LISTENING`]);
    } else {
      // Unix/Linux approach - use fuser if available, fallback to lsof
      try {
        await executeCommand('fuser', ['-k', `${port}/tcp`]);
        logInfo(`Killed processes on port ${port} using fuser`);
      } catch (fuserError) {
        // Fallback to lsof with proper shell escaping
        const { execSync } = require('child_process');
        try {
          const pids = execSync(`lsof -ti :${port}`, { encoding: 'utf8' }).trim();
          if (pids) {
            execSync(`kill -9 ${pids}`);
            logInfo(`Killed processes on port ${port} using lsof`);
          }
        } catch (lsofError) {
          logWarning('Could not kill processes on port (no processes found or tools unavailable)');
        }
      }
    }
  } catch (error) {
    logWarning('Could not kill processes on port');
  }
}

// Main development server function
async function startDevServer() {
  let rspackProcess = null;
  let electronProcess = null;

  try {
    log('🚀 Starting Electron + Vue + Rspack Development Server', 'cyan');

    // Validate dependencies first
    await validateDependencies();

    // Get a random available port
    const port = await getPort({ port: 1234 });
    logInfo(`Using port: ${port}`);

    // Set environment variables
    process.env.PORT = port.toString();
    process.env.NODE_ENV = 'development';

    // Kill any existing processes on the port
    await killPortProcesses(port);

    // Start Rspack dev server
    logInfo('Starting Rspack development server...');
    rspackProcess = spawn('./node_modules/.bin/rspack', ['serve', '--port', port], {
      stdio: 'inherit',
      env: { ...process.env },
    });

    // Wait for server to be ready
    await waitForServer(port);

    // Set Electron start URL
    process.env.ELECTRON_START_URL = `http://localhost:${port}`;

    // Start Electron
    logInfo('Starting Electron application...');

    // Check if main.cjs exists
    if (!fs.existsSync('main.cjs')) {
      throw new Error('main.cjs not found. Please ensure the main process file exists.');
    }

    electronProcess = spawn('bunx', ['electron', 'main.cjs', '--start-dev'], {
      stdio: 'inherit',
      env: { ...process.env, ELECTRON_START_URL: `http://localhost:${port}` },
    });

    // Handle process cleanup
    const cleanup = () => {
      logInfo('Shutting down development server...');
      if (electronProcess) {
        electronProcess.kill('SIGTERM');
      }
      if (rspackProcess) {
        rspackProcess.kill('SIGTERM');
      }
    };

    // Handle exit signals
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    electronProcess.on('close', (code) => {
      logInfo(`Electron process exited with code ${code}`);
      if (rspackProcess) {
        rspackProcess.kill('SIGTERM');
      }

      // If Electron exits unexpectedly, don't immediately kill the dev server
      if (code !== 0 && code !== null) {
        logWarning('Electron exited with an error. Dev server will continue running.');
        logInfo('You can restart Electron by pressing Ctrl+C and running the command again.');
      }
    });

    electronProcess.on('error', (error) => {
      logError(`Electron process error: ${error.message}`);
    });

    rspackProcess.on('close', (code) => {
      logInfo(`Rspack process exited with code ${code}`);
      if (electronProcess) {
        electronProcess.kill('SIGTERM');
      }
    });

    logSuccess('Development server started successfully!');
    log('Press Ctrl+C to stop the server', 'yellow');
  } catch (error) {
    logError(`Failed to start development server: ${error.message}`);

    // Cleanup on error
    if (electronProcess) {
      electronProcess.kill('SIGTERM');
    }
    if (rspackProcess) {
      rspackProcess.kill('SIGTERM');
    }

    // Try to recover by reinstalling dependencies
    logInfo('Attempting recovery by reinstalling dependencies...');
    try {
      await validateDependencies();
      logSuccess('Recovery completed. Please try running the command again.');
    } catch (recoveryError) {
      logError(`Recovery failed: ${recoveryError.message}`);
      logError('Please run "npm install" or "bun install" manually and try again.');
    }

    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Start the development server
if (require.main === module) {
  startDevServer();
}

module.exports = { startDevServer, validateDependencies, installPackage };

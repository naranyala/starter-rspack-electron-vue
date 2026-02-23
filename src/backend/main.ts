import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow } from 'electron';
import { createLogger } from '../shared/logger/index.js';
import { appConfig } from './config/index.js';
import {
  initializeBackendContainer,
  inject,
  registerAllIpcHandlers,
  WINDOW_MANAGER_TOKEN,
} from './di/index.js';
import { getBackendEventBus, initializeBackendEventBus } from './events/backend-event-bus.js';
import { AppLifecycleUtils } from './services/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = createLogger('Main');

/**
 * Application entry point
 *
 * Architecture:
 * 1. Initialize DI container with all services and handlers
 * 2. Initialize event bus for cross-process communication
 * 3. Create main window using WindowManager from DI
 * 4. Register all IPC handlers through the registry
 */

let mainWindow: BrowserWindow | null = null;

const createWindow = (): BrowserWindow => {
  // Resolve services from DI container
  const windowManager = inject(WINDOW_MANAGER_TOKEN);

  const mainWindowInstance = windowManager.createWindow({
    ...appConfig.mainWindow,
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../assets/icons/icon.png'),
    show: false,
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindowInstance.loadURL('http://localhost:1234');
  } else {
    mainWindowInstance.loadFile(path.join(__dirname, '../frontend/index.html'));
  }

  mainWindowInstance.once('ready-to-show', () => {
    mainWindowInstance.show();
  });

  mainWindowInstance.on('closed', () => {
    mainWindow = null;
  });

  mainWindow = mainWindowInstance;
  return mainWindowInstance;
};

// Initialize the application
const bootstrap = () => {
  // Step 1: Initialize DI container with all services, handlers, and use cases
  initializeBackendContainer();

  // Step 2: Initialize event bus for cross-process communication
  initializeBackendEventBus();
  const eventBus = getBackendEventBus();

  // Step 3: Register all IPC handlers
  registerAllIpcHandlers();

  // Step 4: Create the main window
  createWindow();

  // Step 5: Emit app initialized event
  eventBus.emit('app:initialized', { version: app.getVersion() });

  logger.info('Application bootstrap completed');
};

AppLifecycleUtils.onReady(() => {
  bootstrap();
});

AppLifecycleUtils.onWindowAllClosed(() => {
  if (process.platform !== 'darwin') {
    AppLifecycleUtils.quit();
  }
});

AppLifecycleUtils.onActivate(() => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Export for testing
export { createWindow, bootstrap };

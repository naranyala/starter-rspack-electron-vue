import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { appConfig } from './lib/config.js';
// Import main process utilities
import { AppLifecycleUtils, IPCUtils, SettingsManager, WindowManager } from './lib/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let windowManager;
let settingsManager;

const createWindow = () => {
  windowManager = new WindowManager();
  settingsManager = new SettingsManager();

  const mainWindow = windowManager.createWindow({
    ...appConfig.mainWindow,
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../assets/icons/icon.png'),
    show: false,
  });

  // Load app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:1234');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    windowManager = null;
  });

  // Register IPC handlers
  registerIPCHandlers(mainWindow);

  return mainWindow;
};

const registerIPCHandlers = (mainWindow) => {
  // Get app version
  IPCUtils.registerHandler('app:getVersion', () => {
    return app.getVersion();
  });

  // Get app name
  IPCUtils.registerHandler('app:getName', () => {
    return app.getName();
  });

  // Get settings
  IPCUtils.registerHandler('settings:get', (event, key) => {
    return settingsManager.get(key);
  });

  // Set settings
  IPCUtils.registerHandler('settings:set', (event, key, value) => {
    settingsManager.set(key, value);
    return true;
  });

  // Get all settings
  IPCUtils.registerHandler('settings:getAll', () => {
    return settingsManager.getAll();
  });

  // Show message box
  IPCUtils.registerHandler('dialog:showMessageBox', async (event, options) => {
    return await windowManager.showDialog(options);
  });

  // Minimize window
  IPCUtils.registerHandler('window:minimize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.minimize();
    }
    return true;
  });

  // Maximize window
  IPCUtils.registerHandler('window:maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    }
    return true;
  });

  // Close window
  IPCUtils.registerHandler('window:close', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.close();
    }
    return true;
  });
};

// App lifecycle
AppLifecycleUtils.onReady(() => {
  createWindow();
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

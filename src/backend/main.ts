import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, type IpcMainInvokeEvent, ipcMain } from 'electron';
import { appConfig } from './config/index.js';
import { AppLifecycleUtils, IPCUtils, SettingsManager, WindowManager } from './services/index.js';
import {
  ElectronArchitectureUseCase,
  ElectronDevelopmentUseCase,
  ElectronIntroUseCase,
  ElectronNativeAPIsUseCase,
  ElectronPackagingUseCase,
  ElectronPerformanceUseCase,
  ElectronSecurityUseCase,
  ElectronVersionsUseCase,
} from './use-cases/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let windowManager: WindowManager;
let settingsManager: SettingsManager;

const createWindow = (): BrowserWindow => {
  windowManager = new WindowManager();
  settingsManager = new SettingsManager();

  const mainWindow = windowManager.createWindow({
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
    mainWindow.loadURL('http://localhost:1234');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    windowManager = null as unknown as WindowManager;
  });

  registerIPCHandlers(mainWindow);

  return mainWindow;
};

const registerIPCHandlers = (_mainWindow: BrowserWindow) => {
  IPCUtils.registerHandler('app:getVersion', () => {
    return app.getVersion();
  });

  IPCUtils.registerHandler('app:getName', () => {
    return app.getName();
  });

  IPCUtils.registerHandler('settings:get', (_event: IpcMainInvokeEvent, key: string) => {
    return settingsManager.get(key);
  });

  IPCUtils.registerHandler(
    'settings:set',
    (_event: IpcMainInvokeEvent, key: string, value: unknown) => {
      settingsManager.set(key, value);
      return true;
    }
  );

  IPCUtils.registerHandler('settings:getAll', () => {
    return settingsManager.getAll();
  });

  IPCUtils.registerHandler(
    'dialog:showMessageBox',
    async (_event: IpcMainInvokeEvent, options: Electron.MessageBoxOptions) => {
      return await windowManager.showDialog(options);
    }
  );

  IPCUtils.registerHandler('window:minimize', (event: IpcMainInvokeEvent) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.minimize();
    }
    return true;
  });

  IPCUtils.registerHandler('window:maximize', (event: IpcMainInvokeEvent) => {
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

  IPCUtils.registerHandler('window:close', (event: IpcMainInvokeEvent) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.close();
    }
    return true;
  });

  registerUseCaseHandlers();
};

const registerUseCaseHandlers = () => {
  const useCases = [
    new ElectronIntroUseCase(ipcMain),
    new ElectronArchitectureUseCase(ipcMain),
    new ElectronSecurityUseCase(ipcMain),
    new ElectronPackagingUseCase(ipcMain),
    new ElectronNativeAPIsUseCase(ipcMain),
    new ElectronPerformanceUseCase(ipcMain),
    new ElectronDevelopmentUseCase(ipcMain),
    new ElectronVersionsUseCase(ipcMain),
  ];

  useCases.forEach((useCase) => {
    useCase.registerHandlers();
  });
};

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

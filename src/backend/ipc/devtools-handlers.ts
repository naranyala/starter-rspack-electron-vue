/**
 * DevTools IPC Handlers
 * 
 * Provides backend information and debugging capabilities to the frontend DevTools panel.
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import { BaseIpcHandler } from './base-ipc-handler';
import { WindowManager } from '../services/window-manager';

const DEVTOOLS_CHANNELS = {
  GET_SYSTEM_INFO: 'devtools:system-info',
  GET_WINDOWS: 'devtools:windows',
  GET_SETTINGS: 'devtools:settings',
  GET_LOGS: 'devtools:logs',
  CLEAR_LOGS: 'devtools:clear-logs',
  EXECUTE_COMMAND: 'devtools:execute-command',
} as const;

export class DevToolsHandlers extends BaseIpcHandler {
  protected get channelPrefix(): string {
    return 'devtools';
  }

  private windowManager: WindowManager;
  private logs: Array<{
    timestamp: number;
    level: string;
    message: string;
    data?: unknown;
  }> = [];

  constructor(windowManager: WindowManager) {
    super();
    this.windowManager = windowManager;
  }

  registerHandlers(): void {
    // Get system information
    ipcMain.handle(DEVTOOLS_CHANNELS.GET_SYSTEM_INFO, async () => {
      return this.getSystemInfo();
    });

    // Get window information
    ipcMain.handle(DEVTOOLS_CHANNELS.GET_WINDOWS, async () => {
      return this.getWindowsInfo();
    });

    // Get all settings
    ipcMain.handle(DEVTOOLS_CHANNELS.GET_SETTINGS, async () => {
      return this.getSettings();
    });

    // Get logs
    ipcMain.handle(DEVTOOLS_CHANNELS.GET_LOGS, async () => {
      return this.logs;
    });

    // Clear logs
    ipcMain.handle(DEVTOOLS_CHANNELS.CLEAR_LOGS, async () => {
      this.logs = [];
      return { success: true };
    });

    // Execute debug command
    ipcMain.handle(
      DEVTOOLS_CHANNELS.EXECUTE_COMMAND,
      async (_event, command: string, args: unknown[]) => {
        return this.executeCommand(command, args);
      }
    );

    // Setup log interception
    this.interceptConsole();
  }

  private getSystemInfo() {
    const process = require('process');
    const os = require('os');

    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      chromeVersion: process.versions.chrome,
      electronVersion: process.versions.electron,
      appVersion: app.getVersion(),
      appName: app.getName(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
      systemMemory: {
        total: os.totalmem(),
        free: os.freemem(),
      },
      cpuInfo: os.cpus()[0],
    };
  }

  private getWindowsInfo() {
    const windows = this.windowManager.getAllWindows();
    return windows.map((win) => {
      const bounds = win.getBounds();
      return {
        id: win.id,
        title: win.getTitle(),
        type: 'main',
        bounds: {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        },
        isFocused: win.isFocused(),
        isMinimized: win.isMinimized(),
        isMaximized: win.isMaximized(),
        isVisible: win.isVisible(),
        webContentsId: win.webContents?.id,
        url: win.webContents?.getURL(),
      };
    });
  }

  private getSettings() {
    // This would integrate with your settings manager
    return {};
  }

  private async executeCommand(command: string, args: unknown[]) {
    try {
      switch (command) {
        case 'reload-window': {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          if (focusedWindow) {
            focusedWindow.reload();
            return { success: true, message: 'Window reloaded' };
          }
          return { success: false, message: 'No focused window' };
        }

        case 'open-devtools': {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          if (focusedWindow) {
            focusedWindow.webContents.openDevTools();
            return { success: true, message: 'DevTools opened' };
          }
          return { success: false, message: 'No focused window' };
        }

        case 'close-devtools': {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          if (focusedWindow) {
            focusedWindow.webContents.closeDevTools();
            return { success: true, message: 'DevTools closed' };
          }
          return { success: false, message: 'No focused window' };
        }

        case 'clear-cache': {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          if (focusedWindow?.webContents) {
            await focusedWindow.webContents.session.clearCache();
            return { success: true, message: 'Cache cleared' };
          }
          return { success: false, message: 'No focused window' };
        }

        case 'clear-storage': {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          if (focusedWindow?.webContents) {
            await focusedWindow.webContents.session.clearStorageData();
            return { success: true, message: 'Storage cleared' };
          }
          return { success: false, message: 'No focused window' };
        }

        case 'get-process-info': {
          return {
            success: true,
            data: {
              pid: process.pid,
              memory: process.memoryUsage(),
              cpu: process.cpuUsage(),
              uptime: process.uptime(),
              versions: process.versions,
            },
          };
        }

        case 'gc': {
          // Force garbage collection (requires --expose-gc flag)
          if (global.gc) {
            global.gc();
            return { success: true, message: 'Garbage collection executed' };
          }
          return { success: false, message: 'GC not exposed (start with --expose-gc)' };
        }

        default:
          return { success: false, message: `Unknown command: ${command}` };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private interceptConsole() {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalDebug = console.debug;

    const addLog = (level: string, message: string, data?: unknown) => {
      this.logs.push({
        timestamp: Date.now(),
        level,
        message,
        data,
      });

      // Limit logs
      if (this.logs.length > 1000) {
        this.logs = this.logs.slice(-1000);
      }
    };

    console.log = (...args) => {
      addLog('info', args[0], args.slice(1));
      originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      addLog('warn', args[0], args.slice(1));
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      addLog('error', args[0], args.slice(1));
      originalError.apply(console, args);
    };

    console.debug = (...args) => {
      addLog('debug', args[0], args.slice(1));
      originalDebug.apply(console, args);
    };
  }

  /**
   * Add a log entry programmatically
   */
  log(level: string, message: string, data?: unknown) {
    this.logs.push({
      timestamp: Date.now(),
      level,
      message,
      data,
    });

    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }
}

// Singleton instance
let devToolsHandlers: DevToolsHandlers | null = null;

export function getDevToolsHandlers(windowManager: WindowManager): DevToolsHandlers {
  if (!devToolsHandlers) {
    devToolsHandlers = new DevToolsHandlers(windowManager);
  }
  return devToolsHandlers;
}

export { DEVTOOLS_CHANNELS };

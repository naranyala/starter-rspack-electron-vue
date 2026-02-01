import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  app,
  BrowserWindow,
  dialog,
  type IpcMainInvokeEvent,
  ipcMain,
  type MessageBoxOptions,
} from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Window management utilities for Electron main process
 */
export class WindowManager {
  private windows: Map<number, BrowserWindow>;

  constructor() {
    this.windows = new Map();
  }

  /**
   * Create a new browser window
   * @param options - Window options
   * @returns The created window
   */
  createWindow(options: Electron.BrowserWindowConstructorOptions = {}): BrowserWindow {
    const defaultOptions: Electron.BrowserWindowConstructorOptions = {
      width: 1024,
      height: 768,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
        preload: path.join(__dirname, '../preload.js'),
      },
      icon: path.join(__dirname, '../../assets/icons/icon.png'),
      show: false,
    };

    const window = new BrowserWindow({ ...defaultOptions, ...options });

    // Store window reference
    const windowId = window.id;
    this.windows.set(windowId, window);

    // Handle window close
    window.on('closed', () => {
      this.windows.delete(windowId);
    });

    return window;
  }

  /**
   * Get window by ID
   * @param windowId - Window ID
   * @returns The window or null if not found
   */
  getWindow(windowId: number): BrowserWindow | null {
    return this.windows.get(windowId) || null;
  }

  /**
   * Get all windows
   * @returns Array of all windows
   */
  getAllWindows(): BrowserWindow[] {
    return Array.from(this.windows.values());
  }

  /**
   * Close all windows
   */
  closeAllWindows(): void {
    this.windows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });
    this.windows.clear();
  }

  /**
   * Show a dialog box
   * @param options - Dialog options
   * @returns Dialog result
   */
  async showDialog(options: MessageBoxOptions): Promise<Electron.MessageBoxReturnValue> {
    return await dialog.showMessageBox(options);
  }
}

/**
 * File system utilities for main process
 */
export class FileSystemUtils {
  /**
   * Read file safely
   * @param filePath - Path to file
   * @returns File content or null if error
   */
  static async readFile(filePath: string): Promise<string | null> {
    try {
      const fs = await import('node:fs/promises');
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      console.error('Failed to read file:', error);
      return null;
    }
  }

  /**
   * Write file safely
   * @param filePath - Path to file
   * @param content - File content
   * @returns True if successful
   */
  static async writeFile(filePath: string, content: string): Promise<boolean> {
    try {
      const fs = await import('node:fs/promises');
      await fs.writeFile(filePath, content, 'utf8');
      return true;
    } catch (error) {
      console.error('Failed to write file:', error);
      return false;
    }
  }

  /**
   * Check if file exists
   * @param filePath - Path to file
   * @returns True if file exists
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      const fs = await import('node:fs/promises');
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * IPC (Inter-Process Communication) utilities
 */
export class IPCUtils {
  /**
   * Register IPC handler
   * @param channel - IPC channel name
   * @param handler - Handler function
   */
  static registerHandler(channel: string, handler: (...args: never) => unknown): void {
    ipcMain.handle(channel, handler as (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown);
  }

  /**
   * Send message to renderer
   * @param window - Target window
   * @param channel - IPC channel name
   * @param data - Data to send
   */
  static sendToRenderer(window: BrowserWindow, channel: string, data: unknown): void {
    if (window && !window.isDestroyed()) {
      window.webContents.send(channel, data);
    }
  }
}

/**
 * Application lifecycle utilities
 */
export class AppLifecycleUtils {
  /**
   * Handle app ready event
   * @param callback - Callback function
   */
  static onReady(callback: () => void): void {
    app.whenReady().then(callback);
  }

  /**
   * Handle window-all-closed event
   * @param callback - Callback function
   */
  static onWindowAllClosed(callback: () => void): void {
    app.on('window-all-closed', callback);
  }

  /**
   * Handle activate event (macOS dock click)
   * @param callback - Callback function
   */
  static onActivate(callback: () => void): void {
    app.on('activate', callback);
  }

  /**
   * Quit application
   */
  static quit(): void {
    app.quit();
  }
}

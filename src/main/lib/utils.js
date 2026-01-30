import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Window management utilities for Electron main process
 */
export class WindowManager {
  constructor() {
    this.windows = new Map();
  }

  /**
   * Create a new browser window
   * @param {Object} options - Window options
   * @returns {BrowserWindow} The created window
   */
  createWindow(options = {}) {
    const defaultOptions = {
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
   * @param {number} windowId - Window ID
   * @returns {BrowserWindow|null} The window or null if not found
   */
  getWindow(windowId) {
    return this.windows.get(windowId) || null;
  }

  /**
   * Get all windows
   * @returns {BrowserWindow[]} Array of all windows
   */
  getAllWindows() {
    return Array.from(this.windows.values());
  }

  /**
   * Close all windows
   */
  closeAllWindows() {
    this.windows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });
    this.windows.clear();
  }

  /**
   * Show a dialog box
   * @param {Object} options - Dialog options
   * @returns {Promise} Dialog result
   */
  async showDialog(options) {
    return await dialog.showMessageBox(options);
  }
}

/**
 * File system utilities for main process
 */
export class FileSystemUtils {
  /**
   * Read file safely
   * @param {string} filePath - Path to file
   * @returns {Promise<string|null>} File content or null if error
   */
  static async readFile(filePath) {
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
   * @param {string} filePath - Path to file
   * @param {string} content - File content
   * @returns {Promise<boolean>} True if successful
   */
  static async writeFile(filePath, content) {
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
   * @param {string} filePath - Path to file
   * @returns {Promise<boolean>} True if file exists
   */
  static async exists(filePath) {
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
   * @param {string} channel - IPC channel name
   * @param {Function} handler - Handler function
   */
  static registerHandler(channel, handler) {
    ipcMain.handle(channel, async (event, ...args) => {
      try {
        return await handler(event, ...args);
      } catch (error) {
        console.error(`IPC Handler Error for ${channel}:`, error);
        return { error: error.message };
      }
    });
  }

  /**
   * Send message to renderer
   * @param {BrowserWindow} window - Target window
   * @param {string} channel - IPC channel name
   * @param {any} data - Data to send
   */
  static sendToRenderer(window, channel, data) {
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
   * @param {Function} callback - Callback function
   */
  static onReady(callback) {
    app.whenReady().then(callback);
  }

  /**
   * Handle window-all-closed event
   * @param {Function} callback - Callback function
   */
  static onWindowAllClosed(callback) {
    app.on('window-all-closed', callback);
  }

  /**
   * Handle activate event (macOS dock click)
   * @param {Function} callback - Callback function
   */
  static onActivate(callback) {
    app.on('activate', callback);
  }

  /**
   * Quit application
   */
  static quit() {
    app.quit();
  }
}

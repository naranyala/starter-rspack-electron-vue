import { BrowserWindow, type IpcMainInvokeEvent } from 'electron';
import { BaseIpcHandler } from './base-ipc-handler';
import { WINDOW_CHANNELS } from '../../shared/constants';

/**
 * IPC handlers for window operations
 */
export class WindowHandlers extends BaseIpcHandler {
  protected get channelPrefix(): string {
    return 'window';
  }

  registerHandlers(): void {
    this.registerHandler('minimize', (event: IpcMainInvokeEvent) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        window.minimize();
      }
      return true;
    });

    this.registerHandler('maximize', (event: IpcMainInvokeEvent) => {
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

    this.registerHandler('close', (event: IpcMainInvokeEvent) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        window.close();
      }
      return true;
    });

    super.registerHandlers();
  }
}

// Singleton instance
let instance: WindowHandlers | null = null;

export function getWindowHandlers(): WindowHandlers {
  if (!instance) {
    instance = new WindowHandlers();
  }
  return instance;
}

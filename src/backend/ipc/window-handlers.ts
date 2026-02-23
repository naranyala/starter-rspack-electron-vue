import { BrowserWindow, type IpcMainInvokeEvent } from 'electron';
import { WINDOW_CHANNELS } from '../../shared/constants';
import { err, fromThrowable, ok, type Result, WindowError } from '../../shared/errors';
import { BaseIpcHandler, type IpcHandlerFn } from './base-ipc-handler';

/**
 * IPC handlers for window operations
 */
export class WindowHandlers extends BaseIpcHandler {
  protected get channelPrefix(): string {
    return 'window';
  }

  registerHandlers(): void {
    this.registerHandler('minimize', ((event: IpcMainInvokeEvent): Result<boolean, WindowError> => {
      return fromThrowable(
        () => {
          const window = BrowserWindow.fromWebContents(event.sender);
          if (window) {
            window.minimize();
          }
          return true;
        },
        (e) => new WindowError('Failed to minimize window', { cause: e })
      );
    }) as IpcHandlerFn);

    this.registerHandler('maximize', ((event: IpcMainInvokeEvent): Result<boolean, WindowError> => {
      return fromThrowable(
        () => {
          const window = BrowserWindow.fromWebContents(event.sender);
          if (window) {
            if (window.isMaximized()) {
              window.unmaximize();
            } else {
              window.maximize();
            }
          }
          return true;
        },
        (e) => new WindowError('Failed to maximize window', { cause: e })
      );
    }) as IpcHandlerFn);

    this.registerHandler('close', ((event: IpcMainInvokeEvent): Result<boolean, WindowError> => {
      return fromThrowable(
        () => {
          const window = BrowserWindow.fromWebContents(event.sender);
          if (window) {
            window.close();
          }
          return true;
        },
        (e) => new WindowError('Failed to close window', { cause: e })
      );
    }) as IpcHandlerFn);

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

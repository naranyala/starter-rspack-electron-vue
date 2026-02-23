import { ipcMain, type IpcMainInvokeEvent } from 'electron';

/**
 * Base interface for all IPC handlers
 */
export interface IpcHandler {
  /**
   * Register all IPC handlers for this module
   */
  registerHandlers(): void;

  /**
   * Unregister all IPC handlers (useful for cleanup/testing)
   */
  unregisterHandlers(): void;
}

/**
 * Base class for IPC handlers with common functionality
 */
export abstract class BaseIpcHandler implements IpcHandler {
  protected readonly handlers: Map<string, (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown> = new Map();

  /**
   * Get the channel prefix for this handler
   * e.g., 'app', 'settings', 'window'
   */
  protected abstract get channelPrefix(): string;

  /**
   * Register a handler for a specific channel
   */
  protected registerHandler(
    channel: string,
    handler: (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown
  ): void {
    const fullChannel = `${this.channelPrefix}:${channel}`;
    this.handlers.set(fullChannel, handler);
  }

  /**
   * Register all handlers with ipcMain
   */
  registerHandlers(): void {
    this.handlers.forEach((handler, channel) => {
      ipcMain.handle(channel, handler);
    });
  }

  /**
   * Unregister all handlers from ipcMain
   */
  unregisterHandlers(): void {
    this.handlers.forEach((_, channel) => {
      ipcMain.removeHandler(channel);
    });
  }
}

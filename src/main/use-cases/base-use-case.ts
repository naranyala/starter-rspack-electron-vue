import type { IpcMain } from 'electron';

/**
 * Base class for use case handlers in the main process
 */
export abstract class BaseUseCase {
  protected ipcMain: IpcMain;

  /**
   * Constructor for base use case
   * @param ipcMain - The ipcMain module from Electron
   */
  constructor(ipcMain: IpcMain) {
    this.ipcMain = ipcMain;
  }

  /**
   * Register IPC handlers for this use case
   */
  abstract registerHandlers(): void;

  /**
   * Helper method to send response back to renderer
   * @param event - The IPC event
   * @param channel - Response channel
   * @param data - Response data
   */
  protected sendResponse(event: Electron.IpcMainEvent, channel: string, data: unknown): void {
    event.reply(channel, data);
  }
}

/**
 * Base class for use case handlers in the main process
 */
export class BaseUseCase {
  /**
   * Constructor for base use case
   * @param {Object} ipcMain - The ipcMain module from Electron
   */
  constructor(ipcMain) {
    this.ipcMain = ipcMain;
  }

  /**
   * Register IPC handlers for this use case
   */
  registerHandlers() {
    throw new Error('registerHandlers method must be implemented in subclass');
  }

  /**
   * Helper method to send response back to renderer
   * @param {Event} event - The IPC event
   * @param {string} channel - Response channel
   * @param {any} data - Response data
   */
  sendResponse(event, channel, data) {
    event.reply(channel, data);
  }
}

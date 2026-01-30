import { WindowFactory } from './window-factory';

/**
 * Window component for displaying information about Electron
 */
export class ElectronIntroWindow {
  /**
   * Create a window with information about Electron
   * @param {Object} options - Additional window options
   * @returns {WinBox} The created winbox window instance
   */
  static create(options = {}) {
    return WindowFactory.createWindow('What is Electron?', null, {
      width: '600px',
      height: '450px',
      ...options,
    });
  }
}

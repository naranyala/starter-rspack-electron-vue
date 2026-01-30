import { WindowFactory } from './window-factory';

/**
 * Window component for displaying information about Electron Architecture
 */
export class ElectronArchitectureWindow {
  /**
   * Create a window with information about Electron Architecture
   * @param {Object} options - Additional window options
   * @returns {WinBox} The created winbox window instance
   */
  static create(options = {}) {
    return WindowFactory.createWindow('Electron Architecture', null, {
      width: '600px',
      height: '500px',
      ...options,
    });
  }
}

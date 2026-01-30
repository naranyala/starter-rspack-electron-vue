import { WindowFactory } from './window-factory';

/**
 * Window component for displaying information about Native Operating System APIs
 */
export class ElectronNativeAPIsWindow {
  /**
   * Create a window with information about Native Operating System APIs
   * @param {Object} options - Additional window options
   * @returns {WinBox} The created winbox window instance
   */
  static create(options = {}) {
    return WindowFactory.createWindow('Native Operating System APIs', null, {
      width: '600px',
      height: '450px',
      ...options,
    });
  }
}

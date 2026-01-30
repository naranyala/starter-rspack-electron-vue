import { WindowFactory } from './window-factory';

/**
 * Window component for displaying information about Version Management
 */
export class ElectronVersionsWindow {
  /**
   * Create a window with information about Version Management
   * @param {Object} options - Additional window options
   * @returns {WinBox} The created winbox window instance
   */
  static create(options = {}) {
    return WindowFactory.createWindow('Version Management', null, {
      width: '600px',
      height: '450px',
      ...options,
    });
  }
}

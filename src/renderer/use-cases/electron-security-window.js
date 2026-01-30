import { WindowFactory } from './window-factory';

/**
 * Window component for displaying information about Electron Security Best Practices
 */
export class ElectronSecurityWindow {
  /**
   * Create a window with information about Electron Security Best Practices
   * @param {Object} options - Additional window options
   * @returns {WinBox} The created winbox window instance
   */
  static create(options = {}) {
    return WindowFactory.createWindow('Electron Security Best Practices', null, {
      width: '600px',
      height: '450px',
      ...options,
    });
  }
}

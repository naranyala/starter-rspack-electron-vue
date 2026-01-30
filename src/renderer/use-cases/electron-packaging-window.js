import { WindowFactory } from './window-factory';

/**
 * Window component for displaying information about Packaging and Distribution
 */
export class ElectronPackagingWindow {
  /**
   * Create a window with information about Packaging and Distribution
   * @param {Object} options - Additional window options
   * @returns {WinBox} The created winbox window instance
   */
  static create(options = {}) {
    return WindowFactory.createWindow('Packaging and Distribution', null, {
      width: '600px',
      height: '450px',
      ...options,
    });
  }
}

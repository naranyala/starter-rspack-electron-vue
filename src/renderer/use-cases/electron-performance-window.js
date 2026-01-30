import { WindowFactory } from './window-factory';

/**
 * Window component for displaying information about Performance Optimization
 */
export class ElectronPerformanceWindow {
  /**
   * Create a window with information about Performance Optimization
   * @param {Object} options - Additional window options
   * @returns {WinBox} The created winbox window instance
   */
  static create(options = {}) {
    return WindowFactory.createWindow('Performance Optimization', null, {
      width: '600px',
      height: '450px',
      ...options,
    });
  }
}

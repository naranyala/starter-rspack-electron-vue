import { WindowFactory } from './window-factory';

/**
 * Window component for displaying information about Development Workflow
 */
export class ElectronDevelopmentWindow {
  /**
   * Create a window with information about Development Workflow
   * @param {Object} options - Additional window options
   * @returns {WinBox} The created winbox window instance
   */
  static create(options = {}) {
    return WindowFactory.createWindow('Development Workflow', null, {
      width: '600px',
      height: '450px',
      ...options,
    });
  }
}

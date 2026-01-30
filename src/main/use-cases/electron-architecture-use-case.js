import { BaseUseCase } from './base-use-case';

/**
 * Use case handler for Electron Architecture window
 */
export class ElectronArchitectureUseCase extends BaseUseCase {
  /**
   * Register IPC handlers for Electron Architecture window
   */
  registerHandlers() {
    // Example handler for getting specific data for Electron Architecture window
    this.ipcMain.handle('electron-architecture:get-data', async (_event, _params) => {
      return {
        title: 'Electron Architecture',
        content:
          '<p>Electron applications have two main processes: the Main Process and the Renderer Process. The Main Process controls the life cycle of the app and creates browser windows. The Renderer Process renders the UI and runs in the browser window.</p><p>Communication between processes happens via IPC (Inter-Process Communication). This architecture allows for secure separation of concerns while maintaining flexibility.</p>',
        processes: ['Main Process', 'Renderer Process', 'Preload Script'],
        communicationMethods: ['IPC (Inter-Process Communication)', 'Context Bridge'],
      };
    });

    // Handler for performing actions specific to Electron Architecture window
    this.ipcMain.handle('electron-architecture:perform-action', async (_event, action, data) => {
      console.log(
        `Performing action '${action}' for Electron Architecture window with data:`,
        data
      );

      // Perform the action based on the type
      switch (action) {
        case 'visualize-architecture':
          // Logic to visualize the architecture
          return { success: true, message: 'Visualizing Electron architecture...' };
        case 'generate-template':
          // Logic to generate architecture template
          return { success: true, message: 'Generating architecture template...' };
        default:
          return { success: false, message: `Unknown action: ${action}` };
      }
    });
  }
}

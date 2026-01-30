import { BaseUseCase } from './base-use-case';

/**
 * Use case handler for Electron Intro window
 */
export class ElectronIntroUseCase extends BaseUseCase {
  /**
   * Register IPC handlers for Electron Intro window
   */
  registerHandlers() {
    // Example handler for getting specific data for Electron Intro window
    this.ipcMain.handle('electron-intro:get-data', async (_event, _params) => {
      return {
        title: 'What is Electron?',
        content:
          '<p>Electron is a framework for building cross-platform desktop applications using web technologies like HTML, CSS, and JavaScript. It combines the Chromium rendering engine and the Node.js runtime.</p><p>With Electron, you can develop desktop applications that run on Windows, macOS, and Linux using familiar web technologies. Popular applications like Visual Studio Code, Slack, Discord, and WhatsApp Desktop are built with Electron.</p>',
        relatedTopics: [
          'Electron Architecture',
          'Development Workflow',
          'Packaging and Distribution',
        ],
      };
    });

    // Handler for performing actions specific to Electron Intro window
    this.ipcMain.handle('electron-intro:perform-action', async (_event, action, data) => {
      console.log(`Performing action '${action}' for Electron Intro window with data:`, data);

      // Perform the action based on the type
      switch (action) {
        case 'open-docs':
          // Logic to open Electron documentation
          return { success: true, message: 'Opening Electron documentation...' };
        case 'create-project':
          // Logic to create a new Electron project
          return { success: true, message: 'Creating new Electron project...' };
        default:
          return { success: false, message: `Unknown action: ${action}` };
      }
    });
  }
}

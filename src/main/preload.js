import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any APIs you want to expose to the renderer
  getVersion: () => process.env.npm_package_version,
  getPlatform: () => process.platform,
});

// Remove unnecessary preload scripts for security

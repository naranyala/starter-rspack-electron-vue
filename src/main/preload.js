import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App methods
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getName: () => ipcRenderer.invoke('app:getName'),

  // Settings methods
  getSetting: (key) => ipcRenderer.invoke('settings:get', key),
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  getAllSettings: () => ipcRenderer.invoke('settings:getAll'),

  // Dialog methods
  showMessageBox: (options) => ipcRenderer.invoke('dialog:showMessageBox', options),

  // Window methods
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),

  // Event listeners
  on: (channel, callback) => {
    const validChannels = ['app:menu-click', 'settings:changed', 'window:focus', 'window:blur'];

    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },

  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },

  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

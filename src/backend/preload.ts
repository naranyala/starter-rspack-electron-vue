import { contextBridge, ipcRenderer } from 'electron';
import {
  APP_CHANNELS,
  DIALOG_CHANNELS,
  EVENT_CHANNELS,
  RENDERER_LISTENABLE_EVENTS,
  SETTINGS_CHANNELS,
  WINDOW_CHANNELS,
} from '../shared/constants';

// Define the shape of the API exposed to the renderer process
export interface ElectronAPI {
  // App methods
  getVersion: () => Promise<string>;
  getName: () => Promise<string>;

  // Settings methods
  getSetting: (key: string) => Promise<unknown>;
  setSetting: (key: string, value: unknown) => Promise<void>;
  getAllSettings: () => Promise<Record<string, unknown>>;

  // Dialog methods
  showMessageBox: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>;

  // Window methods
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;

  // Event bus methods
  eventSubscribe: (eventType: string) => Promise<void>;
  eventUnsubscribe: (eventType: string) => Promise<void>;
  eventEmit: (eventType: string, payload: unknown) => Promise<void>;

  // Event listeners
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (channel: string, callback: (...args: unknown[]) => void) => void;
  removeAllListeners: (channel: string) => void;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App methods
  getVersion: () => ipcRenderer.invoke(APP_CHANNELS.GET_VERSION),
  getName: () => ipcRenderer.invoke(APP_CHANNELS.GET_NAME),

  // Settings methods
  getSetting: (key: string) => ipcRenderer.invoke(SETTINGS_CHANNELS.GET, key),
  setSetting: (key: string, value: unknown) =>
    ipcRenderer.invoke(SETTINGS_CHANNELS.SET, key, value),
  getAllSettings: () => ipcRenderer.invoke(SETTINGS_CHANNELS.GET_ALL),

  // Dialog methods
  showMessageBox: (options: Electron.MessageBoxOptions) =>
    ipcRenderer.invoke(DIALOG_CHANNELS.SHOW_MESSAGE_BOX, options),

  // Window methods
  minimizeWindow: () => ipcRenderer.invoke(WINDOW_CHANNELS.MINIMIZE),
  maximizeWindow: () => ipcRenderer.invoke(WINDOW_CHANNELS.MAXIMIZE),
  closeWindow: () => ipcRenderer.invoke(WINDOW_CHANNELS.CLOSE),

  // Event bus methods
  eventSubscribe: (eventType: string) => ipcRenderer.invoke(EVENT_CHANNELS.SUBSCRIBE, eventType),
  eventUnsubscribe: (eventType: string) =>
    ipcRenderer.invoke(EVENT_CHANNELS.UNSUBSCRIBE, eventType),
  eventEmit: (eventType: string, payload: unknown) =>
    ipcRenderer.invoke(EVENT_CHANNELS.EMIT, eventType, payload),

  // Event listeners - using whitelist for security
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    if (RENDERER_LISTENABLE_EVENTS.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },

  removeListener: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },

  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
} as ElectronAPI);

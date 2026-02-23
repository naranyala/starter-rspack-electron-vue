import type { Result } from '../../shared/errors';
import type { ElectronAPI } from '../../types/electron-api';

/**
 * Electron API Service
 *
 * Provides a typed, testable abstraction over window.electronAPI
 * This makes it easier to mock in tests and provides better type safety
 */
export class ElectronApiService implements ElectronAPI {
  private readonly api: ElectronAPI;

  constructor() {
    if (!window.electronAPI) {
      console.warn('Electron API not available - running in web mode?');
      this.api = this.createWebFallback();
    } else {
      this.api = window.electronAPI;
    }
  }

  private createWebFallback(): ElectronAPI {
    return {
      getVersion: async () => '0.0.0-web',
      getName: async () => 'App (Web Mode)',
      getSetting: async () => null,
      setSetting: async () => {},
      getAllSettings: async () => ({}),
      showMessageBox: async () => ({ response: 0 }),
      minimizeWindow: async () => {},
      maximizeWindow: async () => {},
      closeWindow: async () => {},
      on: () => {},
      removeListener: () => {},
      removeAllListeners: () => {},
    };
  }

  // App methods
  async getVersion(): Promise<string> {
    return this.api.getVersion();
  }

  async getName(): Promise<string> {
    return this.api.getName();
  }

  // Settings methods
  async getSetting(key: string): Promise<Result<unknown, Error>> {
    return this.api.getSetting(key) as Promise<Result<unknown, Error>>;
  }

  async setSetting(key: string, value: unknown): Promise<Result<boolean, Error>> {
    return this.api.setSetting(key, value) as Promise<Result<boolean, Error>>;
  }

  async getAllSettings(): Promise<Result<Record<string, unknown>, Error>> {
    return this.api.getAllSettings() as Promise<Result<Record<string, unknown>, Error>>;
  }

  // Dialog methods
  async showMessageBox(
    options: Electron.MessageBoxOptions
  ): Promise<Electron.MessageBoxReturnValue> {
    return this.api.showMessageBox(options);
  }

  // Window methods
  async minimizeWindow(): Promise<void> {
    return this.api.minimizeWindow();
  }

  async maximizeWindow(): Promise<void> {
    return this.api.maximizeWindow();
  }

  async closeWindow(): Promise<void> {
    return this.api.closeWindow();
  }

  // Event listeners
  on(channel: string, callback: (...args: unknown[]) => void): void {
    this.api.on(channel, callback);
  }

  removeListener(channel: string, callback: (...args: unknown[]) => void): void {
    this.api.removeListener(channel, callback);
  }

  removeAllListeners(channel: string): void {
    this.api.removeAllListeners(channel);
  }
}

// Singleton instance
let electronApiService: ElectronApiService | null = null;

export function getElectronApiService(): ElectronApiService {
  if (!electronApiService) {
    electronApiService = new ElectronApiService();
  }
  return electronApiService;
}

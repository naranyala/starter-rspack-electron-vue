import { type IpcMainInvokeEvent } from 'electron';
import { BaseIpcHandler } from './base-ipc-handler';
import { SETTINGS_CHANNELS } from '../../shared/constants';
import type { SettingsManager } from '../services';

/**
 * IPC handlers for settings operations
 */
export class SettingsHandlers extends BaseIpcHandler {
  private settingsManager: SettingsManager;

  constructor(settingsManager: SettingsManager) {
    super();
    this.settingsManager = settingsManager;
  }

  protected get channelPrefix(): string {
    return 'settings';
  }

  registerHandlers(): void {
    this.registerHandler('get', (_event: IpcMainInvokeEvent, key: string) => {
      return this.settingsManager.get(key);
    });

    this.registerHandler('set', (_event: IpcMainInvokeEvent, key: string, value: unknown) => {
      this.settingsManager.set(key, value);
      return true;
    });

    this.registerHandler('getAll', () => {
      return this.settingsManager.getAll();
    });

    super.registerHandlers();
  }
}

// Factory function
export function createSettingsHandlers(settingsManager: SettingsManager): SettingsHandlers {
  return new SettingsHandlers(settingsManager);
}

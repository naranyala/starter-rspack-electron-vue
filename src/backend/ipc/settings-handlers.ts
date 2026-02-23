import type { IpcMainInvokeEvent } from 'electron';
import { fromThrowable, type Result, SettingsError } from '../../shared/errors';
import type { SettingsManager } from '../services';
import { BaseIpcHandler, type IpcHandlerFn } from './base-ipc-handler';

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
    this.registerHandler('get', ((
      _event: IpcMainInvokeEvent,
      key: string
    ): Result<unknown, SettingsError> => {
      return fromThrowable(
        () => this.settingsManager.get(key),
        (e) => new SettingsError(`Failed to get setting: ${key}`, { cause: e })
      );
    }) as IpcHandlerFn);

    this.registerHandler('set', ((
      _event: IpcMainInvokeEvent,
      key: string,
      value: unknown
    ): Result<boolean, SettingsError> => {
      return fromThrowable(
        () => {
          this.settingsManager.set(key, value);
          return true;
        },
        (e) => new SettingsError(`Failed to set setting: ${key}`, { cause: e })
      );
    }) as IpcHandlerFn);

    this.registerHandler('getAll', ((): Result<Record<string, unknown>, SettingsError> => {
      return fromThrowable(
        () => this.settingsManager.getAll(),
        (e) => new SettingsError('Failed to get all settings', { cause: e })
      );
    }) as IpcHandlerFn);

    super.registerHandlers();
  }
}

// Factory function
export function createSettingsHandlers(settingsManager: SettingsManager): SettingsHandlers {
  return new SettingsHandlers(settingsManager);
}

import type { IpcMainInvokeEvent, MessageBoxOptions } from 'electron';
import { DIALOG_CHANNELS } from '../../shared/constants';
import { err, ok, type Result, tryCatch, WindowError } from '../../shared/errors';
import type { WindowManager } from '../services';
import { BaseIpcHandler, type IpcHandlerFn } from './base-ipc-handler';

/**
 * IPC handlers for dialog operations
 */
export class DialogHandlers extends BaseIpcHandler {
  private windowManager: WindowManager;

  constructor(windowManager: WindowManager) {
    super();
    this.windowManager = windowManager;
  }

  protected get channelPrefix(): string {
    return 'dialog';
  }

  registerHandlers(): void {
    this.registerHandler('showMessageBox', (async (
      _event: IpcMainInvokeEvent,
      options: MessageBoxOptions
    ): Promise<Result<Electron.MessageBoxReturnValue, WindowError>> => {
      const result = await tryCatch(async () => {
        return await this.windowManager.showDialog(options);
      });
      if (result.isOk()) {
        return ok(result.value);
      }
      return err(new WindowError('Failed to show dialog', { cause: result.err }));
    }) as IpcHandlerFn);

    super.registerHandlers();
  }
}

// Factory function
export function createDialogHandlers(windowManager: WindowManager): DialogHandlers {
  return new DialogHandlers(windowManager);
}

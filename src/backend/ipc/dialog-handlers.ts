import { type IpcMainInvokeEvent, type MessageBoxOptions, type MessageBoxReturnValue } from 'electron';
import { BaseIpcHandler } from './base-ipc-handler';
import { DIALOG_CHANNELS } from '../../shared/constants';
import type { WindowManager } from '../services';

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
    this.registerHandler(
      'showMessageBox',
      async (_event: IpcMainInvokeEvent, options: MessageBoxOptions): Promise<MessageBoxReturnValue> => {
        return await this.windowManager.showDialog(options);
      }
    );

    super.registerHandlers();
  }
}

// Factory function
export function createDialogHandlers(windowManager: WindowManager): DialogHandlers {
  return new DialogHandlers(windowManager);
}

import { app } from 'electron';
import { APP_CHANNELS } from '../../shared/constants';
import { BaseIpcHandler } from './base-ipc-handler';

/**
 * IPC handlers for application-level operations
 */
export class AppHandlers extends BaseIpcHandler {
  protected get channelPrefix(): string {
    return 'app';
  }

  registerHandlers(): void {
    this.registerHandler('getVersion', () => app.getVersion());
    this.registerHandler('getName', () => app.getName());
    super.registerHandlers();
  }
}

// Singleton instance
let instance: AppHandlers | null = null;

export function getAppHandlers(): AppHandlers {
  if (!instance) {
    instance = new AppHandlers();
  }
  return instance;
}

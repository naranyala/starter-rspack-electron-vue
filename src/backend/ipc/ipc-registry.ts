import type { IpcHandler } from './base-ipc-handler';

/**
 * Registry for managing IPC handlers
 * Centralized registration and lifecycle management
 */
export class IpcRegistry {
  private handlers: IpcHandler[] = [];
  private isRegistered = false;

  /**
   * Register an IPC handler
   */
  register(handler: IpcHandler): void {
    this.handlers.push(handler);
  }

  /**
   * Register multiple handlers at once
   */
  registerMany(handlers: IpcHandler[]): void {
    handlers.forEach((handler) => this.register(handler));
  }

  /**
   * Register all handlers with ipcMain
   */
  registerAll(): void {
    if (this.isRegistered) {
      console.warn('IPC handlers already registered');
      return;
    }

    this.handlers.forEach((handler) => {
      handler.registerHandlers();
    });
    this.isRegistered = true;
  }

  /**
   * Unregister all handlers (useful for cleanup/testing)
   */
  unregisterAll(): void {
    this.handlers.forEach((handler) => {
      handler.unregisterHandlers();
    });
    this.isRegistered = false;
  }

  /**
   * Check if a specific handler is registered
   */
  isHandlerRegistered(handler: IpcHandler): boolean {
    return this.handlers.includes(handler) && this.isRegistered;
  }

  /**
   * Get all registered handlers
   */
  getHandlers(): IpcHandler[] {
    return [...this.handlers];
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clear(): void {
    if (this.isRegistered) {
      this.unregisterAll();
    }
    this.handlers = [];
  }
}

// Singleton instance for global IPC registry
const globalRegistry = new IpcRegistry();

export function getGlobalIpcRegistry(): IpcRegistry {
  return globalRegistry;
}

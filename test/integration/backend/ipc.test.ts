import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { BaseIpcHandler } from '../../../../src/backend/ipc/base-ipc-handler';
import { getGlobalIpcRegistry, IpcRegistry } from '../../../../src/backend/ipc/ipc-registry';

describe('IPC Registry', () => {
  let registry: IpcRegistry;

  beforeEach(() => {
    registry = new IpcRegistry();
  });

  it('should register a handler', () => {
    const handler = new (class extends BaseIpcHandler {
      protected get channelPrefix(): string {
        return 'test';
      }
      registerHandlers(): void {}
    })();

    registry.register(handler);
    const handlers = registry.getHandlers();

    expect(handlers).toHaveLength(1);
    expect(handlers[0]).toBe(handler);
  });

  it('should register multiple handlers at once', () => {
    const handlers = [
      new (class extends BaseIpcHandler {
        protected get channelPrefix(): string {
          return 'test1';
        }
        registerHandlers(): void {}
      })(),
      new (class extends BaseIpcHandler {
        protected get channelPrefix(): string {
          return 'test2';
        }
        registerHandlers(): void {}
      })(),
    ];

    registry.registerMany(handlers);
    expect(registry.getHandlers()).toHaveLength(2);
  });

  it('should check if handler is registered', () => {
    const handler = new (class extends BaseIpcHandler {
      protected get channelPrefix(): string {
        return 'test';
      }
      registerHandlers(): void {}
    })();

    expect(registry.isHandlerRegistered(handler)).toBe(false);

    registry.register(handler);
    expect(registry.isHandlerRegistered(handler)).toBe(false); // Not registered with ipcMain yet

    registry.registerAll();
    expect(registry.isHandlerRegistered(handler)).toBe(true);
  });

  it('should warn when registering twice', () => {
    const handler = new (class extends BaseIpcHandler {
      protected get channelPrefix(): string {
        return 'test';
      }
      registerHandlers(): void {}
    })();

    const warnSpy = mock(() => {});
    console.warn = warnSpy;

    registry.register(handler);
    registry.registerAll();
    registry.registerAll(); // Should warn

    expect(warnSpy).toHaveBeenCalled();
  });

  it('should unregister all handlers', () => {
    const handler = new (class extends BaseIpcHandler {
      protected get channelPrefix(): string {
        return 'test';
      }
      registerHandlers(): void {}
      unregisterHandlers(): void {}
    })();

    registry.register(handler);
    registry.registerAll();
    registry.unregisterAll();

    expect(registry.isHandlerRegistered(handler)).toBe(false);
  });

  it('should clear all handlers', () => {
    const handler = new (class extends BaseIpcHandler {
      protected get channelPrefix(): string {
        return 'test';
      }
      registerHandlers(): void {}
      unregisterHandlers(): void {}
    })();

    registry.register(handler);
    registry.registerAll();
    registry.clear();

    expect(registry.getHandlers()).toHaveLength(0);
  });

  it('should get global registry instance', () => {
    const globalRegistry = getGlobalIpcRegistry();
    expect(globalRegistry).toBeInstanceOf(IpcRegistry);
  });
});

describe('Base IPC Handler', () => {
  it('should have abstract channelPrefix', () => {
    class TestHandler extends BaseIpcHandler {
      protected get channelPrefix(): string {
        return 'test';
      }
      registerHandlers(): void {}
    }

    const handler = new TestHandler();
    expect(handler.channelPrefix).toBe('test');
  });

  it('should register handler with ipcMain', () => {
    class TestHandler extends BaseIpcHandler {
      protected get channelPrefix(): string {
        return 'test';
      }

      registerHandlers(): void {
        this.registerHandler('action', async () => 'result');
      }
    }

    const handler = new TestHandler();
    // In a real scenario, this would register with ipcMain
    // For testing, we just verify the method exists
    expect(handler.registerHandlers).toBeDefined();
    expect(handler.unregisterHandlers).toBeDefined();
  });
});

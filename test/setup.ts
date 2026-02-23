/**
 * Test Setup File
 *
 * This file runs before all tests and sets up the testing environment.
 */

import { mock } from 'bun:test';

// Mock window for frontend tests (when running in node environment)
if (typeof window === 'undefined') {
  (global as any).window = {
    electronAPI: {
      getVersion: async () => '0.1.2-test',
      getName: async () => 'starter-rspack-electron-vue',

      // Settings
      getSetting: async (key: string) => null,
      setSetting: async (key: string, value: unknown) => {},
      getAllSettings: async () => ({}),

      // Window management
      minimizeWindow: async () => {},
      maximizeWindow: async () => {},
      closeWindow: async () => {},

      // Dialog
      showMessageBox: async () => ({ response: 0 }),
    },
    matchMedia: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: mock(() => {}),
      removeListener: mock(() => {}),
      addEventListener: mock(() => {}),
      removeEventListener: mock(() => {}),
      dispatchEvent: mock(() => true),
    }),
  };
} else {
  // Initialize window.electronAPI if not present
  if (!(window as any).electronAPI) {
    (window as any).electronAPI = {
      getVersion: async () => '0.1.2-test',
      getName: async () => 'starter-rspack-electron-vue',
      getSetting: async (key: string) => null,
      setSetting: async (key: string, value: unknown) => {},
      getAllSettings: async () => ({}),
      minimizeWindow: async () => {},
      maximizeWindow: async () => {},
      closeWindow: async () => {},
      showMessageBox: async () => ({ response: 0 }),
    };
  }

  // Initialize matchMedia if not present
  if (!window.matchMedia) {
    (window as any).matchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: mock(() => {}),
      removeListener: mock(() => {}),
      addEventListener: mock(() => {}),
      removeEventListener: mock(() => {}),
      dispatchEvent: mock(() => true),
    });
  }
}

// Global test utilities
export const testUtils = {
  /**
   * Wait for a specified time
   */
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Reset all mocks
   */
  resetMocks: () => {
    // Reset any global mocks if needed
  },
};

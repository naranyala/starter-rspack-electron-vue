import { beforeEach, describe, expect, it } from 'bun:test';
import { createPinia, setActivePinia } from 'pinia';
import { useSettingsStore } from '../../../../src/frontend/stores/settings';

// Mock window.electronAPI before importing stores
const mockElectronAPI = {
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

describe('Settings Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Setup window mock before each test
    (global as any).window = { electronAPI: mockElectronAPI };
  });

  it('should initialize with default settings', () => {
    const store = useSettingsStore();

    expect(store.settings).toEqual({
      theme: 'system',
      language: 'en',
      autoSave: true,
      windowState: {
        width: 1024,
        height: 768,
      },
    });
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('should compute isDarkMode for dark theme', () => {
    const store = useSettingsStore();
    store.settings.theme = 'dark';
    expect(store.isDarkMode).toBe(true);
  });

  it('should compute isDarkMode for light theme', () => {
    const store = useSettingsStore();
    store.settings.theme = 'light';
    expect(store.isDarkMode).toBe(false);
  });

  it('should update setting', async () => {
    const store = useSettingsStore();

    await store.updateSetting('theme', 'dark');
    expect(store.settings.theme).toBe('dark');

    await store.updateSetting('language', 'es');
    expect(store.settings.language).toBe('es');
  });

  it('should reset settings', async () => {
    const store = useSettingsStore();

    await store.updateSetting('theme', 'dark');
    await store.updateSetting('language', 'fr');

    await store.resetSettings();

    expect(store.settings.theme).toBe('system');
    expect(store.settings.language).toBe('en');
  });
});

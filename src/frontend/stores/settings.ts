import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoSave: boolean;
  windowState: {
    width: number;
    height: number;
  };
}

/**
 * Store for managing application settings
 * Syncs with backend SettingsManager via Electron API
 */
export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref<AppSettings>({
    theme: 'system',
    language: 'en',
    autoSave: true,
    windowState: {
      width: 1024,
      height: 768,
    },
  });

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isDarkMode = computed(() => {
    if (settings.value.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return settings.value.theme === 'dark';
  });

  // Actions
  async function loadSettings() {
    isLoading.value = true;
    error.value = null;

    try {
      if (window.electronAPI) {
        const allSettings = await window.electronAPI.getAllSettings();
        settings.value = { ...settings.value, ...allSettings };
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load settings';
      console.error('Failed to load settings:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    error.value = null;

    try {
      if (window.electronAPI) {
        await window.electronAPI.setSetting(key, value);
      }
      settings.value[key] = value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update setting';
      console.error('Failed to update setting:', err);
      throw err;
    }
  }

  async function resetSettings() {
    error.value = null;

    try {
      if (window.electronAPI) {
        // Reset to defaults
        settings.value = {
          theme: 'system',
          language: 'en',
          autoSave: true,
          windowState: {
            width: 1024,
            height: 768,
          },
        };
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to reset settings';
      console.error('Failed to reset settings:', err);
      throw err;
    }
  }

  return {
    // State
    settings,
    isLoading,
    error,
    // Getters
    isDarkMode,
    // Actions
    loadSettings,
    updateSetting,
    resetSettings,
  };
});

import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { getElectronApiService } from '../services/electron-api';

/**
 * Composable for accessing Electron app information
 */
export function useElectronApp() {
  const api = getElectronApiService();
  const version = ref<string>('');
  const name = ref<string>('');
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  async function loadInfo() {
    try {
      isLoading.value = true;
      error.value = null;
      const [versionResult, nameResult] = await Promise.all([
        api.getVersion(),
        api.getName(),
      ]);
      version.value = versionResult;
      name.value = nameResult;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load app info';
      console.error('Failed to load app info:', err);
    } finally {
      isLoading.value = false;
    }
  }

  onMounted(() => {
    loadInfo();
  });

  return {
    version,
    name,
    isLoading,
    error,
    refresh: loadInfo,
  };
}

/**
 * Composable for managing Electron settings
 */
export function useElectronSettings() {
  const api = getElectronApiService();
  const settings = ref<Record<string, unknown>>({});
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  async function loadSettings() {
    try {
      isLoading.value = true;
      error.value = null;
      settings.value = await api.getAllSettings();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load settings';
      console.error('Failed to load settings:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function setSetting(key: string, value: unknown) {
    try {
      error.value = null;
      await api.setSetting(key, value);
      settings.value[key] = value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update setting';
      console.error('Failed to update setting:', err);
      throw err;
    }
  }

  function getSetting(key: string): unknown {
    return settings.value[key];
  }

  onMounted(() => {
    loadSettings();
  });

  return {
    settings,
    isLoading,
    error,
    setSetting,
    getSetting,
    refresh: loadSettings,
  };
}

/**
 * Composable for Electron window controls
 */
export function useElectronWindow() {
  const api = getElectronApiService();

  async function minimize() {
    return api.minimizeWindow();
  }

  async function maximize() {
    return api.maximizeWindow();
  }

  async function close() {
    return api.closeWindow();
  }

  async function showMessageBox(options: Electron.MessageBoxOptions): Promise<number> {
    const result = await api.showMessageBox(options);
    return result.response;
  }

  return {
    minimize,
    maximize,
    close,
    showMessageBox,
  };
}

/**
 * Composable for listening to Electron IPC events
 */
export function useElectronEvents() {
  const api = getElectronApiService();
  const listeners = new Map<string, Array<(...args: unknown[]) => void>>();

  function on(channel: string, callback: (...args: unknown[]) => void) {
    api.on(channel, callback);
    
    if (!listeners.has(channel)) {
      listeners.set(channel, []);
    }
    listeners.get(channel)!.push(callback);
  }

  function off(channel: string, callback: (...args: unknown[]) => void) {
    api.removeListener(channel, callback);
    
    const channelListeners = listeners.get(channel);
    if (channelListeners) {
      const index = channelListeners.indexOf(callback);
      if (index > -1) {
        channelListeners.splice(index, 1);
      }
    }
  }

  function offAll(channel?: string) {
    if (channel) {
      const channelListeners = listeners.get(channel);
      if (channelListeners) {
        channelListeners.forEach((callback) => {
          api.removeListener(channel, callback);
        });
        listeners.delete(channel);
      }
    } else {
      listeners.forEach((callbacks, ch) => {
        callbacks.forEach((callback) => {
          api.removeListener(ch, callback);
        });
      });
      listeners.clear();
    }
  }

  onUnmounted(() => {
    offAll();
  });

  return {
    on,
    off,
    offAll,
  };
}

/**
 * Database utilities for Electron main process
 * This can be extended with actual database implementations
 */

/**
 * Simple in-memory data store
 * In production, replace with proper database like SQLite
 */
export class DataStore {
  private data: Map<string, unknown>;

  constructor() {
    this.data = new Map<string, unknown>();
  }

  /**
   * Get value by key
   * @param key - Data key
   * @returns Stored value
   */
  get(key: string): unknown {
    return this.data.get(key);
  }

  /**
   * Set value by key
   * @param key - Data key
   * @param value - Value to store
   */
  set(key: string, value: unknown): void {
    this.data.set(key, value);
  }

  /**
   * Delete value by key
   * @param key - Data key
   * @returns True if deleted
   */
  delete(key: string): boolean {
    return this.data.delete(key);
  }

  /**
   * Check if key exists
   * @param key - Data key
   * @returns True if exists
   */
  has(key: string): boolean {
    return this.data.has(key);
  }

  /**
   * Get all keys
   * @returns Array of keys
   */
  keys(): string[] {
    return Array.from(this.data.keys());
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.data.clear();
  }
}

/**
 * Application settings manager
 */
export class SettingsManager {
  private store: DataStore;
  private defaultSettings: Record<string, unknown>;

  constructor() {
    this.store = new DataStore();
    this.defaultSettings = {
      theme: 'light',
      language: 'en',
      autoSave: true,
      windowState: {
        width: 1024,
        height: 768,
      },
    };
  }

  /**
   * Get setting value
   * @param key - Setting key
   * @param defaultValue - Default value if not found
   * @returns Setting value
   */
  get(key: string, defaultValue: unknown = null): unknown {
    const fullKey = `setting.${key}`;
    return this.store.get(fullKey) || defaultValue || this.defaultSettings[key];
  }

  /**
   * Set setting value
   * @param key - Setting key
   * @param value - Setting value
   */
  set(key: string, value: unknown): void {
    const fullKey = `setting.${key}`;
    this.store.set(fullKey, value);
  }

  /**
   * Get all settings
   * @returns All settings object
   */
  getAll(): Record<string, unknown> {
    const settings: Record<string, unknown> = { ...this.defaultSettings };
    this.store
      .keys()
      .filter((key) => key.startsWith('setting.'))
      .forEach((key) => {
        const settingKey = key.replace('setting.', '');
        settings[settingKey] = this.store.get(key);
      });
    return settings;
  }

  /**
   * Reset to default settings
   */
  reset(): void {
    this.store
      .keys()
      .filter((key) => key.startsWith('setting.'))
      .forEach((key) => {
        this.store.delete(key);
      });
  }
}

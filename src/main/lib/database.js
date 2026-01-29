/**
 * Database utilities for Electron main process
 * This can be extended with actual database implementations
 */

/**
 * Simple in-memory data store
 * In production, replace with proper database like SQLite
 */
export class DataStore {
  constructor() {
    this.data = new Map();
  }

  /**
   * Get value by key
   * @param {string} key - Data key
   * @returns {any} Stored value
   */
  get(key) {
    return this.data.get(key);
  }

  /**
   * Set value by key
   * @param {string} key - Data key
   * @param {any} value - Value to store
   */
  set(key, value) {
    this.data.set(key, value);
  }

  /**
   * Delete value by key
   * @param {string} key - Data key
   * @returns {boolean} True if deleted
   */
  delete(key) {
    return this.data.delete(key);
  }

  /**
   * Check if key exists
   * @param {string} key - Data key
   * @returns {boolean} True if exists
   */
  has(key) {
    return this.data.has(key);
  }

  /**
   * Get all keys
   * @returns {string[]} Array of keys
   */
  keys() {
    return Array.from(this.data.keys());
  }

  /**
   * Clear all data
   */
  clear() {
    this.data.clear();
  }
}

/**
 * Application settings manager
 */
export class SettingsManager {
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
   * @param {string} key - Setting key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} Setting value
   */
  get(key, defaultValue = null) {
    const fullKey = `setting.${key}`;
    return this.store.get(fullKey) || defaultValue || this.defaultSettings[key];
  }

  /**
   * Set setting value
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   */
  set(key, value) {
    const fullKey = `setting.${key}`;
    this.store.set(fullKey, value);
  }

  /**
   * Get all settings
   * @returns {Object} All settings object
   */
  getAll() {
    const settings = { ...this.defaultSettings };
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
  reset() {
    this.store
      .keys()
      .filter((key) => key.startsWith('setting.'))
      .forEach((key) => this.store.delete(key));
  }
}

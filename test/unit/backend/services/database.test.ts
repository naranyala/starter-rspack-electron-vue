import { beforeEach, describe, expect, it } from 'bun:test';
import { DataStore, SettingsManager } from '../../../../src/backend/services/database';

describe('DataStore', () => {
  let store: DataStore;

  beforeEach(() => {
    store = new DataStore();
  });

  it('should set and get values', () => {
    store.set('key1', 'value1');
    expect(store.get('key1')).toBe('value1');
  });

  it('should return undefined for missing keys', () => {
    expect(store.get('nonexistent')).toBeUndefined();
  });

  it('should delete values', () => {
    store.set('key1', 'value1');
    const deleted = store.delete('key1');
    expect(deleted).toBe(true);
    expect(store.get('key1')).toBeUndefined();
  });

  it('should return false when deleting non-existent key', () => {
    const deleted = store.delete('nonexistent');
    expect(deleted).toBe(false);
  });

  it('should check if key exists', () => {
    store.set('key1', 'value1');
    expect(store.has('key1')).toBe(true);
    expect(store.has('nonexistent')).toBe(false);
  });

  it('should return all keys', () => {
    store.set('key1', 'value1');
    store.set('key2', 'value2');
    store.set('key3', 'value3');

    const keys = store.keys();
    expect(keys).toEqual(expect.arrayContaining(['key1', 'key2', 'key3']));
    expect(keys.length).toBe(3);
  });

  it('should clear all data', () => {
    store.set('key1', 'value1');
    store.set('key2', 'value2');

    store.clear();

    expect(store.keys()).toEqual([]);
    expect(store.has('key1')).toBe(false);
  });

  it('should store various data types', () => {
    store.set('string', 'text');
    store.set('number', 42);
    store.set('boolean', true);
    store.set('null', null);
    store.set('array', [1, 2, 3]);
    store.set('object', { nested: 'value' });

    expect(store.get('string')).toBe('text');
    expect(store.get('number')).toBe(42);
    expect(store.get('boolean')).toBe(true);
    expect(store.get('null')).toBe(null);
    expect(store.get('array')).toEqual([1, 2, 3]);
    expect(store.get('object')).toEqual({ nested: 'value' });
  });
});

describe('SettingsManager', () => {
  let manager: SettingsManager;

  beforeEach(() => {
    manager = new SettingsManager();
  });

  it('should get default settings', () => {
    expect(manager.get('theme')).toBe('light');
    expect(manager.get('language')).toBe('en');
    expect(manager.get('autoSave')).toBe(true);
  });

  it('should set and get custom settings', () => {
    manager.set('theme', 'dark');
    expect(manager.get('theme')).toBe('dark');
  });

  it('should return default value when setting not found', () => {
    expect(manager.get('nonexistent', 'default')).toBe('default');
  });

  it('should get all settings including defaults', () => {
    manager.set('theme', 'dark');
    manager.set('customSetting', 'customValue');

    const all = manager.getAll();

    expect(all.theme).toBe('dark');
    expect(all.language).toBe('en');
    expect(all.autoSave).toBe(true);
    expect(all.customSetting).toBe('customValue');
  });

  it('should reset to default settings', () => {
    manager.set('theme', 'dark');
    manager.set('language', 'es');

    manager.reset();

    expect(manager.get('theme')).toBe('light');
    expect(manager.get('language')).toBe('en');
  });

  it('should handle windowState default setting', () => {
    const windowState = manager.get('windowState');
    expect(windowState).toEqual({
      width: 1024,
      height: 768,
    });
  });

  it('should store complex settings', () => {
    const customWindowState = { width: 1920, height: 1080 };
    manager.set('windowState', customWindowState);
    expect(manager.get('windowState')).toEqual(customWindowState);
  });
});

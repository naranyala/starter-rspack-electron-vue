/**
 * Enhanced Object Utilities
 * Provides comprehensive object manipulation and utility functions
 */

export class ObjectUtils {
  /**
   * Deep clone an object/array
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof Array) return obj.map((item) => ObjectUtils.deepClone(item)) as any;
    if (typeof obj === 'object') {
      const cloned: any = {};
      for (const key in obj) {
        if (Object.hasOwn(obj, key)) {
          cloned[key] = ObjectUtils.deepClone(obj[key]);
        }
      }
      return cloned;
    }
    return obj;
  }

  /**
   * Deep merge two objects
   */
  static deepMerge<T extends Record<string, any>, U extends Record<string, any>>(
    target: T,
    source: U
  ): T & U {
    const result = { ...target } as T & U;
    for (const key in source) {
      if (Object.hasOwn(source, key)) {
        const sourceVal = (source as any)[key];
        const targetVal = (target as any)[key];

        if (
          typeof sourceVal === 'object' &&
          sourceVal !== null &&
          !Array.isArray(sourceVal) &&
          typeof targetVal === 'object' &&
          targetVal !== null &&
          !Array.isArray(targetVal)
        ) {
          (result as any)[key] = ObjectUtils.deepMerge(targetVal, sourceVal);
        } else {
          (result as any)[key] = sourceVal;
        }
      }
    }
    return result;
  }

  /**
   * Flatten nested object to dot notation
   */
  static flatten(obj: Record<string, any>, prefix: string = ''): Record<string, any> {
    const flattened: Record<string, any> = {};

    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, ObjectUtils.flatten(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }

    return flattened;
  }

  /**
   * Unflatten dot notation object back to nested structure
   */
  static unflatten(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        const keys = key.split('.');
        let current = result;

        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i];
          if (!(k in current)) {
            current[k] = {};
          }
          current = current[k];
        }

        current[keys[keys.length - 1]] = obj[key];
      }
    }

    return result;
  }

  /**
   * Pick specific properties from an object
   */
  static pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  /**
   * Omit specific properties from an object
   */
  static omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  }

  /**
   * Check if object is empty
   */
  static isEmpty(obj: Record<string, any>): boolean {
    return Object.keys(obj).length === 0;
  }

  /**
   * Get object size (number of keys)
   */
  static size(obj: Record<string, any>): number {
    return Object.keys(obj).length;
  }

  /**
   * Get object keys
   */
  static keys<T extends Record<string, any>>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
  }

  /**
   * Get object values
   */
  static values<T extends Record<string, any>>(obj: T): T[keyof T][] {
    return Object.values(obj);
  }

  /**
   * Get object entries
   */
  static entries<T extends Record<string, any>>(obj: T): [keyof T, T[keyof T]][] {
    return Object.entries(obj) as [keyof T, T[keyof T]][];
  }

  /**
   * Transform object keys
   */
  static mapKeys<T extends Record<string, any>>(
    obj: T,
    mapper: (key: keyof T, value: T[keyof T]) => string
  ): Record<string, T[keyof T]> {
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        const newKey = mapper(key, obj[key]);
        result[newKey] = obj[key];
      }
    }
    return result;
  }

  /**
   * Transform object values
   */
  static mapValues<T extends Record<string, any>, R>(
    obj: T,
    mapper: (value: T[keyof T], key: keyof T) => R
  ): Record<keyof T, R> {
    const result: Record<any, R> = {} as Record<any, R>;
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        result[key] = mapper(obj[key], key);
      }
    }
    return result;
  }

  /**
   * Filter object by predicate
   */
  static filter<T extends Record<string, any>>(
    obj: T,
    predicate: (value: T[keyof T], key: keyof T) => boolean
  ): Partial<T> {
    const result: Partial<T> = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key) && predicate(obj[key], key)) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  /**
   * Check if object has property (safe version of hasOwnProperty)
   */
  static has(obj: Record<string, any>, key: string): boolean {
    return Object.hasOwn(obj, key);
  }
}
export class TypeUtils {
  static getType(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
  }

  static isPrimitive(value: unknown): boolean {
    const type = typeof value;
    return (
      value === null ||
      type === 'string' ||
      type === 'number' ||
      type === 'boolean' ||
      type === 'symbol' ||
      type === 'bigint'
    );
  }

  static isFunction(value: unknown): value is Function {
    return typeof value === 'function';
  }

  static isAsyncFunction(value: unknown): boolean {
    return Object.prototype.toString.call(value) === '[object AsyncFunction]';
  }

  static isPromise<T = unknown>(value: unknown): value is Promise<T> {
    return (
      value instanceof Promise ||
      (typeof value === 'object' &&
        value !== null &&
        'then' in value &&
        typeof (value as Promise<T>).then === 'function')
    );
  }

  static toString(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }

  static coalesce<T>(...values: (T | null | undefined)[]): T | null | undefined {
    for (const value of values) {
      if (value !== null && value !== undefined) {
        return value;
      }
    }
    return values[values.length - 1];
  }

  static omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    for (let i = 0; i < keys.length; i++) {
      delete result[keys[i]];
    }
    return result;
  }

  static pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  }
}

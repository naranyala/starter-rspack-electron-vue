export class EnvUtils {
  static get(key: string, defaultValue: string = ''): string {
    return (typeof process !== 'undefined' ? process.env[key] : undefined) || defaultValue;
  }

  static getNumber(key: string, defaultValue: number = 0): number {
    const value = typeof process !== 'undefined' ? process.env[key] : undefined;
    if (value === undefined) return defaultValue;
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  static getBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = typeof process !== 'undefined' ? process.env[key] : undefined;
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  }

  static isDevelopment(): boolean {
    return (
      EnvUtils.getBoolean('NODE_ENV', typeof process !== 'undefined' && process.env?.NODE_ENV === 'development')
    );
  }

  static isProduction(): boolean {
    return (
      EnvUtils.getBoolean('NODE_ENV', typeof process !== 'undefined' && process.env?.NODE_ENV === 'production')
    );
  }

  static require(key: string): string {
    const value = typeof process !== 'undefined' ? process.env[key] : undefined;
    if (value === undefined) {
      throw new Error(`Required environment variable "${key}" is not set`);
    }
    return value;
  }
}

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

export class ValidationUtils {
  static isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  static isEmail(value: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  }

  static isUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  static isIpv4(value: string): boolean {
    const regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(value);
  }

  static isHexColor(value: string): boolean {
    const regex = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
    return regex.test(value);
  }

  static isBase64(value: string): boolean {
    try {
      return btoa(atob(value)) === value;
    } catch {
      return false;
    }
  }

  static isJson(value: string): boolean {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static randomFloat(min: number, max: number, precision: number = 2): number {
    const value = Math.random() * (max - min) + min;
    return Number(value.toFixed(precision));
  }

  static randomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export class JsonUtils {
  static read<T = unknown>(json: string): T | null {
    try {
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }

  static stringify<T>(data: T, pretty: boolean = true): string {
    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  }

  static clone<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
  }

  static merge<T, U>(target: T, source: U): T & U {
    return JSON.parse(JSON.stringify({ ...target, ...source }));
  }
}

export class LogUtils {
  private static formatMessage(level: string, ...args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const message = args
      .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
      .join(' ');
    return `[${timestamp}] [${level}] ${message}`;
  }

  static info(...args: unknown[]): void {
    console.log(LogUtils.formatMessage('INFO', ...args));
  }

  static success(...args: unknown[]): void {
    console.log(LogUtils.formatMessage('SUCCESS', ...args));
  }

  static warn(...args: unknown[]): void {
    console.warn(LogUtils.formatMessage('WARN', ...args));
  }

  static error(...args: unknown[]): void {
    console.error(LogUtils.formatMessage('ERROR', ...args));
  }

  static debug(...args: unknown[]): void {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.log(LogUtils.formatMessage('DEBUG', ...args));
    }
  }

  static table(data: unknown[]): void {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.table(data);
    }
  }
}

export class PathUtils {
  static join(...segments: string[]): string {
    // Cross-platform path joining for browser environments
    return segments.join('/').replace(/\\/g, '/');
  }

  static normalize(path: string): string {
    // Basic normalization for browser environments
    return path.replace(/\\/g, '/');
  }

  static extname(filePath: string): string {
    const lastDotIndex = filePath.lastIndexOf('.');
    return lastDotIndex > 0 ? filePath.substring(lastDotIndex) : '';
  }

  static basename(filePath: string, ext?: string): string {
    const normalizedPath = PathUtils.normalize(filePath);
    const lastSlashIndex = Math.max(normalizedPath.lastIndexOf('/'), normalizedPath.lastIndexOf('\\'));
    const baseName = lastSlashIndex >= 0 ? normalizedPath.substring(lastSlashIndex + 1) : normalizedPath;
    
    if (ext && baseName.endsWith(ext)) {
      return baseName.substring(0, baseName.length - ext.length);
    }
    
    return baseName;
  }

  static dirname(filePath: string): string {
    const normalizedPath = PathUtils.normalize(filePath);
    const lastSlashIndex = Math.max(normalizedPath.lastIndexOf('/'), normalizedPath.lastIndexOf('\\'));
    return lastSlashIndex >= 0 ? normalizedPath.substring(0, lastSlashIndex) : '';
  }

  static isAbsolute(filePath: string): boolean {
    return filePath.startsWith('/') || /^[A-Za-z]:/.test(filePath);
  }
}
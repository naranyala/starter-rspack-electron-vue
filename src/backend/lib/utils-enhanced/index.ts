/**
 * Enhanced Backend Utilities
 * Comprehensive utilities for backend/Electron main process
 */

import crypto, { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Import shared utilities
import { ArrayUtils, ObjectUtils, StringUtils, ValidationUtils } from '../../../shared/utils';

// Re-export shared utilities for convenience
export { ObjectUtils, StringUtils, ValidationUtils, ArrayUtils };

export class CryptoUtils {
  static hash(data: string, algorithm: string = 'sha256'): string {
    return createHash(algorithm).update(data).digest('hex');
  }

  static uuid(): string {
    return crypto.randomUUID();
  }

  static randomBytes(size: number = 16): string {
    return crypto.randomBytes(size).toString('hex');
  }

  static encrypt(text: string, secret: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      crypto.createHash('md5').update(secret).digest().slice(0, 32),
      iv
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  static decrypt(encrypted: string, secret: string): string {
    const [ivHex, encryptedText] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      crypto.createHash('md5').update(secret).digest().slice(0, 32),
      iv
    );
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  static hmac(data: string, secret: string, algorithm: string = 'sha256'): string {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }

  static compare(a: string, b: string): boolean {
    try {
      return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
    } catch {
      return false;
    }
  }
}

export class FileSystemUtils {
  static async readFile(
    filePath: string,
    encoding: BufferEncoding = 'utf8'
  ): Promise<string | null> {
    try {
      return await fs.readFile(filePath, encoding);
    } catch (error) {
      console.error('Failed to read file:', filePath, error);
      return null;
    }
  }

  static async writeFile(filePath: string, content: string): Promise<boolean> {
    try {
      await fs.writeFile(filePath, content, 'utf8');
      return true;
    } catch (error) {
      console.error('Failed to write file:', filePath, error);
      return false;
    }
  }

  static async appendFile(filePath: string, content: string): Promise<boolean> {
    try {
      await fs.appendFile(filePath, content, 'utf8');
      return true;
    } catch (error) {
      console.error('Failed to append file:', filePath, error);
      return false;
    }
  }

  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Failed to delete file:', filePath, error);
      return false;
    }
  }

  static existsSync(filePath: string): boolean {
    return require('node:fs').existsSync(filePath);
  }

  static async mkdir(dirPath: string, recursive: boolean = true): Promise<boolean> {
    try {
      await fs.mkdir(dirPath, { recursive });
      return true;
    } catch (error) {
      console.error('Failed to create directory:', dirPath, error);
      return false;
    }
  }

  static async readdir(dirPath: string): Promise<string[]> {
    try {
      return await fs.readdir(dirPath);
    } catch (error) {
      console.error('Failed to read directory:', dirPath, error);
      return [];
    }
  }

  static async rmdir(dirPath: string, recursive: boolean = true): Promise<boolean> {
    try {
      await fs.rm(dirPath, { recursive });
      return true;
    } catch (error) {
      console.error('Failed to remove directory:', dirPath, error);
      return false;
    }
  }

  static async copyFile(src: string, dest: string): Promise<boolean> {
    try {
      await fs.copyFile(src, dest);
      return true;
    } catch (error) {
      console.error('Failed to copy file:', src, 'to', dest, error);
      return false;
    }
  }

  static async stat(filePath: string): Promise<import('node:fs').Stats | null> {
    try {
      const fsPromises = await import('node:fs/promises');
      return await fsPromises.stat(filePath);
    } catch {
      return null;
    }
  }

  /**
   * Recursively search for files matching a pattern
   */
  static async findFiles(dir: string, pattern: RegExp): Promise<string[]> {
    const results: string[] = [];

    try {
      const items = await fs.readdir(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
          const subResults = await FileSystemUtils.findFiles(fullPath, pattern);
          results.push(...subResults);
        } else if (pattern.test(item.name)) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      console.error('Error searching files:', error);
    }

    return results;
  }

  /**
   * Calculate file size in bytes
   */
  static async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  /**
   * Get file extension
   */
  static getExtension(filePath: string): string {
    return path.extname(filePath);
  }

  /**
   * Get file name without extension
   */
  static getNameWithoutExt(filePath: string): string {
    const ext = path.extname(filePath);
    return path.basename(filePath, ext);
  }

  /**
   * Create backup of file
   */
  static async backupFile(filePath: string): Promise<boolean> {
    try {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      await fs.copyFile(filePath, backupPath);
      return true;
    } catch (error) {
      console.error('Failed to create backup:', error);
      return false;
    }
  }
}

export class JsonUtils {
  static async read<T = unknown>(filePath: string): Promise<T | null> {
    const content = await FileSystemUtils.readFile(filePath);
    if (content === null) return null;
    try {
      return JSON.parse(content) as T;
    } catch (error) {
      console.error('Failed to parse JSON:', filePath, error);
      return null;
    }
  }

  static async write<T>(filePath: string, data: T, pretty: boolean = true): Promise<boolean> {
    const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    return FileSystemUtils.writeFile(filePath, content);
  }

  static stringify<T>(data: T, pretty: boolean = true): string {
    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  }

  static parse<T = unknown>(json: string): T | null {
    try {
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }

  static clone<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
  }

  static merge<T, U>(target: T, source: U): T & U {
    return JSON.parse(JSON.stringify({ ...target, ...source }));
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

export class LogUtils {
  private static colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  };

  private static formatMessage(level: string, color: string, ...args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const message = args
      .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
      .join(' ');
    return `${color}[${timestamp}] [${level}] ${message}${LogUtils.colors.reset}`;
  }

  static info(...args: unknown[]): void {
    console.log(LogUtils.formatMessage('INFO', LogUtils.colors.cyan, ...args));
  }

  static success(...args: unknown[]): void {
    console.log(LogUtils.formatMessage('SUCCESS', LogUtils.colors.green, ...args));
  }

  static warn(...args: unknown[]): void {
    console.warn(LogUtils.formatMessage('WARN', LogUtils.colors.yellow, ...args));
  }

  static error(...args: unknown[]): void {
    console.error(LogUtils.formatMessage('ERROR', LogUtils.colors.red, ...args));
  }

  static debug(...args: unknown[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(LogUtils.formatMessage('DEBUG', LogUtils.colors.magenta, ...args));
    }
  }

  static table(data: unknown[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.table(data);
    }
  }

  static time<T>(label: string, fn: () => T | Promise<T>): T | Promise<T> {
    const start = Date.now();
    const result = fn();
    if (result instanceof Promise) {
      return result.finally(() => {
        LogUtils.debug(`${label}: ${Date.now() - start}ms`);
      });
    }
    LogUtils.debug(`${label}: ${Date.now() - start}ms`);
    return result;
  }

  static async timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    const result = await fn();
    LogUtils.debug(`${label}: ${Date.now() - start}ms`);
    return result;
  }

  /**
   * Log with custom level and color
   */
  static custom(level: string, color: string, ...args: unknown[]): void {
    console.log(LogUtils.formatMessage(level, color, ...args));
  }

  /**
   * Log an object with pretty formatting
   */
  static pretty(obj: unknown): void {
    console.log(JSON.stringify(obj, null, 2));
  }

  /**
   * Log performance metrics
   */
  static perf(label: string, start: number, end: number): void {
    LogUtils.info(`${label}: ${end - start}ms`);
  }
}

export interface PathInfo {
  dir: string;
  name: string;
  ext: string;
  absPath: string;
}

export class PathUtils {
  static getDirname(metaUrl: string): string {
    return path.dirname(fileURLToPath(metaUrl));
  }

  static join(...segments: string[]): string {
    return path.join(...segments);
  }

  static resolve(...segments: string[]): string {
    return path.resolve(...segments);
  }

  static parse(filePath: string): PathInfo {
    const parsed = path.parse(filePath);
    return {
      dir: parsed.dir,
      name: parsed.name,
      ext: parsed.ext,
      absPath: filePath,
    };
  }

  static extname(filePath: string): string {
    return path.extname(filePath);
  }

  static basename(filePath: string, ext?: string): string {
    return path.basename(filePath, ext);
  }

  static dirname(filePath: string): string {
    return path.dirname(filePath);
  }

  static isAbsolute(filePath: string): boolean {
    return path.isAbsolute(filePath);
  }

  static relative(from: string, to: string): string {
    return path.relative(from, to);
  }

  /**
   * Normalize path separators
   */
  static normalize(filePath: string): string {
    return path.normalize(filePath);
  }

  /**
   * Get relative path from current working directory
   */
  static relativeToCwd(filePath: string): string {
    return path.relative(process.cwd(), filePath);
  }

  /**
   * Check if path is inside another path
   */
  static isInside(childPath: string, parentPath: string): boolean {
    const relative = path.relative(parentPath, childPath);
    return !relative.startsWith('..') && !path.isAbsolute(relative);
  }

  /**
   * Create a temporary file path
   */
  static temp(filename: string): string {
    return path.join(require('node:os').tmpdir(), filename);
  }
}

export class EnvUtils {
  static get(key: string, defaultValue: string = ''): string {
    return process.env[key] || defaultValue;
  }

  static getNumber(key: string, defaultValue: number = 0): number {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }

  static getBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  }

  static isDevelopment(): boolean {
    return EnvUtils.getBoolean('NODE_ENV', process.env.NODE_ENV === 'development');
  }

  static isProduction(): boolean {
    return EnvUtils.getBoolean('NODE_ENV', process.env.NODE_ENV === 'production');
  }

  static require(key: string): string {
    const value = process.env[key];
    if (value === undefined) {
      throw new Error(`Required environment variable "${key}" is not set`);
    }
    return value;
  }

  /**
   * Get all environment variables that match a pattern
   */
  static getMatching(pattern: RegExp): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (pattern.test(key) && value !== undefined) {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * Load environment variables from a file
   */
  static async loadEnvFile(filePath: string): Promise<boolean> {
    try {
      const content = await FileSystemUtils.readFile(filePath);
      if (content === null) return false;

      const lines = content.split('\n');
      for (const line of lines) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const trimmedKey = key.trim();
          const trimmedValue = valueParts.join('=').trim();
          if (!process.env[trimmedKey]) {
            process.env[trimmedKey] = trimmedValue;
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to load env file:', error);
      return false;
    }
  }
}

// Export all utilities in a single namespace
export const BackendUtils = {
  Crypto: CryptoUtils,
  FS: FileSystemUtils,
  Json: JsonUtils,
  Type: TypeUtils,
  Log: LogUtils,
  Path: PathUtils,
  Env: EnvUtils,
  Objects: ObjectUtils,
  Strings: StringUtils,
  Validation: ValidationUtils,
  Arrays: ArrayUtils,
};

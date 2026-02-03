import { EnvUtils } from './env';

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
    if (EnvUtils.isDevelopment()) {
      console.log(LogUtils.formatMessage('DEBUG', LogUtils.colors.magenta, ...args));
    }
  }

  static table(data: unknown[]): void {
    if (EnvUtils.isDevelopment()) {
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
}

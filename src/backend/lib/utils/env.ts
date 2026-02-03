export class EnvUtils {
  static get(key: string, defaultValue: string = ''): string {
    return process.env[key] || defaultValue;
  }

  static getNumber(key: string, defaultValue: number = 0): number {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
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
}

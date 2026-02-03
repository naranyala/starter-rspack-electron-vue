import { FileSystemUtils } from './fs';

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

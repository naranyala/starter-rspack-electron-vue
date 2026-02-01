import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
}

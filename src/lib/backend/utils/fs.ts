import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';

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

  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static existsSync(filePath: string): boolean {
    return existsSync(filePath);
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
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CryptoUtils,
  FileSystemUtils,
  JsonUtils,
  LogUtils,
  PathUtils,
  EnvUtils,
  BackendUtils
} from '../src/backend/lib/utils-enhanced/index';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

describe('Backend Utilities Tests', () => {
  describe('CryptoUtils', () => {
    it('should generate a UUID', () => {
      const uuid = CryptoUtils.uuid();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should hash data', () => {
      const data = 'hello world';
      const hash = CryptoUtils.hash(data);
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should encrypt and decrypt data', () => {
      const text = 'secret message';
      const secret = 'my-secret-key';
      const encrypted = CryptoUtils.encrypt(text, secret);
      const decrypted = CryptoUtils.decrypt(encrypted, secret);
      
      expect(decrypted).toBe(text);
    });

    it('should generate HMAC', () => {
      const data = 'hello world';
      const secret = 'secret-key';
      const hmac = CryptoUtils.hmac(data, secret);
      
      expect(typeof hmac).toBe('string');
      expect(hmac.length).toBeGreaterThan(0);
    });

    it('should compare strings safely', () => {
      expect(CryptoUtils.compare('abc', 'abc')).toBe(true);
      expect(CryptoUtils.compare('abc', 'def')).toBe(false);
    });
  });

  describe('FileSystemUtils', () => {
    const testDir = path.join(os.tmpdir(), 'test-fs-utils');
    const testFile = path.join(testDir, 'test.txt');

    beforeEach(async () => {
      await fs.mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
      try {
        await fs.rm(testDir, { recursive: true, force: true });
      } catch (err) {
        // Ignore cleanup errors
      }
    });

    it('should write and read a file', async () => {
      const content = 'test content';
      const success = await FileSystemUtils.writeFile(testFile, content);
      
      expect(success).toBe(true);
      
      const readContent = await FileSystemUtils.readFile(testFile);
      expect(readContent).toBe(content);
    });

    it('should check if file exists', async () => {
      const existsBefore = await FileSystemUtils.exists(testFile);
      expect(existsBefore).toBe(false);
      
      await FileSystemUtils.writeFile(testFile, 'content');
      const existsAfter = await FileSystemUtils.exists(testFile);
      expect(existsAfter).toBe(true);
    });

    it('should create directory', async () => {
      const newDir = path.join(testDir, 'new-dir');
      const success = await FileSystemUtils.mkdir(newDir);
      
      expect(success).toBe(true);
      expect(FileSystemUtils.existsSync(newDir)).toBe(true);
    });

    it('should copy file', async () => {
      const sourceFile = path.join(testDir, 'source.txt');
      const destFile = path.join(testDir, 'dest.txt');
      
      await FileSystemUtils.writeFile(sourceFile, 'source content');
      const success = await FileSystemUtils.copyFile(sourceFile, destFile);
      
      expect(success).toBe(true);
      
      const sourceContent = await FileSystemUtils.readFile(sourceFile);
      const destContent = await FileSystemUtils.readFile(destFile);
      
      expect(sourceContent).toBe(destContent);
    });
  });

  describe('JsonUtils', () => {
    const testDir = path.join(os.tmpdir(), 'test-json-utils');
    const testFile = path.join(testDir, 'test.json');

    beforeEach(async () => {
      await fs.mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
      try {
        await fs.rm(testDir, { recursive: true, force: true });
      } catch (err) {
        // Ignore cleanup errors
      }
    });

    it('should write and read JSON', async () => {
      const data = { name: 'test', value: 123 };
      const success = await JsonUtils.write(testFile, data);
      
      expect(success).toBe(true);
      
      const readData = await JsonUtils.read(testFile);
      expect(readData).toEqual(data);
    });

    it('should stringify and parse JSON', () => {
      const data = { name: 'test', nested: { value: 123 } };
      const jsonStr = JsonUtils.stringify(data);
      const parsed = JsonUtils.parse(jsonStr);
      
      expect(parsed).toEqual(data);
    });

    it('should clone data', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = JsonUtils.clone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });
  });

  describe('LogUtils', () => {
    it('should format log messages', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      LogUtils.info('test message');
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('[INFO]');
      expect(consoleSpy.mock.calls[0][0]).toContain('test message');
      
      consoleSpy.mockRestore();
    });

    it('should log success messages', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      LogUtils.success('success message');
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('[SUCCESS]');
      
      consoleSpy.mockRestore();
    });

    it('should time a function execution', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const result = await LogUtils.time('test-operation', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'result';
      });
      
      expect(result).toBe('result');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('PathUtils', () => {
    it('should join path segments', () => {
      const joined = PathUtils.join('folder', 'subfolder', 'file.txt');
      expect(joined).toContain('folder');
      expect(joined).toContain('subfolder');
      expect(joined).toContain('file.txt');
    });

    it('should parse path information', () => {
      const filePath = '/path/to/file.txt';
      const parsed = PathUtils.parse(filePath);
      
      expect(parsed.dir).toBe('/path/to');
      expect(parsed.name).toBe('file');
      expect(parsed.ext).toBe('.txt');
      expect(parsed.absPath).toBe(filePath);
    });

    it('should check if path is absolute', () => {
      expect(PathUtils.isAbsolute('/absolute/path')).toBe(true);
      expect(PathUtils.isAbsolute('relative/path')).toBe(false);
    });

    it('should normalize path', () => {
      const normalized = PathUtils.normalize('path/../normalized');
      expect(normalized).toBe('normalized');
    });
  });

  describe('EnvUtils', () => {
    beforeEach(() => {
      process.env.TEST_VAR = 'test_value';
      process.env.TEST_NUMBER = '42';
      process.env.TEST_BOOLEAN_TRUE = 'true';
      process.env.TEST_BOOLEAN_FALSE = 'false';
    });

    afterEach(() => {
      delete process.env.TEST_VAR;
      delete process.env.TEST_NUMBER;
      delete process.env.TEST_BOOLEAN_TRUE;
      delete process.env.TEST_BOOLEAN_FALSE;
    });

    it('should get environment variable', () => {
      expect(EnvUtils.get('TEST_VAR')).toBe('test_value');
      expect(EnvUtils.get('NON_EXISTENT', 'default')).toBe('default');
    });

    it('should get number environment variable', () => {
      expect(EnvUtils.getNumber('TEST_NUMBER')).toBe(42);
      expect(EnvUtils.getNumber('NON_EXISTENT', 100)).toBe(100);
    });

    it('should get boolean environment variable', () => {
      expect(EnvUtils.getBoolean('TEST_BOOLEAN_TRUE')).toBe(true);
      expect(EnvUtils.getBoolean('TEST_BOOLEAN_FALSE')).toBe(false);
      expect(EnvUtils.getBoolean('NON_EXISTENT', true)).toBe(true);
    });

    it('should check if in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      
      process.env.NODE_ENV = 'development';
      expect(EnvUtils.isDevelopment()).toBe(true);
      
      process.env.NODE_ENV = 'production';
      expect(EnvUtils.isDevelopment()).toBe(false);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should require environment variable', () => {
      expect(EnvUtils.require('TEST_VAR')).toBe('test_value');
      
      expect(() => EnvUtils.require('NON_EXISTENT')).toThrow();
    });
  });

  describe('BackendUtils namespace', () => {
    it('should expose all utility classes', () => {
      expect(BackendUtils.Crypto).toBeDefined();
      expect(BackendUtils.FS).toBeDefined();
      expect(BackendUtils.Json).toBeDefined();
      expect(BackendUtils.Log).toBeDefined();
      expect(BackendUtils.Path).toBeDefined();
      expect(BackendUtils.Env).toBeDefined();
      expect(BackendUtils.Objects).toBeDefined();
      expect(BackendUtils.Strings).toBeDefined();
      expect(BackendUtils.Validation).toBeDefined();
      expect(BackendUtils.Arrays).toBeDefined();
    });
  });
});
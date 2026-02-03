import { describe, it, expect } from 'vitest';
import { ObjectUtils } from '../src/shared/utils/object';
import { StringUtils } from '../src/shared/utils/string';
import { ValidationUtils } from '../src/shared/utils/validation';
import { ArrayUtils } from '../src/shared/utils/array';
import { CacheUtils } from '../src/shared/utils/cache';
import { AsyncUtils } from '../src/shared/utils/async';

describe('Shared Utilities Tests', () => {
  describe('ObjectUtils', () => {
    it('should deep clone an object', () => {
      const original = { a: 1, b: { c: 2, d: [3, 4] } };
      const cloned = ObjectUtils.deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original); // Different reference
      expect(cloned.b).not.toBe(original.b); // Nested objects are different references
    });

    it('should deep merge objects', () => {
      const target = { a: 1, b: { c: 2 } };
      const source = { b: { d: 3 }, e: 4 };
      const merged = ObjectUtils.deepMerge(target, source);
      
      expect(merged).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
    });

    it('should pick specific properties', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const picked = ObjectUtils.pick(obj, ['a', 'c']);
      
      expect(picked).toEqual({ a: 1, c: 3 });
    });

    it('should omit specific properties', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const omitted = ObjectUtils.omit(obj, ['b']);
      
      expect(omitted).toEqual({ a: 1, c: 3 });
    });
  });

  describe('StringUtils', () => {
    it('should capitalize a string', () => {
      expect(StringUtils.capitalize('hello')).toBe('Hello');
      expect(StringUtils.capitalize('HELLO')).toBe('Hello');
    });

    it('should convert to camelCase', () => {
      expect(StringUtils.camelCase('hello world')).toBe('helloWorld');
      expect(StringUtils.camelCase('hello-world-test')).toBe('helloWorldTest');
    });

    it('should convert to kebab-case', () => {
      expect(StringUtils.kebabCase('helloWorld')).toBe('hello-world');
      expect(StringUtils.kebabCase('Hello World Test')).toBe('hello-world-test');
    });

    it('should truncate string', () => {
      expect(StringUtils.truncate('hello world', 5)).toBe('hello...');
      expect(StringUtils.truncate('hello', 10)).toBe('hello');
    });
  });

  describe('ValidationUtils', () => {
    it('should validate email', () => {
      expect(ValidationUtils.isEmail('test@example.com')).toBe(true);
      expect(ValidationUtils.isEmail('invalid-email')).toBe(false);
    });

    it('should validate URL', () => {
      expect(ValidationUtils.isUrl('https://example.com')).toBe(true);
      expect(ValidationUtils.isUrl('invalid-url')).toBe(false);
    });

    it('should validate IPv4', () => {
      expect(ValidationUtils.isIpv4('192.168.1.1')).toBe(true);
      expect(ValidationUtils.isIpv4('999.999.999.999')).toBe(false);
    });

    it('should validate hex color', () => {
      expect(ValidationUtils.isHexColor('#ffffff')).toBe(true);
      expect(ValidationUtils.isHexColor('#fff')).toBe(true);
      expect(ValidationUtils.isHexColor('invalid-color')).toBe(false);
    });

    it('should clamp value', () => {
      expect(ValidationUtils.clamp(5, 1, 10)).toBe(5);
      expect(ValidationUtils.clamp(0, 1, 10)).toBe(1);
      expect(ValidationUtils.clamp(15, 1, 10)).toBe(10);
    });
  });

  describe('ArrayUtils', () => {
    it('should get unique values', () => {
      const arr = [1, 2, 2, 3, 3, 4];
      expect(ArrayUtils.unique(arr)).toEqual([1, 2, 3, 4]);
    });

    it('should chunk array', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7];
      expect(ArrayUtils.chunk(arr, 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    it('should shuffle array', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = ArrayUtils.shuffle(arr);
      
      expect(shuffled.length).toBe(arr.length);
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    it('should group by key', () => {
      const arr = [
        { category: 'a', value: 1 },
        { category: 'b', value: 2 },
        { category: 'a', value: 3 }
      ];
      const grouped = ArrayUtils.groupBy(arr, 'category');
      
      expect(grouped.a).toHaveLength(2);
      expect(grouped.b).toHaveLength(1);
    });
  });

  describe('CacheUtils', () => {
    it('should set and get values', () => {
      const cache = new CacheUtils(100);
      cache.set('key1', 'value1');
      
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      const cache = new CacheUtils(100);
      
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should handle TTL expiration', () => {
      const cache = new CacheUtils(100);
      cache.set('expiring', 'value', 10); // 10ms TTL
      
      // Wait for expiration
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(cache.get('expiring')).toBeNull();
          resolve(undefined);
        }, 20);
      });
    });

    it('should check if key exists', () => {
      const cache = new CacheUtils(100);
      cache.set('key', 'value');
      
      expect(cache.has('key')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });
  });

  describe('AsyncUtils', () => {
    it('should debounce function calls', async () => {
      const mockFn = vi.fn();
      const debounced = AsyncUtils.debounce(mockFn, 10);
      
      debounced();
      debounced(); // This should cancel the previous call
      await AsyncUtils.sleep(20);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should throttle function calls', async () => {
      const mockFn = vi.fn();
      const throttled = AsyncUtils.throttle(mockFn, 20);
      
      throttled();
      throttled(); // This should be ignored due to throttling
      await AsyncUtils.sleep(25);
      throttled(); // This should execute after the throttle period
      
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should sleep for specified time', async () => {
      const start = Date.now();
      await AsyncUtils.sleep(10);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(10);
    });

    it('should retry failed operations', async () => {
      let attempts = 0;
      const failingFn = () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Attempt failed');
        }
        return 'success';
      };

      const result = await AsyncUtils.retry(failingFn, { retries: 5, delay: 1 });
      
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });
  });
});
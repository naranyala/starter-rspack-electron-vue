import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  MathUtils,
  ColorUtils,
  DateUtils,
  NumberUtils,
  StorageUtils,
  FrontendUtils
} from '../src/frontend/lib/utils-enhanced/index';

describe('Frontend Utilities Tests', () => {
  describe('MathUtils', () => {
    it('should clamp values', () => {
      expect(MathUtils.clamp(5, 1, 10)).toBe(5);
      expect(MathUtils.clamp(0, 1, 10)).toBe(1);
      expect(MathUtils.clamp(15, 1, 10)).toBe(10);
    });

    it('should linear interpolate', () => {
      expect(MathUtils.lerp(0, 10, 0.5)).toBe(5);
      expect(MathUtils.lerp(10, 20, 0.25)).toBe(12.5);
    });

    it('should map values', () => {
      expect(MathUtils.map(5, 0, 10, 0, 100)).toBe(50);
      expect(MathUtils.map(2, 0, 10, 0, 50)).toBe(10);
    });

    it('should generate random numbers', () => {
      const rand = MathUtils.random(1, 10);
      expect(rand).toBeGreaterThanOrEqual(1);
      expect(rand).toBeLessThanOrEqual(10);
    });

    it('should generate random integers', () => {
      const rand = MathUtils.randomInt(1, 10);
      expect(rand).toBeGreaterThanOrEqual(1);
      expect(rand).toBeLessThanOrEqual(10);
      expect(Number.isInteger(rand)).toBe(true);
    });

    it('should round numbers', () => {
      expect(MathUtils.round(3.14159, 2)).toBe(3.14);
      expect(MathUtils.round(3.14159, 0)).toBe(3);
    });

    it('should convert degrees to radians', () => {
      expect(MathUtils.degreesToRadians(180)).toBe(Math.PI);
      expect(MathUtils.degreesToRadians(90)).toBe(Math.PI / 2);
    });

    it('should convert radians to degrees', () => {
      expect(MathUtils.radiansToDegrees(Math.PI)).toBe(180);
      expect(MathUtils.radiansToDegrees(Math.PI / 2)).toBe(90);
    });

    it('should check if number is even', () => {
      expect(MathUtils.isEven(2)).toBe(true);
      expect(MathUtils.isEven(3)).toBe(false);
    });

    it('should check if number is odd', () => {
      expect(MathUtils.isOdd(2)).toBe(false);
      expect(MathUtils.isOdd(3)).toBe(true);
    });

    it('should calculate greatest common divisor', () => {
      expect(MathUtils.gcd(8, 12)).toBe(4);
      expect(MathUtils.gcd(15, 25)).toBe(5);
    });

    it('should calculate least common multiple', () => {
      expect(MathUtils.lcm(4, 6)).toBe(12);
      expect(MathUtils.lcm(15, 25)).toBe(75);
    });
  });

  describe('ColorUtils', () => {
    it('should convert hex to rgb', () => {
      const rgb = ColorUtils.hexToRgb('#ff0000');
      expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
      
      const rgb2 = ColorUtils.hexToRgb('#00ff00');
      expect(rgb2).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should convert rgb to hex', () => {
      const hex = ColorUtils.rgbToHex(255, 0, 0);
      expect(hex.toLowerCase()).toBe('#ff0000');
      
      const hex2 = ColorUtils.rgbToHex(0, 255, 0);
      expect(hex2.toLowerCase()).toBe('#00ff00');
    });

    it('should convert hsl to rgb', () => {
      const rgb = ColorUtils.hslToRgb(0, 100, 50); // Red
      expect(rgb.r).toBeCloseTo(255, -1);
      expect(rgb.g).toBeCloseTo(0, -1);
      expect(rgb.b).toBeCloseTo(0, -1);
    });

    it('should convert rgb to hsl', () => {
      const hsl = ColorUtils.rgbToHsl(255, 0, 0); // Red
      expect(hsl.h).toBeCloseTo(0, -1);
      expect(hsl.s).toBeCloseTo(100, -1);
      expect(hsl.l).toBeCloseTo(50, -1);
    });

    it('should lighten color', () => {
      const lightened = ColorUtils.lighten('#808080', 20);
      // Lighter gray should have higher values
      const rgb = ColorUtils.hexToRgb(lightened);
      expect(rgb?.r).toBeGreaterThan(128);
      expect(rgb?.g).toBeGreaterThan(128);
      expect(rgb?.b).toBeGreaterThan(128);
    });

    it('should darken color', () => {
      const darkened = ColorUtils.darken('#808080', 20);
      // Darker gray should have lower values
      const rgb = ColorUtils.hexToRgb(darkened);
      expect(rgb?.r).toBeLessThan(128);
      expect(rgb?.g).toBeLessThan(128);
      expect(rgb?.b).toBeLessThan(128);
    });

    it('should generate random color', () => {
      const randomColor = ColorUtils.random();
      expect(randomColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should blend colors', () => {
      const blended = ColorUtils.blend('#ff0000', '#0000ff', 0.5);
      // Should be somewhere between red and blue (purple-ish)
      const rgb = ColorUtils.hexToRgb(blended);
      expect(rgb).toBeTruthy();
    });
  });

  describe('DateUtils', () => {
    it('should format date', () => {
      const date = new Date(2023, 0, 1, 12, 30, 45); // Jan 1, 2023, 12:30:45
      const formatted = DateUtils.format(date, 'YYYY-MM-DD HH:mm:ss');
      expect(formatted).toBe('2023-01-01 12:30:45');
    });

    it('should calculate time from now', () => {
      const pastDate = new Date(Date.now() - 30000); // 30 seconds ago
      const fromNow = DateUtils.fromNow(pastDate);
      expect(fromNow).toContain('seconds ago');
    });

    it('should check if dates are same day', () => {
      const date1 = new Date(2023, 0, 1, 12, 0, 0);
      const date2 = new Date(2023, 0, 1, 18, 0, 0);
      const date3 = new Date(2023, 0, 2, 12, 0, 0);
      
      expect(DateUtils.isSameDay(date1, date2)).toBe(true);
      expect(DateUtils.isSameDay(date1, date3)).toBe(false);
    });

    it('should add days to date', () => {
      const date = new Date(2023, 0, 1);
      const newDate = DateUtils.addDays(date, 5);
      
      expect(newDate.getDate()).toBe(6);
      expect(newDate.getFullYear()).toBe(2023);
    });

    it('should get start of day', () => {
      const date = new Date(2023, 0, 1, 15, 30, 45);
      const startOfDay = DateUtils.startOfDay(date);
      
      expect(startOfDay.getHours()).toBe(0);
      expect(startOfDay.getMinutes()).toBe(0);
      expect(startOfDay.getSeconds()).toBe(0);
      expect(startOfDay.getFullYear()).toBe(2023);
      expect(startOfDay.getMonth()).toBe(0);
      expect(startOfDay.getDate()).toBe(1);
    });

    it('should get end of day', () => {
      const date = new Date(2023, 0, 1, 15, 30, 45);
      const endOfDay = DateUtils.endOfDay(date);
      
      expect(endOfDay.getHours()).toBe(23);
      expect(endOfDay.getMinutes()).toBe(59);
      expect(endOfDay.getSeconds()).toBe(59);
    });
  });

  describe('NumberUtils', () => {
    it('should format number with decimals', () => {
      expect(NumberUtils.format(1234.567, 2)).toBe('1,234.57');
      expect(NumberUtils.format(1234567.89, 0)).toBe('1,234,568');
    });

    it('should round to fixed decimals', () => {
      expect(NumberUtils.toFixed(3.14159, 2)).toBe(3.14);
      expect(NumberUtils.toFixed(3.14159, 0)).toBe(3);
    });

    it('should check if number is integer', () => {
      expect(NumberUtils.isInteger(5)).toBe(true);
      expect(NumberUtils.isInteger(5.5)).toBe(false);
    });

    it('should check if number is positive', () => {
      expect(NumberUtils.isPositive(5)).toBe(true);
      expect(NumberUtils.isPositive(-5)).toBe(false);
      expect(NumberUtils.isPositive(0)).toBe(false);
    });

    it('should check if number is negative', () => {
      expect(NumberUtils.isNegative(-5)).toBe(true);
      expect(NumberUtils.isNegative(5)).toBe(false);
      expect(NumberUtils.isNegative(0)).toBe(false);
    });

    it('should calculate percentage', () => {
      expect(NumberUtils.toPercentage(25, 100)).toBe(25);
      expect(NumberUtils.toPercentage(50, 200)).toBe(25);
    });

    it('should clamp number', () => {
      expect(NumberUtils.clamp(5, 1, 10)).toBe(5);
      expect(NumberUtils.clamp(0, 1, 10)).toBe(1);
      expect(NumberUtils.clamp(15, 1, 10)).toBe(10);
    });

    it('should format currency', () => {
      const formatted = NumberUtils.formatCurrency(1234.56, 'USD');
      expect(formatted).toContain('$');
      expect(formatted).toContain('1,234.56');
    });

    it('should convert bytes to human readable format', () => {
      expect(NumberUtils.bytesToSize(1024)).toBe('1 KB');
      expect(NumberUtils.bytesToSize(1024 * 1024)).toBe('1 MB');
      expect(NumberUtils.bytesToSize(0)).toBe('0 Bytes');
    });
  });

  describe('StorageUtils', () => {
    beforeEach(() => {
      // Clear all storage before each test
      localStorage.clear();
      sessionStorage.clear();
    });

    it('should set and get from localStorage', () => {
      StorageUtils.set('test-key', 'test-value');
      const value = StorageUtils.get('test-key');
      expect(value).toBe('test-value');
    });

    it('should return default value for non-existent key', () => {
      const value = StorageUtils.get('non-existent', 'default');
      expect(value).toBe('default');
    });

    it('should check if key exists', () => {
      StorageUtils.set('exist-key', 'value');
      expect(StorageUtils.has('exist-key')).toBe(true);
      expect(StorageUtils.has('non-existent')).toBe(false);
    });

    it('should remove item from storage', () => {
      StorageUtils.set('remove-key', 'value');
      expect(StorageUtils.has('remove-key')).toBe(true);
      
      StorageUtils.remove('remove-key');
      expect(StorageUtils.has('remove-key')).toBe(false);
    });

    it('should clear all prefixed items', () => {
      StorageUtils.setPrefix('test-prefix-');
      StorageUtils.set('key1', 'value1');
      StorageUtils.set('key2', 'value2');
      
      // Add a non-prefixed item to ensure it's not cleared
      localStorage.setItem('other-key', 'other-value');
      
      StorageUtils.clear();
      
      expect(StorageUtils.has('key1')).toBe(false);
      expect(StorageUtils.has('key2')).toBe(false);
      expect(localStorage.getItem('other-key')).toBe('other-value');
    });

    it('should get all keys with prefix', () => {
      StorageUtils.setPrefix('test-prefix-');
      StorageUtils.set('key1', 'value1');
      StorageUtils.set('key2', 'value2');
      
      const keys = StorageUtils.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toHaveLength(2);
    });

    it('should handle JSON serialization', () => {
      const obj = { name: 'test', value: [1, 2, 3] };
      StorageUtils.setJson('json-key', obj);
      const retrieved = StorageUtils.getJson('json-key');
      expect(retrieved).toEqual(obj);
    });

    it('should work with sessionStorage', () => {
      StorageUtils.setSession('session-key', 'session-value');
      const value = StorageUtils.getSession('session-key');
      expect(value).toBe('session-value');
    });
  });

  describe('FrontendUtils namespace', () => {
    it('should expose all utility classes', () => {
      expect(FrontendUtils.Math).toBeDefined();
      expect(FrontendUtils.Color).toBeDefined();
      expect(FrontendUtils.Date).toBeDefined();
      expect(FrontendUtils.Number).toBeDefined();
      expect(FrontendUtils.Storage).toBeDefined();
      expect(FrontendUtils.Objects).toBeDefined();
      expect(FrontendUtils.Strings).toBeDefined();
      expect(FrontendUtils.Validation).toBeDefined();
      expect(FrontendUtils.Arrays).toBeDefined();
    });
  });
});
/**
 * Enhanced Frontend Utilities
 * Comprehensive utilities for frontend/Vue renderer process
 */

import { ArrayUtils } from '../../../shared/utils/array';
// Import shared utilities
import { ObjectUtils } from '../../../shared/utils/object';
import { StringUtils } from '../../../shared/utils/string';
import { ValidationUtils } from '../../../shared/utils/validation';

// Re-export shared utilities for convenience
export { ObjectUtils, StringUtils, ValidationUtils, ArrayUtils };

export class MathUtils {
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  static lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  }

  static map(
    value: number,
    inputMin: number,
    inputMax: number,
    outputMin: number,
    outputMax: number
  ): number {
    return ((value - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin) + outputMin;
  }

  static random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static round(num: number, decimals: number = 2): number {
    const factor = 10 ** decimals;
    return Math.round(num * factor) / factor;
  }

  static degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  static radiansToDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  static isEven(num: number): boolean {
    return num % 2 === 0;
  }

  static isOdd(num: number): boolean {
    return num % 2 !== 0;
  }

  static gcd(a: number, b: number): number {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  static lcm(a: number, b: number): number {
    return (a * b) / MathUtils.gcd(a, b);
  }

  /**
   * Calculate distance between two points
   */
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  /**
   * Calculate angle between two points
   */
  static angle(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  /**
   * Normalize value to 0-1 range
   */
  static normalize(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
  }

  /**
   * Calculate factorial
   */
  static factorial(n: number): number {
    if (n < 0) return NaN;
    if (n === 0) return 1;
    return n * MathUtils.factorial(n - 1);
  }

  /**
   * Calculate combination (nCr)
   */
  static combination(n: number, r: number): number {
    return MathUtils.factorial(n) / (MathUtils.factorial(r) * MathUtils.factorial(n - r));
  }

  /**
   * Calculate permutation (nPr)
   */
  static permutation(n: number, r: number): number {
    return MathUtils.factorial(n) / MathUtils.factorial(n - r);
  }

  /**
   * Check if number is prime
   */
  static isPrime(n: number): boolean {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;

    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  }
}

export class ColorUtils {
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  static rgbToHex(r: number, g: number, b: number): string {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  static hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r = 0,
      g = 0,
      b = 0;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  static rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h *= 60;
    }

    return {
      h: Math.round(h),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  static lighten(color: string, amount: number): string {
    const rgb = ColorUtils.hexToRgb(color);
    if (!rgb) return color;

    const hsl = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.min(100, hsl.l + amount);
    const newRgb = ColorUtils.hslToRgb(hsl.h, hsl.s, hsl.l);
    return ColorUtils.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  static darken(color: string, amount: number): string {
    const rgb = ColorUtils.hexToRgb(color);
    if (!rgb) return color;

    const hsl = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.max(0, hsl.l - amount);
    const newRgb = ColorUtils.hslToRgb(hsl.h, hsl.s, hsl.l);
    return ColorUtils.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  /**
   * Generate random color
   */
  static random(): string {
    return (
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
    );
  }

  /**
   * Blend two colors
   */
  static blend(color1: string, color2: string, factor: number): string {
    const rgb1 = ColorUtils.hexToRgb(color1);
    const rgb2 = ColorUtils.hexToRgb(color2);

    if (!rgb1 || !rgb2) return color1;

    const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
    const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
    const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));

    return ColorUtils.rgbToHex(r, g, b);
  }

  /**
   * Get complementary color
   */
  static complement(color: string): string {
    const rgb = ColorUtils.hexToRgb(color);
    if (!rgb) return color;

    const r = 255 - rgb.r;
    const g = 255 - rgb.g;
    const b = 255 - rgb.b;

    return ColorUtils.rgbToHex(r, g, b);
  }

  /**
   * Convert RGB to RGBA with alpha
   */
  static rgba(r: number, g: number, b: number, a: number = 1): string {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  /**
   * Convert HSL to HSLA with alpha
   */
  static hsla(h: number, s: number, l: number, a: number = 1): string {
    return `hsla(${h}, ${s}%, ${l}%, ${a})`;
  }
}

export class DateUtils {
  static format(date: Date, format: string): string {
    const tokens: { [key: string]: string } = {
      YYYY: date.getFullYear().toString(),
      MM: String(date.getMonth() + 1).padStart(2, '0'),
      DD: String(date.getDate()).padStart(2, '0'),
      HH: String(date.getHours()).padStart(2, '0'),
      mm: String(date.getMinutes()).padStart(2, '0'),
      ss: String(date.getSeconds()).padStart(2, '0'),
    };

    let result = format;
    for (const [token, value] of Object.entries(tokens)) {
      result = result.replace(new RegExp(token, 'g'), value);
    }

    return result;
  }

  static fromNow(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;
    if (interval === 1) return '1 year ago';

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    if (interval === 1) return '1 month ago';

    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    if (interval === 1) return '1 day ago';

    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    if (interval === 1) return '1 hour ago';

    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;
    if (interval === 1) return '1 minute ago';

    if (seconds > 1) return `${Math.floor(seconds)} seconds ago`;
    return 'just now';
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  static addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  static startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  static endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Get days between two dates
   */
  static daysBetween(startDate: Date, endDate: Date): number {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    return Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / oneDay));
  }

  /**
   * Get week number of year
   */
  static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Get quarter of year
   */
  static getQuarter(date: Date): number {
    return Math.floor(date.getMonth() / 3) + 1;
  }

  /**
   * Check if year is leap year
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Get number of days in month
   */
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }
}

export class NumberUtils {
  static format(num: number, decimals: number = 2, thousandsSep: string = ','): string {
    const [integer, decimal] = num.toFixed(decimals).split('.');
    return integer.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep) + (decimal ? '.' + decimal : '');
  }

  static toFixed(num: number, decimals: number): number {
    const factor = 10 ** decimals;
    return Math.round(num * factor) / factor;
  }

  static isInteger(num: number): boolean {
    return Number.isInteger(num);
  }

  static isFloat(num: number): boolean {
    return Number.isFinite(num) && !Number.isInteger(num);
  }

  static isPositive(num: number): boolean {
    return num > 0;
  }

  static isNegative(num: number): boolean {
    return num < 0;
  }

  static isZero(num: number): boolean {
    return num === 0;
  }

  static toPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Format currency
   */
  static formatCurrency(
    amount: number,
    currency: string = 'USD',
    locale: string = 'en-US'
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Format number with locale
   */
  static formatLocale(num: number, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale).format(num);
  }

  /**
   * Round to nearest multiple
   */
  static roundToMultiple(value: number, multiple: number): number {
    return Math.round(value / multiple) * multiple;
  }

  /**
   * Check if number is power of 2
   */
  static isPowerOfTwo(num: number): boolean {
    return num > 0 && (num & (num - 1)) === 0;
  }

  /**
   * Get next power of 2
   */
  static nextPowerOfTwo(num: number): number {
    if (num <= 0) return 1;
    return 2 ** Math.ceil(Math.log2(num));
  }

  /**
   * Convert bytes to human readable format
   */
  static bytesToSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / 1024 ** i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Export all utilities in a single namespace
export const FrontendUtils = {
  Math: MathUtils,
  Color: ColorUtils,
  Date: DateUtils,
  Number: NumberUtils,
  Objects: ObjectUtils,
  Strings: StringUtils,
  Validation: ValidationUtils,
  Arrays: ArrayUtils,
};

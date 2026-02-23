/**
 * Enhanced Validation Utilities
 * Provides comprehensive validation functions
 */

export class ValidationUtils {
  /**
   * Check if value is empty
   */
  static isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  /**
   * Check if value is not empty
   */
  static isNotEmpty(value: unknown): boolean {
    return !ValidationUtils.isEmpty(value);
  }

  /**
   * Check if value is email
   */
  static isEmail(value: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  }

  /**
   * Check if value is URL
   */
  static isUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if value is IPv4 address
   */
  static isIpv4(value: string): boolean {
    const regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(value);
  }

  /**
   * Check if value is IPv6 address
   */
  static isIpv6(value: string): boolean {
    try {
      const ipv6Regex =
        /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
      return ipv6Regex.test(value);
    } catch {
      return false;
    }
  }

  /**
   * Check if value is IP address (IPv4 or IPv6)
   */
  static isIp(value: string): boolean {
    return ValidationUtils.isIpv4(value) || ValidationUtils.isIpv6(value);
  }

  /**
   * Check if value is hexadecimal color
   */
  static isHexColor(value: string): boolean {
    const regex = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
    return regex.test(value);
  }

  /**
   * Check if value is base64 encoded
   */
  static isBase64(value: string): boolean {
    try {
      return btoa(atob(value)) === value;
    } catch {
      return false;
    }
  }

  /**
   * Check if value is valid JSON
   */
  static isJson(value: string): boolean {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if value is numeric
   */
  static isNumeric(value: string): boolean {
    return !isNaN(Number(value)) && !isNaN(parseFloat(value));
  }

  /**
   * Check if value is integer
   */
  static isInteger(value: string): boolean {
    return /^\d+$/.test(value);
  }

  /**
   * Check if value is positive number
   */
  static isPositive(value: number): boolean {
    return value > 0;
  }

  /**
   * Check if value is negative number
   */
  static isNegative(value: number): boolean {
    return value < 0;
  }

  /**
   * Check if value is zero
   */
  static isZero(value: number): boolean {
    return value === 0;
  }

  /**
   * Check if value is even
   */
  static isEven(value: number): boolean {
    return value % 2 === 0;
  }

  /**
   * Check if value is odd
   */
  static isOdd(value: number): boolean {
    return value % 2 !== 0;
  }

  /**
   * Check if value is within range
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Clamp value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Generate random integer
   */
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random float
   */
  static randomFloat(min: number, max: number, precision: number = 2): number {
    const value = Math.random() * (max - min) + min;
    return Number(value.toFixed(precision));
  }

  /**
   * Select random item from array
   */
  static randomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Shuffle array
   */
  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Validate phone number
   */
  static isPhone(value: string, country?: string): boolean {
    // Simple phone validation - can be extended for specific countries
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/[\s\-()]/g, ''));
  }

  /**
   * Validate credit card number
   */
  static isCreditCard(value: string): boolean {
    const sanitized = value.replace(/[\s-]/g, '');
    if (!/^\d{13,19}$/.test(sanitized)) return false;

    let sum = 0;
    let digit = 0;
    let isEven = false;

    for (let i = sanitized.length - 1; i >= 0; i--) {
      digit = parseInt(sanitized.charAt(i), 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Validate UUID
   */
  static isUuid(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  /**
   * Validate MAC address
   */
  static isMacAddress(value: string): boolean {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(value);
  }

  /**
   * Validate postal code
   */
  static isPostalCode(value: string, country?: string): boolean {
    // Generic postal code validation - can be extended for specific countries
    const postalRegex = /^[A-Za-z0-9\s-]{3,10}$/;
    return postalRegex.test(value);
  }
}

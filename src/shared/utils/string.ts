/**
 * Enhanced String Utilities
 * Provides comprehensive string manipulation and utility functions
 */

export class StringUtils {
  /**
   * Capitalize first letter of string
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Convert string to camelCase
   */
  static camelCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((word, i) => (i === 0 ? word.toLowerCase() : StringUtils.capitalize(word)))
      .join('');
  }

  /**
   * Convert string to kebab-case
   */
  static kebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Convert string to snake_case
   */
  static snakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  /**
   * Truncate string to specified length
   */
  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
  }

  /**
   * Pad string at start
   */
  static padStart(str: string, length: number, char: string = ' '): string {
    return str.padStart(length, char);
  }

  /**
   * Pad string at end
   */
  static padEnd(str: string, length: number, char: string = ' '): string {
    return str.padEnd(length, char);
  }

  /**
   * Reverse string
   */
  static reverse(str: string): string {
    return str.split('').reverse().join('');
  }

  /**
   * Remove non-alphanumeric characters
   */
  static removeNonAlphanumeric(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Count occurrences of substring
   */
  static countOccurrences(str: string, substring: string): number {
    return str.split(substring).length - 1;
  }

  /**
   * Check if string is empty or contains only whitespace
   */
  static isEmpty(str: string): boolean {
    return str.trim().length === 0;
  }

  /**
   * Check if string is not empty
   */
  static isNotEmpty(str: string): boolean {
    return !StringUtils.isEmpty(str);
  }

  /**
   * Remove leading and trailing whitespace
   */
  static trim(str: string): string {
    return str.trim();
  }

  /**
   * Remove leading whitespace
   */
  static trimStart(str: string): string {
    return str.trimStart();
  }

  /**
   * Remove trailing whitespace
   */
  static trimEnd(str: string): string {
    return str.trimEnd();
  }

  /**
   * Repeat string n times
   */
  static repeat(str: string, count: number): string {
    return str.repeat(count);
  }

  /**
   * Replace all occurrences of substring
   */
  static replaceAll(str: string, searchValue: string, replaceValue: string): string {
    return str.split(searchValue).join(replaceValue);
  }

  /**
   * Escape HTML entities
   */
  static escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Unescape HTML entities
   */
  static unescapeHtml(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'");
  }

  /**
   * Generate random string
   */
  static random(
    length: number = 10,
    chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  ): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Check if string contains substring (case insensitive)
   */
  static containsIgnoreCase(str: string, search: string): boolean {
    return str.toLowerCase().includes(search.toLowerCase());
  }

  /**
   * Pluralize word based on count
   */
  static pluralize(count: number, singular: string, plural?: string): string {
    if (count === 1) return singular;
    return plural || singular + 's';
  }

  /**
   * Convert string to title case
   */
  static titleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Convert string to constant case
   */
  static constantCase(str: string): string {
    return StringUtils.snakeCase(str).toUpperCase();
  }
}

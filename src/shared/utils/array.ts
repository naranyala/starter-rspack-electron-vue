/**
 * Enhanced Array Utilities
 * Provides comprehensive array manipulation and utility functions
 */

export class ArrayUtils {
  /**
   * Get unique values from array
   */
  static unique<T>(arr: T[]): T[] {
    return [...new Set(arr)];
  }

  /**
   * Chunk array into smaller arrays
   */
  static chunk<T>(arr: T[], size: number): T[][] {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Shuffle array randomly
   */
  static shuffle<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    const random = new Uint32Array(shuffled.length);
    crypto.getRandomValues(random);
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = random[i] % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Remove falsy values from array
   */
  static compact<T>(arr: (T | null | undefined)[]): T[] {
    return arr.filter(Boolean) as T[];
  }

  /**
   * Get difference between two arrays
   */
  static difference<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter((x) => !arr2.includes(x));
  }

  /**
   * Get intersection of two arrays
   */
  static intersection<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter((x) => arr2.includes(x));
  }

  /**
   * Get union of two arrays
   */
  static union<T>(arr1: T[], arr2: T[]): T[] {
    return [...new Set([...arr1, ...arr2])];
  }

  /**
   * Group array by key or function
   */
  static groupBy<T>(arr: T[], key: string | ((item: T) => string)): Record<string, T[]> {
    const result: Record<string, T[]> = {};

    if (typeof key === 'string') {
      for (const item of arr) {
        const keyValue = (item as any)[key];
        if (!result[keyValue]) {
          result[keyValue] = [];
        }
        result[keyValue].push(item);
      }
    } else {
      for (const item of arr) {
        const keyValue = key(item);
        if (!result[keyValue]) {
          result[keyValue] = [];
        }
        result[keyValue].push(item);
      }
    }

    return result;
  }

  /**
   * Partition array based on predicate
   */
  static partition<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] {
    const truthy: T[] = [];
    const falsy: T[] = [];

    for (const item of arr) {
      if (predicate(item)) {
        truthy.push(item);
      } else {
        falsy.push(item);
      }
    }

    return [truthy, falsy];
  }

  /**
   * Remove duplicates based on key
   */
  static uniqBy<T>(arr: T[], key: keyof T | ((item: T) => unknown)): T[] {
    const seen = new Set();
    const result: T[] = [];

    for (const item of arr) {
      const keyValue = typeof key === 'function' ? key(item) : item[key];
      if (!seen.has(keyValue)) {
        seen.add(keyValue);
        result.push(item);
      }
    }

    return result;
  }

  /**
   * Find last element that matches predicate
   */
  static findLast<T>(arr: T[], predicate: (item: T) => boolean): T | undefined {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (predicate(arr[i])) {
        return arr[i];
      }
    }
    return undefined;
  }

  /**
   * Get first element of array
   */
  static first<T>(arr: T[]): T | undefined {
    return arr[0];
  }

  /**
   * Get last element of array
   */
  static last<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1];
  }

  /**
   * Get nth element of array
   */
  static nth<T>(arr: T[], n: number): T | undefined {
    return arr[n < 0 ? arr.length + n : n];
  }

  /**
   * Remove element at index
   */
  static removeAt<T>(arr: T[], index: number): T[] {
    return [...arr.slice(0, index), ...arr.slice(index + 1)];
  }

  /**
   * Remove element by value
   */
  static remove<T>(arr: T[], value: T): T[] {
    const index = arr.indexOf(value);
    if (index === -1) return [...arr];
    return ArrayUtils.removeAt(arr, index);
  }

  /**
   * Remove elements that match predicate
   */
  static removeWhere<T>(arr: T[], predicate: (item: T) => boolean): T[] {
    return arr.filter((item) => !predicate(item));
  }

  /**
   * Insert element at index
   */
  static insertAt<T>(arr: T[], index: number, ...items: T[]): T[] {
    return [...arr.slice(0, index), ...items, ...arr.slice(index)];
  }

  /**
   * Move element from one index to another
   */
  static move<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
    const result = [...arr];
    const [item] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, item);
    return result;
  }

  /**
   * Rotate array by n positions
   */
  static rotate<T>(arr: T[], n: number): T[] {
    const len = arr.length;
    if (len === 0) return arr;
    const normalized = ((n % len) + len) % len;
    return [...arr.slice(normalized), ...arr.slice(0, normalized)];
  }

  /**
   * Sample random elements from array
   */
  static sample<T>(arr: T[], count: number): T[] {
    if (count >= arr.length) return [...arr];
    const shuffled = ArrayUtils.shuffle([...arr]);
    return shuffled.slice(0, count);
  }

  /**
   * Get frequency map of array elements
   */
  static frequencies<T>(arr: T[]): Map<T, number> {
    const freq = new Map<T, number>();
    for (const item of arr) {
      freq.set(item, (freq.get(item) || 0) + 1);
    }
    return freq;
  }

  /**
   * Check if array is sorted
   */
  static isSorted<T>(arr: T[], compareFn?: (a: T, b: T) => number): boolean {
    if (arr.length <= 1) return true;
    
    const compare = compareFn || ((a: T, b: T) => (a > b ? 1 : a < b ? -1 : 0));
    
    for (let i = 1; i < arr.length; i++) {
      if (compare(arr[i - 1], arr[i]) > 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Zip multiple arrays together
   */
  static zip<T>(...arrays: T[][]): T[][] {
    const minLength = Math.min(...arrays.map(arr => arr.length));
    const result: T[][] = [];
    
    for (let i = 0; i < minLength; i++) {
      result.push(arrays.map(arr => arr[i]));
    }
    
    return result;
  }

  /**
   * Flatten nested array
   */
  static flatten<T>(arr: (T | T[])[]): T[] {
    return arr.reduce((acc: T[], val: T | T[]) =>
      Array.isArray(val) ? acc.concat(ArrayUtils.flatten(val as T[])) : acc.concat([val as T]), [] as T[]
    );
  }

  /**
   * Deep flatten nested array
   */
  static deepFlatten<T>(arr: any[]): T[] {
    return arr.reduce((acc: T[], val: any) =>
      Array.isArray(val) ? acc.concat(ArrayUtils.deepFlatten(val)) : acc.concat([val]), [] as T[]
    );
  }
}
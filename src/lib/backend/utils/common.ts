import crypto from 'node:crypto';
import { createHash } from 'node:crypto';

export class CryptoUtils {
  static hash(data: string, algorithm: string = 'sha256'): string {
    return createHash(algorithm).update(data).digest('hex');
  }

  static uuid(): string {
    return crypto.randomUUID();
  }

  static randomBytes(size: number = 16): string {
    return crypto.randomBytes(size).toString('hex');
  }

  static encrypt(text: string, secret: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', crypto.createHash('md5').update(secret).digest().slice(0, 32), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  static decrypt(encrypted: string, secret: string): string {
    const [ivHex, encryptedText] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', crypto.createHash('md5').update(secret).digest().slice(0, 32), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  static hmac(data: string, secret: string, algorithm: string = 'sha256'): string {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }

  static compare(a: string, b: string): boolean {
    try {
      return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
    } catch {
      return false;
    }
  }
}

export class ObjectUtils {
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof Array) return obj.map((item) => ObjectUtils.deepClone(item)) as any;
    if (typeof obj === 'object') {
      const cloned: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = ObjectUtils.deepClone(obj[key]);
        }
      }
      return cloned;
    }
    return obj;
  }

  static deepMerge<T extends Record<string, any>, U extends Record<string, any>>(
    target: T,
    source: U
  ): T & U {
    const result = { ...target } as T & U;
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceVal = (source as any)[key];
        const targetVal = (target as any)[key];

        if (
          typeof sourceVal === 'object' &&
          sourceVal !== null &&
          !Array.isArray(sourceVal) &&
          typeof targetVal === 'object' &&
          targetVal !== null &&
          !Array.isArray(targetVal)
        ) {
          (result as any)[key] = ObjectUtils.deepMerge(targetVal, sourceVal);
        } else {
          (result as any)[key] = sourceVal;
        }
      }
    }
    return result;
  }

  static flatten(obj: Record<string, any>, prefix: string = ''): Record<string, any> {
    const flattened: Record<string, any> = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, ObjectUtils.flatten(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }

    return flattened;
  }

  static unflatten(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const keys = key.split('.');
        let current = result;

        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i];
          if (!(k in current)) {
            current[k] = {};
          }
          current = current[k];
        }

        current[keys[keys.length - 1]] = obj[key];
      }
    }

    return result;
  }

  static pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  static omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  }
}

export class ArrayUtils {
  static unique<T>(arr: T[]): T[] {
    return [...new Set(arr)];
  }

  static chunk<T>(arr: T[], size: number): T[][] {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  static shuffle<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static compact<T>(arr: (T | null | undefined)[]): T[] {
    return arr.filter(Boolean) as T[];
  }

  static difference<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter(x => !arr2.includes(x));
  }

  static intersection<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter(x => arr2.includes(x));
  }

  static union<T>(arr1: T[], arr2: T[]): T[] {
    return [...new Set([...arr1, ...arr2])];
  }

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
}

export class StringUtils {
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static camelCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((word, i) => i === 0 ? word.toLowerCase() : StringUtils.capitalize(word))
      .join('');
  }

  static kebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  static snakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
  }

  static padStart(str: string, length: number, char: string = ' '): string {
    return str.padStart(length, char);
  }

  static padEnd(str: string, length: number, char: string = ' '): string {
    return str.padEnd(length, char);
  }

  static reverse(str: string): string {
    return str.split('').reverse().join('');
  }

  static removeNonAlphanumeric(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, '');
  }

  static countOccurrences(str: string, substring: string): number {
    return str.split(substring).length - 1;
  }
}
/**
 * HTTP and API utilities for renderer process
 */

interface HttpClientOptions {
  timeout?: number;
  headers?: Record<string, string>;
  [key: string]: unknown;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
}

/**
 * HTTP client with error handling
 */
export class HttpClient {
  private baseURL: string;
  private defaultOptions: HttpClientOptions;

  constructor(baseURL = '', options: HttpClientOptions = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };
  }

  /**
   * Make HTTP request
   * @param url - Request URL
   * @param options - Request options
   * @returns Response promise
   */
  async request(url: string, options: RequestOptions = {}): Promise<unknown> {
    const fullUrl = this.baseURL ? `${this.baseURL}${url}` : url;
    const requestOptions = { ...this.defaultOptions, ...options };

    // Merge headers
    requestOptions.headers = { ...this.defaultOptions.headers, ...(options.headers || {}) };

    try {
      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestOptions.timeout);

      const response = await fetch(fullUrl, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * GET request
   * @param url - Request URL
   * @param options - Request options
   * @returns Response promise
   */
  get(url: string, options: RequestOptions = {}): Promise<unknown> {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   * @param url - Request URL
   * @param data - Request data
   * @param options - Request options
   * @returns Response promise
   */
  post(url: string, data: unknown = null, options: RequestOptions = {}): Promise<unknown> {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   * @param url - Request URL
   * @param data - Request data
   * @param options - Request options
   * @returns Response promise
   */
  put(url: string, data: unknown = null, options: RequestOptions = {}): Promise<unknown> {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   * @param url - Request URL
   * @param options - Request options
   * @returns Response promise
   */
  delete(url: string, options: RequestOptions = {}): Promise<unknown> {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

/**
 * Local storage utilities
 */
export class StorageUtils {
  /**
   * Get value from local storage
   * @param key - Storage key
   * @param defaultValue - Default value if not found
   * @returns Stored value or default
   */
  static get(key: string, defaultValue: unknown = null): unknown {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  /**
   * Set value to local storage
   * @param key - Storage key
   * @param value - Value to store
   */
  static set(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  /**
   * Remove value from local storage
   * @param key - Storage key
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  /**
   * Clear all local storage
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if key exists in local storage
   * @param key - Storage key
   * @returns Whether key exists
   */
  static has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get all keys from local storage
   * @returns Array of keys
   */
  static keys(): string[] {
    return Object.keys(localStorage);
  }
}

interface ElectronAPIInterface {
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  [key: string]: unknown;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPIInterface;
  }
}

export class ElectronAPI {
  static isElectron(): boolean {
    return typeof window !== 'undefined' && !!window.electronAPI;
  }

  static async getVersion(): Promise<string> {
    if (ElectronAPI.isElectron()) {
      return await window.electronAPI!.getVersion();
    }
    return 'web';
  }

  static async getPlatform(): Promise<string> {
    if (ElectronAPI.isElectron()) {
      return await window.electronAPI!.getPlatform();
    }
    return navigator.platform;
  }

  /**
   * Send message to main process
   * @param channel - IPC channel
   * @param data - Data to send
   */
  static sendToMain(channel: string, data: unknown): void {
    if (ElectronAPI.isElectron()) {
      // This would need to be implemented in preload.js
      console.log('Sending to main process:', channel, data);
    }
  }

  /**
   * Receive message from main process
   * @param channel - IPC channel
   * @param callback - Message callback
   */
  static onFromMain(channel: string, _callback: (data: unknown) => void): void {
    if (ElectronAPI.isElectron()) {
      // This would need to be implemented in preload.js
      console.log('Listening for main process messages:', channel);
    }
  }
}

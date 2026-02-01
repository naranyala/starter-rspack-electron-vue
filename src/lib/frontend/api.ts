interface HttpClientOptions {
  timeout?: number;
  headers?: Record<string, string>;
  [key: string]: unknown;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export class HttpClient {
  private baseURL: string;
  private defaultOptions: HttpClientOptions;
  private interceptors: {
    request: Array<(config: RequestOptions) => RequestOptions | Promise<RequestOptions>>;
    response: Array<(response: Response) => Response | Promise<Response>>;
  };

  constructor(baseURL: string = '', options: HttpClientOptions = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };
    this.interceptors = {
      request: [],
      response: [],
    };
  }

  addRequestInterceptor(
    interceptor: (config: RequestOptions) => RequestOptions | Promise<RequestOptions>
  ): () => void {
    this.interceptors.request.push(interceptor);
    return () => {
      const index = this.interceptors.request.indexOf(interceptor);
      if (index > -1) this.interceptors.request.splice(index, 1);
    };
  }

  addResponseInterceptor(
    interceptor: (response: Response) => Response | Promise<Response>
  ): () => void {
    this.interceptors.response.push(interceptor);
    return () => {
      const index = this.interceptors.response.indexOf(interceptor);
      if (index > -1) this.interceptors.response.splice(index, 1);
    };
  }

  private async applyRequestInterceptors(config: RequestOptions): Promise<RequestOptions> {
    let result = config;
    for (const interceptor of this.interceptors.request) {
      result = await interceptor(result);
    }
    return result;
  }

  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let result = response;
    for (const interceptor of this.interceptors.response) {
      result = await interceptor(result);
    }
    return result;
  }

  async request<T = unknown>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const fullUrl = this.baseURL ? `${this.baseURL}${url}` : url;
    const requestOptions = { ...this.defaultOptions, ...options };

    requestOptions.headers = { ...this.defaultOptions.headers, ...(options.headers || {}) };

    const processedOptions = await this.applyRequestInterceptors(requestOptions);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), processedOptions.timeout || 10000);

      const response = await fetch(fullUrl, {
        ...processedOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const processedResponse = await this.applyResponseInterceptors(response);

      const contentType = processedResponse.headers.get('content-type');
      let data: T;
      if (contentType?.includes('application/json')) {
        data = await processedResponse.json();
      } else {
        data = (await processedResponse.text()) as unknown as T;
      }

      return {
        success: processedResponse.ok,
        data,
        status: processedResponse.status,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: 'Request timeout', status: 0 };
      }
      return { success: false, error: (error as Error).message, status: 0 };
    }
  }

  get<T = unknown>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  post<T = unknown>(
    url: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T = unknown>(
    url: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T = unknown>(
    url: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T = unknown>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  upload<T = unknown>(
    url: string,
    file: File | Blob,
    data?: Record<string, unknown>,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }
    formData.append('file', file);

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.baseURL ? `${this.baseURL}${url}` : url);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress((event.loaded / event.total) * 100);
        }
      };

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            success: xhr.status >= 200 && xhr.status < 300,
            data: response,
            status: xhr.status,
          });
        } catch {
          resolve({ success: false, error: 'Invalid response', status: xhr.status });
        }
      };

      xhr.onerror = () => {
        resolve({ success: false, error: 'Network error', status: 0 });
      };

      xhr.send(formData);
    });
  }

  download(
    url: string,
    filename: string,
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', this.baseURL ? `${this.baseURL}${url}` : url);
      xhr.responseType = 'blob';

      xhr.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress((event.loaded / event.total) * 100);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const blob = xhr.response;
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
          resolve(true);
        } else {
          resolve(false);
        }
      };

      xhr.onerror = () => resolve(false);
      xhr.send();
    });
  }
}

export class StorageUtils {
  private static prefix: string = '';

  static setPrefix(prefix: string): void {
    StorageUtils.prefix = prefix;
  }

  private static getKey(key: string): string {
    return `${StorageUtils.prefix}${key}`;
  }

  static get<T = unknown>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(StorageUtils.getKey(key));
      if (item === null) return defaultValue;
      try {
        return JSON.parse(item);
      } catch {
        return item as unknown as T;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): boolean {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(StorageUtils.getKey(key), stringValue);
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  }

  static remove(key: string): boolean {
    try {
      localStorage.removeItem(StorageUtils.getKey(key));
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  static has(key: string): boolean {
    return localStorage.getItem(StorageUtils.getKey(key)) !== null;
  }

  static clear(): boolean {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(StorageUtils.prefix)) {
          keysToRemove.push(key);
        }
      }
      for (let i = 0; i < keysToRemove.length; i++) {
        localStorage.removeItem(keysToRemove[i]);
      }
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  static keys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(StorageUtils.prefix)) {
        keys.push(key.replace(StorageUtils.prefix, ''));
      }
    }
    return keys;
  }

  static size(): number {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        total += localStorage.getItem(key)!.length * 2;
      }
    }
    return total;
  }

  static maxSize(): number {
    return 5 * 1024 * 1024;
  }

  static getJson<T>(key: string): T | null {
    return StorageUtils.get<T>(key);
  }

  static setJson<T>(key: string, value: T): boolean {
    return StorageUtils.set(key, value);
  }
}

export class SessionStorageUtils {
  private static prefix: string = '';

  static setPrefix(prefix: string): void {
    SessionStorageUtils.prefix = prefix;
  }

  private static getKey(key: string): string {
    return `${SessionStorageUtils.prefix}${key}`;
  }

  static get<T = unknown>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = sessionStorage.getItem(SessionStorageUtils.getKey(key));
      if (item === null) return defaultValue;
      try {
        return JSON.parse(item);
      } catch {
        return item as unknown as T;
      }
    } catch {
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): boolean {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      sessionStorage.setItem(SessionStorageUtils.getKey(key), stringValue);
      return true;
    } catch {
      return false;
    }
  }

  static remove(key: string): void {
    sessionStorage.removeItem(SessionStorageUtils.getKey(key));
  }

  static clear(): void {
    sessionStorage.clear();
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
  private static api: ElectronAPIInterface | undefined;

  static isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.electronAPI;
  }

  static get version(): Promise<string> {
    if (ElectronAPI.isAvailable()) {
      return window.electronAPI!.getVersion();
    }
    return Promise.resolve(ElectronAPI.getWebVersion());
  }

  static get platform(): Promise<string> {
    if (ElectronAPI.isAvailable()) {
      return window.electronAPI!.getPlatform();
    }
    return Promise.resolve(ElectronAPI.getWebPlatform());
  }

  static getWebVersion(): string {
    return 'web';
  }

  static getWebPlatform(): string {
    return navigator.platform;
  }

  static isElectron(): boolean {
    return ElectronAPI.isAvailable();
  }

  static async call<T = unknown>(channel: string, ...args: unknown[]): Promise<T> {
    if (!ElectronAPI.isAvailable()) {
      throw new Error('Electron API not available');
    }
    const handler = (window.electronAPI as Record<string, unknown>)[channel];
    if (typeof handler === 'function') {
      return handler(...args) as Promise<T>;
    }
    throw new Error(`Channel "${channel}" not found`);
  }

  static send(channel: string, data?: unknown): void {
    if (ElectronAPI.isAvailable()) {
      console.log('Sending to main process:', channel, data);
    }
  }

  static on(channel: string, callback: (data: unknown) => void): () => void {
    if (ElectronAPI.isAvailable()) {
      console.log('Listening for main process messages:', channel);
    }
    return () => {};
  }

  static invoke<T>(channel: string, data?: unknown): Promise<T> {
    return ElectronAPI.call<T>(channel, data);
  }
}

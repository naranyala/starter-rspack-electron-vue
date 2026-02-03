/**
 * Shared Types and Interfaces
 */

export interface Result<T = void, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface KeyValue<K = string, V = unknown> {
  key: K;
  value: V;
}

export interface Range<T> {
  min: T;
  max: T;
}

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Point, Size {}

export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>;
  cancel(): void;
  flush(): ReturnType<T>;
}

export interface ThrottledFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>;
  cancel(): void;
}

export interface RetryOptions {
  retries: number;
  delay: number;
  backoff: number;
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}
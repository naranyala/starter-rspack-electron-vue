/**
 * Enhanced Async Utilities
 * Provides comprehensive asynchronous utility functions for both backend and frontend
 */

import type { DebouncedFunction, RetryOptions, ThrottledFunction } from './types';

export class AsyncUtils {
  /**
   * Debounce a function call
   */
  static debounce<T extends (...args: any[]) => any>(func: T, wait: number): DebouncedFunction<T> {
    let timeout: any;
    const debouncedFunc = function (this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
      const later = () => {
        timeout = null;
        // @ts-expect-error
        return func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      // @ts-expect-error
      return timeout ? undefined : func.apply(this, args);
    } as DebouncedFunction<T>;

    debouncedFunc.cancel = () => {
      clearTimeout(timeout);
      timeout = null;
    };

    debouncedFunc.flush = function (this: any, ...args: Parameters<T>) {
      clearTimeout(timeout);
      timeout = null;
      // @ts-expect-error
      return func.apply(this, args);
    };

    return debouncedFunc;
  }

  /**
   * Throttle a function call
   */
  static throttle<T extends (...args: any[]) => any>(func: T, limit: number): ThrottledFunction<T> {
    let inThrottle: boolean;
    let lastResult: any;

    const throttledFunc = function (this: any, ...args: Parameters<T>): ReturnType<T> {
      if (!inThrottle) {
        // @ts-expect-error
        lastResult = func.apply(this, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
      return lastResult;
    } as ThrottledFunction<T>;

    throttledFunc.cancel = () => {
      inThrottle = false;
    };

    return throttledFunc;
  }

  /**
   * Execute function once
   */
  static once<T extends (...args: any[]) => any>(
    func: T
  ): (...args: Parameters<T>) => ReturnType<T> | undefined {
    let called = false;
    let result: any;
    return function (this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
      if (called) return result;
      called = true;
      // @ts-expect-error
      result = func.apply(this, args);
      return result;
    };
  }

  /**
   * Memoize a function
   */
  static memoize<T, Args extends unknown[]>(
    func: (...args: Args) => T,
    resolver?: (...args: Args) => string
  ): (...args: Args) => T {
    const cache = new Map<string, { value: T; args: Args }>();
    return (...args: Args): T => {
      const key = resolver ? resolver(...args) : JSON.stringify(args);
      const cached = cache.get(key);
      if (cached && JSON.stringify(cached.args) === JSON.stringify(args)) {
        return cached.value;
      }
      const value = func(...args);
      cache.set(key, { value, args });
      return value;
    };
  }

  /**
   * Sleep/pause execution
   */
  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry a function with exponential backoff
   */
  static async retry<T>(fn: () => Promise<T>, options: Partial<RetryOptions> = {}): Promise<T> {
    const { retries = 3, delay = 1000, backoff = 2 } = options;

    let lastError: Error;

    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (i === retries) {
          throw lastError;
        }

        await AsyncUtils.sleep(delay * backoff ** i);
      }
    }

    throw lastError!;
  }

  /**
   * Timeout a promise
   */
  static timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
      ),
    ]);
  }

  /**
   * Execute promises in series
   */
  static async series<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
    const results: T[] = [];
    for (const task of tasks) {
      results.push(await task());
    }
    return results;
  }

  /**
   * Execute promises in parallel with concurrency limit
   */
  static async parallel<T>(
    tasks: (() => Promise<T>)[],
    concurrency: number = Infinity
  ): Promise<T[]> {
    if (concurrency >= tasks.length) {
      return Promise.all(tasks.map((task) => task()));
    }

    const results: T[] = [];
    for (let i = 0; i < tasks.length; i += concurrency) {
      const batch = tasks.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map((task) => task()));
      results.push(...batchResults);
    }
    return results;
  }

  /**
   * Execute promises with race condition
   */
  static async race<T>(tasks: (() => Promise<T>)[]): Promise<T> {
    const promises = tasks.map((task) => task());
    return Promise.race(promises);
  }

  /**
   * Execute promise with fallback
   */
  static async withFallback<T>(primary: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    try {
      return await primary();
    } catch {
      return await fallback();
    }
  }

  /**
   * Execute promise with circuit breaker pattern
   */
  static circuitBreaker<T>(
    fn: () => Promise<T>,
    options: {
      threshold: number;
      timeout: number;
      resetTimeout: number;
    } = { threshold: 5, timeout: 60000, resetTimeout: 60000 }
  ) {
    let failureCount = 0;
    let lastFailureTime: number | null = null;
    let isOpen = false;

    return async (): Promise<T> => {
      if (isOpen) {
        if (Date.now() - (lastFailureTime || 0) > options.resetTimeout) {
          // Half-open state - allow one trial call
          try {
            const result = await fn();
            // Success - close the circuit
            isOpen = false;
            failureCount = 0;
            return result;
          } catch (error) {
            // Failure - keep open
            return Promise.reject(error);
          }
        } else {
          // Still in open state
          throw new Error('Circuit breaker is OPEN');
        }
      }

      try {
        const result = await fn();
        // Reset on success
        failureCount = 0;
        return result;
      } catch (error) {
        failureCount++;
        lastFailureTime = Date.now();

        if (failureCount >= options.threshold) {
          isOpen = true;
        }

        throw error;
      }
    };
  }

  /**
   * Execute promise with retry and timeout
   */
  static async retryWithTimeout<T>(
    fn: () => Promise<T>,
    retryOptions: Partial<RetryOptions> = {},
    timeoutMs: number = 30000
  ): Promise<T> {
    return AsyncUtils.timeout(AsyncUtils.retry(fn, retryOptions), timeoutMs);
  }

  /**
   * Create a cancellable promise
   */
  static cancellable<T>(promise: Promise<T>): { promise: Promise<T>; cancel: () => void } {
    let isCancelled = false;

    const wrappedPromise = new Promise<T>((resolve, reject) => {
      promise.then(
        (value) => (isCancelled ? reject(new Error('Promise cancelled')) : resolve(value)),
        (error) => (isCancelled ? reject(new Error('Promise cancelled')) : reject(error))
      );
    });

    return {
      promise: wrappedPromise,
      cancel: () => {
        isCancelled = true;
      },
    };
  }

  /**
   * Execute promise with progress tracking
   */
  static async withProgress<T>(
    promise: Promise<T>,
    onProgress: (progress: number) => void
  ): Promise<T> {
    // Simulate progress for this example
    // In real implementation, this would depend on the specific promise type
    const interval = setInterval(() => {
      onProgress(Math.random() * 100);
    }, 100);

    try {
      const result = await promise;
      clearInterval(interval);
      onProgress(100);
      return result;
    } catch (error) {
      clearInterval(interval);
      throw error;
    }
  }
}

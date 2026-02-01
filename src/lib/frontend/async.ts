export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return function (this: unknown, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

export function once<T extends (...args: unknown[]) => unknown>(
  func: T
): (...args: Parameters<T>) => unknown {
  let called = false;
  let result: unknown;
  return function (this: unknown, ...args: Parameters<T>): unknown {
    if (called) return result;
    called = true;
    result = func.apply(this, args);
    return result;
  };
}

export function memoize<T, Args extends unknown[]>(
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

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
  backoff: number = 2
): Promise<T> {
  return fn().catch(async (error) => {
    if (retries <= 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * backoff);
  });
}

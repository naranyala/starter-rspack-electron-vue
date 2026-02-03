// Import enhanced async utilities from shared
import { AsyncUtils } from '../../shared/utils/async';

// Re-export enhanced utilities for backward compatibility
export const debounce = AsyncUtils.debounce;
export const throttle = AsyncUtils.throttle;
export const once = AsyncUtils.once;
export const memoize = AsyncUtils.memoize;
export const sleep = AsyncUtils.sleep;
export const retry = AsyncUtils.retry;

// Export the full AsyncUtils class for advanced usage
export { AsyncUtils };

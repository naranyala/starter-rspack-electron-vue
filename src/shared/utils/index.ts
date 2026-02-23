/**
 * Shared Utilities Index
 * Centralized export of all shared utility classes
 *
 * This is the single source of truth for all utilities.
 * Backend and Frontend should import from here instead of duplicating.
 */

// Re-export from main utils.ts file
export {
  EnvUtils,
  JsonUtils,
  LogUtils,
  PathUtils,
  TypeUtils,
  ValidationUtils as SharedValidationUtils,
} from '../utils';
export * from './array';
export { ArrayUtils as Arrays } from './array';
export * from './async';
export { AsyncUtils as Async } from './async';
export * from './cache';
export { CacheUtils as Cache, MemoryCache } from './cache';
export * from './object';
// Re-export commonly used utilities with shorter names
export { ObjectUtils as Objects } from './object';
export * from './string';
export { StringUtils as Strings } from './string';
// Re-export all utility modules
export * from './types';
export * from './validation';
export { ValidationUtils as Validation } from './validation';

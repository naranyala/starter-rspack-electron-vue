/**
 * Backend Lib Index
 * Re-exports shared utilities and adds backend-specific ones
 */

// Re-export shared utilities (single source of truth)
export {
  Arrays,
  Async,
  Cache,
  EnvUtils,
  JsonUtils,
  LogUtils,
  Objects,
  PathUtils,
  Strings,
  TypeUtils,
} from '../../shared/utils/index';
// Backend-specific utilities
export * from './electron';
export * from './utils-enhanced';

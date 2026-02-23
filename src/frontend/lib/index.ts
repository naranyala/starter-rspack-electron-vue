/**
 * Frontend Lib Index
 * Re-exports shared utilities and adds frontend-specific ones
 */

// Re-export shared utilities (single source of truth)
export {
  Arrays,
  Async as SharedAsync,
  Cache,
  JsonUtils,
  Objects,
  Strings,
  TypeUtils,
} from '../../shared/utils/index';
// Frontend-specific utilities
export * from './api';
export * from './async';
export * from './dom';
export * from './events';
export * from './utils-enhanced';

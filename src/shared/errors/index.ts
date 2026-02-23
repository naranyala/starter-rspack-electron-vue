export {
  AppError,
  ConfigError,
  FileSystemError,
  IpcError,
  SettingsError,
  ValidationError,
  WindowError,
} from './app-error';

export {
  createSafeHandler,
  type ErrorHandler,
  GlobalErrorHandler,
  getGlobalErrorHandler,
  isAppError,
} from './error-handler';

export type { Result } from './result';

export {
  Err,
  err,
  fromPromise,
  fromSafePromise,
  fromThrowable,
  isErr,
  isOk,
  isResult,
  Ok,
  ok,
  tryCatch,
} from './result';

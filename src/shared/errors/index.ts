export {
  AppError,
  IpcError,
  ValidationError,
  ConfigError,
  FileSystemError,
  WindowError,
  SettingsError,
} from './app-error';

export {
  GlobalErrorHandler,
  getGlobalErrorHandler,
  createSafeHandler,
  isAppError,
  type ErrorHandler,
} from './error-handler';

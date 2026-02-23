/**
 * Base error class for application errors
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

/**
 * Error for IPC communication failures
 */
export class IpcError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'IPC_ERROR', details);
    this.name = 'IpcError';
  }
}

/**
 * Error for validation failures
 */
export class ValidationError extends AppError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', { field });
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Error for configuration issues
 */
export class ConfigError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIG_ERROR', details);
    this.name = 'ConfigError';
  }
}

/**
 * Error for file system operations
 */
export class FileSystemError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'FILE_SYSTEM_ERROR', details);
    this.name = 'FileSystemError';
  }
}

/**
 * Error for window management operations
 */
export class WindowError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'WINDOW_ERROR', details);
    this.name = 'WindowError';
  }
}

/**
 * Error for settings operations
 */
export class SettingsError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'SETTINGS_ERROR', details);
    this.name = 'SettingsError';
  }
}

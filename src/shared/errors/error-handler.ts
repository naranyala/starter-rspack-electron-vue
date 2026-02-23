import type { AppError } from './app-error';

/**
 * Error handler interface
 */
export interface ErrorHandler {
  handle(error: unknown): void;
  onError<T extends AppError>(errorType: new (...args: never[]) => T, handler: (error: T) => void): void;
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && 'code' in error;
}

/**
 * Global error handler for the application
 */
export class GlobalErrorHandler implements ErrorHandler {
  private handlers: Map<new (...args: never[]) => AppError, (error: AppError) => void> = new Map();
  private defaultHandler: (error: unknown) => void;

  constructor(defaultHandler?: (error: unknown) => void) {
    this.defaultHandler = defaultHandler || this.logError;
  }

  /**
   * Register a handler for a specific error type
   */
  onError<T extends AppError>(errorType: new (...args: never[]) => T, handler: (error: T) => void): void {
    this.handlers.set(errorType as new (...args: never[]) => AppError, handler as (error: AppError) => void);
  }

  /**
   * Handle an error using the appropriate handler
   */
  handle(error: unknown): void {
    if (isAppError(error)) {
      const handler = this.handlers.get(error.constructor as new (...args: never[]) => AppError);
      if (handler) {
        handler(error);
        return;
      }
    }

    this.defaultHandler(error);
  }

  /**
   * Set the default error handler
   */
  setDefaultHandler(handler: (error: unknown) => void): void {
    this.defaultHandler = handler;
  }

  /**
   * Default error logging
   */
  private logError(error: unknown): void {
    if (error instanceof Error) {
      console.error('[GlobalErrorHandler]', error.message, error.stack);
    } else {
      console.error('[GlobalErrorHandler]', error);
    }
  }
}

// Singleton instance
const globalErrorHandler = new GlobalErrorHandler();

export function getGlobalErrorHandler(): GlobalErrorHandler {
  return globalErrorHandler;
}

/**
 * Create a safe async function that handles errors automatically
 */
export function createSafeHandler<T extends (...args: never[]) => Promise<unknown>>(
  fn: T,
  errorHandler?: (error: unknown) => void
): T {
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      return await fn(...args) as Awaited<ReturnType<T>>;
    } catch (error) {
      if (errorHandler) {
        errorHandler(error);
      } else {
        globalErrorHandler.handle(error);
      }
      throw error;
    }
  }) as T;
}

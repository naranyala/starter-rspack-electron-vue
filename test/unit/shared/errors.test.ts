import { describe, it, expect } from 'bun:test';
import {
  AppError,
  IpcError,
  ValidationError,
  ConfigError,
  GlobalErrorHandler,
  isAppError,
} from '../../../src/shared/errors';

describe('AppError', () => {
  it('should create an AppError with code and details', () => {
    const error = new AppError('Test message', 'TEST_CODE', { key: 'value' });

    expect(error.message).toBe('Test message');
    expect(error.code).toBe('TEST_CODE');
    expect(error.details).toEqual({ key: 'value' });
    expect(error.name).toBe('AppError');
  });

  it('should serialize to JSON', () => {
    const error = new AppError('Test', 'CODE', { data: 123 });
    const json = error.toJSON();

    expect(json).toEqual({
      name: 'AppError',
      message: 'Test',
      code: 'CODE',
      details: { data: 123 },
    });
  });
});

describe('IpcError', () => {
  it('should create an IpcError', () => {
    const error = new IpcError('IPC failed', { channel: 'test' });

    expect(error.message).toBe('IPC failed');
    expect(error.code).toBe('IPC_ERROR');
    expect(error.name).toBe('IpcError');
  });
});

describe('ValidationError', () => {
  it('should create a ValidationError with field', () => {
    const error = new ValidationError('Invalid email', 'email');

    expect(error.message).toBe('Invalid email');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.field).toBe('email');
  });
});

describe('ConfigError', () => {
  it('should create a ConfigError', () => {
    const error = new ConfigError('Missing config', { key: 'apiKey' });

    expect(error.message).toBe('Missing config');
    expect(error.code).toBe('CONFIG_ERROR');
  });
});

describe('GlobalErrorHandler', () => {
  it('should handle errors with default handler', () => {
    const handler = new GlobalErrorHandler();
    const error = new Error('Test error');

    expect(() => handler.handle(error)).not.toThrow();
  });

  it('should use registered handler for specific error type', () => {
    const handler = new GlobalErrorHandler();
    let capturedError: AppError | null = null;

    handler.onError(AppError, (error: AppError) => {
      capturedError = error;
    });

    const testError = new AppError('Test', 'CODE');
    handler.handle(testError);

    expect(capturedError).toBe(testError);
  });

  it('should identify AppError instances', () => {
    const error = new AppError('Test', 'CODE');
    expect(isAppError(error)).toBe(true);
    expect(isAppError(new Error('Regular'))).toBe(false);
  });
});

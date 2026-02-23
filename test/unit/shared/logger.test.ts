import { describe, it, expect } from 'bun:test';
import { createLogger } from '../../../src/shared/logger';

describe('ConsoleLogger', () => {
  it('should create a logger with prefix', () => {
    const logger = createLogger('Test');
    expect(logger).toBeDefined();
  });

  it('should respect log levels', () => {
    const logger = createLogger('Test', { level: 'error' });
    
    // Should not throw
    logger.debug('This should not appear');
    logger.info('This should not appear');
    logger.warn('This should not appear');
    expect(() => logger.error('This should appear')).not.toThrow();
  });

  it('should log at all levels when set to debug', () => {
    const logger = createLogger('Test', { level: 'debug' });
    
    expect(() => logger.debug('debug')).not.toThrow();
    expect(() => logger.info('info')).not.toThrow();
    expect(() => logger.warn('warn')).not.toThrow();
    expect(() => logger.error('error')).not.toThrow();
  });

  it('should allow changing log level', () => {
    const logger = createLogger('Test');
    logger.setLevel('warn');
    
    expect(() => logger.warn('test')).not.toThrow();
  });
});

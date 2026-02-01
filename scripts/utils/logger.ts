#!/usr/bin/env node
/**
 * Shared Logger Module
 * Provides consistent, colored logging across all build scripts
 */

export type LogLevel = 'debug' | 'info' | 'success' | 'warning' | 'error' | 'fatal';

interface LogConfig {
  level: LogLevel;
  prefix: string;
  color: string;
  emoji: string;
}

const LOG_CONFIGS: Record<LogLevel, LogConfig> = {
  debug: {
    level: 'debug',
    prefix: '[DEBUG]',
    color: '\x1b[90m', // Gray
    emoji: '🔍',
  },
  info: {
    level: 'info',
    prefix: '[INFO]',
    color: '\x1b[36m', // Cyan
    emoji: 'ℹ️',
  },
  success: {
    level: 'success',
    prefix: '[SUCCESS]',
    color: '\x1b[32m', // Green
    emoji: '✅',
  },
  warning: {
    level: 'warning',
    prefix: '[WARN]',
    color: '\x1b[33m', // Yellow
    emoji: '⚠️',
  },
  error: {
    level: 'error',
    prefix: '[ERROR]',
    color: '\x1b[31m', // Red
    emoji: '❌',
  },
  fatal: {
    level: 'fatal',
    prefix: '[FATAL]',
    color: '\x1b[35m', // Magenta
    emoji: '💥',
  },
};

const RESET = '\x1b[0m';
const BRIGHT = '\x1b[1m';

export class Logger {
  private context: string;
  private minLevel: LogLevel;

  constructor(context: string, minLevel: LogLevel = 'debug') {
    this.context = context;
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'success', 'warning', 'error', 'fatal'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatMessage(level: LogLevel, message: string): string {
    const config = LOG_CONFIGS[level];
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    return `${config.color}${config.emoji} ${BRIGHT}${config.prefix}${RESET} ${config.color}[${timestamp}] [${this.context}]${RESET} ${message}`;
  }

  debug(message: string): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message));
    }
  }

  info(message: string): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message));
    }
  }

  success(message: string): void {
    if (this.shouldLog('success')) {
      console.log(this.formatMessage('success', message));
    }
  }

  warning(message: string): void {
    if (this.shouldLog('warning')) {
      console.warn(this.formatMessage('warning', message));
    }
  }

  error(message: string): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message));
    }
  }

  fatal(message: string, exitCode: number = 1): never {
    console.error(this.formatMessage('fatal', message));
    process.exit(exitCode);
  }

  /**
   * Create a new logger with a sub-context
   */
  child(subContext: string): Logger {
    return new Logger(`${this.context}:${subContext}`, this.minLevel);
  }

  /**
   * Log a section header for better visual separation
   */
  section(title: string): void {
    const line = '━'.repeat(50);
    console.log(`\n${BRIGHT}\x1b[34m${line}${RESET}`);
    console.log(`${BRIGHT}\x1b[34m┏━ ${title}${RESET}`);
    console.log(`${BRIGHT}\x1b[34m${line}${RESET}\n`);
  }

  /**
   * Log command execution details
   */
  command(cmd: string, args: string[]): void {
    this.info(`Executing: ${cmd} ${args.join(' ')}`);
  }
}

// Create contextual loggers
export const createLogger = (context: string): Logger => new Logger(context);

// Default logger instance
export const logger = createLogger('scripts');

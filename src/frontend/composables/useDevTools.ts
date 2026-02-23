import { useDevToolsStore } from '../stores/devTools';

/**
 * Composable for using DevTools in Vue components
 * 
 * @example
 * ```ts
 * // In a component
 * const { log, trackIpc } = useDevTools();
 * 
 * // Log something
 * log('info', 'Component mounted', { component: 'MyComponent' });
 * 
 * // Track IPC call
 * const result = await trackIpc('settings:get', { key: 'theme' }, async () => {
 *   return await window.electronAPI.getSetting('theme');
 * });
 * ```
 */
export function useDevTools() {
  const store = useDevToolsStore();

  /**
   * Add a log entry
   */
  function log(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    data?: unknown
  ) {
    store.addLog({
      level,
      source: 'frontend',
      message,
      data,
    });
  }

  /**
   * Log an info message
   */
  function info(message: string, data?: unknown) {
    log('info', message, data);
  }

  /**
   * Log a warning message
   */
  function warn(message: string, data?: unknown) {
    log('warn', message, data);
  }

  /**
   * Log an error message
   */
  function error(message: string, data?: unknown) {
    log('error', message, data);
  }

  /**
   * Log a debug message
   */
  function debug(message: string, data?: unknown) {
    log('debug', message, data);
  }

  /**
   * Track an IPC call with timing and result
   */
  async function trackIpc<T>(
    channel: string,
    payload: unknown,
    fn: () => Promise<T>
  ): Promise<T> {
    // Log send
    store.addIpcMessage({
      channel,
      direction: 'send',
      payload,
    });

    const startTime = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      // Log receive
      store.addIpcMessage({
        channel,
        direction: 'receive',
        payload: result,
        success: true,
      });

      // Log timing
      debug(`IPC "${channel}" completed in ${duration}ms`, { channel, duration, result });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error
      store.addIpcMessage({
        channel,
        direction: 'receive',
        payload: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      error(`IPC "${channel}" failed after ${duration}ms`, { channel, duration, error });

      throw error;
    }
  }

  /**
   * Track an event
   */
  function trackEvent(eventType: string, payload: unknown) {
    store.addEvent(eventType, payload);
    debug(`Event: ${eventType}`, payload);
  }

  /**
   * Track a component lifecycle event
   */
  function trackComponent(name: string, lifecycle: string, data?: unknown) {
    trackEvent('component:lifecycle', {
      component: name,
      lifecycle,
      ...data,
    });
  }

  /**
   * Track a store action
   */
  function trackStoreAction(storeName: string, action: string, payload?: unknown) {
    trackEvent('store:action', {
      store: storeName,
      action,
      payload,
    });
  }

  /**
   * Track a route change
   */
  function trackRoute(from: string, to: string) {
    trackEvent('route:change', { from, to });
  }

  /**
   * Performance timing
   */
  const performanceMarks = new Map<string, number>();

  function startTimer(name: string) {
    performanceMarks.set(name, Date.now());
  }

  function endTimer(name: string, data?: unknown) {
    const start = performanceMarks.get(name);
    if (start) {
      const duration = Date.now() - start;
      debug(`Timer "${name}" completed in ${duration}ms`, { name, duration, ...data });
      performanceMarks.delete(name);
      return duration;
    }
    return null;
  }

  return {
    // Logging
    log,
    info,
    warn,
    error,
    debug,

    // Tracking
    trackIpc,
    trackEvent,
    trackComponent,
    trackStoreAction,
    trackRoute,

    // Performance
    startTimer,
    endTimer,

    // Direct store access
    store,
  };
}

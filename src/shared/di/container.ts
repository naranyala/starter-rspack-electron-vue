import { createLogger } from '../logger';
import { InjectionScope, isToken, type Token } from './decorators';

const logger = createLogger('DI');

export interface Provider<T = unknown> {
  token: Token<T> | symbol;
  useClass?: new (...args: unknown[]) => T;
  useValue?: T;
  useFactory?: (...args: unknown[]) => T;
  deps?: (Token<unknown> | symbol)[];
  scope?: InjectionScope;
  onInit?: (instance: T) => void | Promise<void>;
  onDestroy?: (instance: T) => void | Promise<void>;
}

export class CircularDependencyError extends Error {
  constructor(tokenName: string) {
    super(`Circular dependency detected while resolving: ${tokenName}`);
    this.name = 'CircularDependencyError';
  }
}

export class Container {
  private providers: Map<symbol, Provider<unknown>> = new Map();
  private singletons: Map<symbol, unknown> = new Map();
  private resolving: Set<symbol> = new Set();
  private initialized: Set<symbol> = new Set();

  register<T>(
    token: Token<T> | symbol,
    useClass: new (...args: unknown[]) => T,
    scope?: InjectionScope
  ): this;
  register<T>(token: Token<T> | symbol, provider: Omit<Provider<T>, 'token'>): this;
  register<T>(
    token: Token<T> | symbol,
    useClassOrProvider: (new (...args: unknown[]) => T) | Omit<Provider<T>, 'token'>,
    scope: InjectionScope = InjectionScope.Singleton
  ): this {
    const key = isToken(token) ? token.token : (token as symbol);
    const tokenName = isToken(token) ? token.name : undefined;

    if (typeof useClassOrProvider === 'function') {
      this.providers.set(key, {
        token,
        useClass: useClassOrProvider,
        scope,
      } as Provider<unknown>);
    } else {
      this.providers.set(key, {
        token,
        ...useClassOrProvider,
      } as Provider<unknown>);
    }

    logger.debug('Registered provider', { token: tokenName || String(token) });
    return this;
  }

  registerInstance<T>(token: Token<T> | symbol, instance: T): this {
    const key = isToken(token) ? token.token : (token as symbol);
    this.providers.set(key, { token, useValue: instance, scope: InjectionScope.Singleton });
    logger.debug('Registered instance', { token: isToken(token) ? token.name : String(token) });
    return this;
  }

  registerFactory<T>(
    token: Token<T> | symbol,
    factory: (...args: unknown[]) => T,
    deps: (Token<unknown> | symbol)[] = []
  ): this {
    const key = isToken(token) ? token.token : (token as symbol);
    this.providers.set(key, { token, useFactory: factory, deps, scope: InjectionScope.Transient });
    logger.debug('Registered factory', { token: isToken(token) ? token.name : String(token) });
    return this;
  }

  has(token: Token<unknown> | symbol): boolean {
    const key = isToken(token) ? token.token : (token as symbol);
    return this.providers.has(key);
  }

  resolve<T>(token: Token<T> | symbol): T {
    const tokenObj = isToken(token) ? token : null;
    const key = tokenObj ? tokenObj.token : (token as symbol);
    const name = tokenObj
      ? tokenObj.name || tokenObj.token.description || 'unknown'
      : String(token);

    // Check for circular dependencies
    if (this.resolving.has(key)) {
      logger.error('Circular dependency detected', { token: name });
      throw new CircularDependencyError(name);
    }

    const provider = this.providers.get(key);

    if (!provider) {
      logger.error('No provider found', { token: name });
      throw new Error(`No provider found for ${name}`);
    }

    // Return cached value for singletons
    if (provider.scope === InjectionScope.Singleton && this.singletons.has(key)) {
      return this.singletons.get(key) as T;
    }

    // Mark as resolving
    this.resolving.add(key);

    try {
      let instance: T;

      if (provider.useValue !== undefined) {
        instance = provider.useValue as T;
      } else if (provider.useFactory) {
        const deps = (provider.deps || []).map((d) => this.resolve(d));
        instance = provider.useFactory(...deps) as T;
      } else if (provider.useClass) {
        const deps = (provider.deps || []).map((d) => this.resolve(d));
        instance = new provider.useClass(...deps) as T;
      } else {
        throw new Error(`Invalid provider for ${name}`);
      }

      // Initialize if not already done
      if (!this.initialized.has(key) && provider.onInit) {
        const initResult = provider.onInit(instance);
        if (initResult instanceof Promise) {
          logger.warn('Async onInit detected - consider using synchronous initialization');
        }
        this.initialized.add(key);
      }

      // Cache singleton instances
      if (provider.scope === InjectionScope.Singleton) {
        this.singletons.set(key, instance);
      }

      logger.debug('Resolved token', { token: name, scope: provider.scope });
      return instance;
    } finally {
      this.resolving.delete(key);
    }
  }

  resolveOptional<T>(token: Token<T> | symbol, defaultValue?: T): T | undefined {
    try {
      return this.resolve(token);
    } catch (error) {
      if (error instanceof Error && error.message.includes('No provider found')) {
        return defaultValue;
      }
      throw error;
    }
  }

  /**
   * Dispose all singleton instances and call onDestroy hooks
   */
  async dispose(): Promise<void> {
    logger.info('Disposing container');

    for (const [key, provider] of this.providers.entries()) {
      if (provider.scope === InjectionScope.Singleton && this.singletons.has(key)) {
        const instance = this.singletons.get(key);

        if (provider.onDestroy && instance) {
          try {
            const result = provider.onDestroy(instance);
            if (result instanceof Promise) {
              await result;
            }
          } catch (error) {
            logger.error('Error in onDestroy hook', { error });
          }
        }

        this.singletons.delete(key);
      }
    }

    this.initialized.clear();
    this.resolving.clear();
  }

  clear(): void {
    logger.debug('Clearing container');
    this.providers.clear();
    this.singletons.clear();
    this.resolving.clear();
    this.initialized.clear();
  }
}

export const rootContainer = new Container();

export function createContainer(): Container {
  return new Container();
}

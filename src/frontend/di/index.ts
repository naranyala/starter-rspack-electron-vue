import { isRef, ref } from 'vue';
import { Container, createToken, InjectionScope, isToken, type Token } from '../../shared/di';

export * from '../../shared/di';

export const frontendContainer = new Container();

export function provide<T>(token: Token<T> | symbol, value: T): void {
  frontendContainer.registerInstance(token, value);
}

export function inject<T>(token: Token<T> | symbol, defaultValue?: T): T {
  if (frontendContainer.has(token)) {
    return frontendContainer.resolve(token);
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  const name = isToken(token) ? token.name || token.token.description : String(token);
  throw new Error(`No provider found for ${name}`);
}

export function injectRef<T>(token: Token<T> | symbol, defaultValue?: T) {
  if (frontendContainer.has(token)) {
    const value = frontendContainer.resolve(token);
    return isRef(value) ? value : ref(value);
  }
  if (defaultValue !== undefined) {
    return ref(defaultValue);
  }
  const name = isToken(token) ? token.name || token.token.description : String(token);
  throw new Error(`No provider found for ${name}`);
}

export function injectOptional<T>(token: Token<T> | symbol): T | undefined {
  return frontendContainer.resolveOptional(token, undefined);
}

export function registerService<T>(
  token: Token<T> | symbol,
  factory: (...args: unknown[]) => T,
  deps: (Token<unknown> | symbol)[] = []
): void {
  frontendContainer.registerFactory(token, factory, deps);
}

export function registerClass<T>(
  token: Token<T> | symbol,
  Ctor: new (...args: unknown[]) => T,
  scope: InjectionScope = InjectionScope.Singleton
): void {
  frontendContainer.register(token, Ctor, scope);
}

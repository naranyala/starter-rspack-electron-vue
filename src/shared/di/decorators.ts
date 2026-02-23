export enum InjectionScope {
  Singleton = 'singleton',
  Transient = 'transient',
}

export interface Token<T = unknown> {
  token: symbol;
  name?: string;
}

export function createToken<T = unknown>(name: string): Token<T> {
  return {
    token: Symbol(`TOKEN_${name}`),
    name,
  };
}

export function isToken(value: unknown): value is Token {
  return typeof value === 'object' && value !== null && 'token' in value;
}

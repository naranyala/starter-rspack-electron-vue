import { describe, it, expect } from 'bun:test';
import { Container } from '../../../../src/shared/di/container';
import { createToken, InjectionScope } from '../../../../src/shared/di/decorators';

describe('Container', () => {
  it('should register and resolve a simple class', () => {
    const container = new Container();
    const TOKEN = createToken<string>('TestToken');

    class TestService {
      getValue(): string {
        return 'test';
      }
    }

    container.register(TOKEN, TestService, InjectionScope.Singleton);
    const instance = container.resolve(TOKEN);

    expect(instance).toBeInstanceOf(TestService);
    expect(instance.getValue()).toBe('test');
  });

  it('should return the same instance for singleton scope', () => {
    const container = new Container();
    const TOKEN = createToken<string>('TestToken');

    class TestService {}

    container.register(TOKEN, TestService, InjectionScope.Singleton);
    const instance1 = container.resolve(TOKEN);
    const instance2 = container.resolve(TOKEN);

    expect(instance1).toBe(instance2);
  });

  it('should return different instances for transient scope', () => {
    const container = new Container();
    const TOKEN = createToken<string>('TestToken');

    class TestService {}

    container.register(TOKEN, TestService, InjectionScope.Transient);
    const instance1 = container.resolve(TOKEN);
    const instance2 = container.resolve(TOKEN);

    expect(instance1).not.toBe(instance2);
  });

  it('should throw on circular dependency', () => {
    const container = new Container();
    const TOKEN_A = createToken<string>('TokenA');
    const TOKEN_B = createToken<string>('TokenB');

    class ServiceA {
      constructor(public serviceB: unknown) {}
    }

    class ServiceB {
      constructor(public serviceA: unknown) {}
    }

    container.registerFactory(TOKEN_A, (serviceB) => new ServiceA(serviceB), [TOKEN_B]);
    container.registerFactory(TOKEN_B, (serviceA) => new ServiceB(serviceA), [TOKEN_A]);

    expect(() => container.resolve(TOKEN_A)).toThrow('Circular dependency detected');
  });

  it('should resolve optional tokens with default value', () => {
    const container = new Container();
    const TOKEN = createToken<string>('NonExistent');

    const result = container.resolveOptional(TOKEN, 'default');

    expect(result).toBe('default');
  });

  it('should register and resolve instances', () => {
    const container = new Container();
    const TOKEN = createToken<string>('InstanceToken');
    const instance = { value: 'test' };

    container.registerInstance(TOKEN, instance);
    const resolved = container.resolve(TOKEN);

    expect(resolved).toBe(instance);
  });

  it('should register and resolve factories', () => {
    const container = new Container();
    const TOKEN = createToken<number>('FactoryToken');

    container.registerFactory(TOKEN, () => 42);
    const result = container.resolve(TOKEN);

    expect(result).toBe(42);
  });
});

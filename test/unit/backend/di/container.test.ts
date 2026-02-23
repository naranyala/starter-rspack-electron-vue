import { beforeEach, describe, expect, it } from 'bun:test';
import { Container } from '../../../../src/shared/di/container';
import { createToken, InjectionScope } from '../../../../src/shared/di/decorators';

describe('DI Container', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  class TestService {
    constructor(public name = 'test') {}
  }

  class DependencyService {
    getValue() {
      return 'dependency';
    }
  }

  class ServiceWithDeps {
    constructor(public dep: DependencyService) {}
  }

  it('should register and resolve a simple service', () => {
    const TOKEN = createToken<TestService>('TestService');
    container.register(TOKEN, TestService, InjectionScope.Singleton);

    const service = container.resolve(TOKEN);

    expect(service).toBeInstanceOf(TestService);
    expect(service.name).toBe('test');
  });

  it('should return same instance for singleton scope', () => {
    const TOKEN = createToken<TestService>('TestService');
    container.register(TOKEN, TestService, InjectionScope.Singleton);

    const instance1 = container.resolve(TOKEN);
    const instance2 = container.resolve(TOKEN);

    expect(instance1).toBe(instance2);
  });

  it('should return different instances for transient scope', () => {
    const TOKEN = createToken<TestService>('TestService');
    container.register(TOKEN, TestService, InjectionScope.Transient);

    const instance1 = container.resolve(TOKEN);
    const instance2 = container.resolve(TOKEN);

    expect(instance1).not.toBe(instance2);
  });

  it('should resolve dependencies automatically', () => {
    const DEP_TOKEN = createToken<DependencyService>('DependencyService');
    const SERVICE_TOKEN = createToken<ServiceWithDeps>('ServiceWithDeps');

    container.register(DEP_TOKEN, DependencyService);
    container.register(SERVICE_TOKEN, {
      useClass: ServiceWithDeps,
      deps: [DEP_TOKEN],
    });

    const service = container.resolve(SERVICE_TOKEN);

    expect(service).toBeInstanceOf(ServiceWithDeps);
    expect(service.dep).toBeDefined();
    expect(service.dep.getValue()).toBe('dependency');
  });

  it('should throw error for missing provider', () => {
    const TOKEN = createToken<TestService>('MissingService');

    expect(() => container.resolve(TOKEN)).toThrow('No provider found');
  });

  it('should resolve optional token with default value', () => {
    const TOKEN = createToken<TestService>('OptionalService');
    const defaultValue = new TestService('default');

    const result = container.resolveOptional(TOKEN, defaultValue);

    expect(result).toBe(defaultValue);
  });

  it('should check if token is registered', () => {
    const TOKEN = createToken<TestService>('TestService');
    container.register(TOKEN, TestService);

    expect(container.has(TOKEN)).toBe(true);
    expect(container.has(createToken('OtherService'))).toBe(false);
  });

  it('should register instance', () => {
    const TOKEN = createToken<TestService>('TestService');
    const instance = new TestService('instance');

    container.registerInstance(TOKEN, instance);
    const resolved = container.resolve(TOKEN);

    expect(resolved).toBe(instance);
  });

  it('should register factory', () => {
    const TOKEN = createToken<string>('FactoryService');

    container.registerFactory(TOKEN, () => 'factory-result', []);
    const result = container.resolve(TOKEN);

    expect(result).toBe('factory-result');
  });

  it('should detect circular dependencies', () => {
    const TOKEN_A = createToken<any>('ServiceA');
    const TOKEN_B = createToken<any>('ServiceB');

    class ServiceA {
      constructor(public b: any) {}
    }
    class ServiceB {
      constructor(public a: any) {}
    }

    container.register(TOKEN_A, {
      useClass: ServiceA,
      deps: [TOKEN_B],
    });
    container.register(TOKEN_B, {
      useClass: ServiceB,
      deps: [TOKEN_A],
    });

    expect(() => container.resolve(TOKEN_A)).toThrow('Circular dependency detected');
  });

  it('should call onInit hook', () => {
    const TOKEN = createToken<TestService>('TestService');
    let initialized = false;

    container.register(TOKEN, {
      useClass: TestService,
      onInit: (instance) => {
        initialized = true;
        expect(instance).toBeInstanceOf(TestService);
      },
    });

    container.resolve(TOKEN);
    expect(initialized).toBe(true);
  });

  it('should clear all registrations', () => {
    const TOKEN = createToken<TestService>('TestService');
    container.register(TOKEN, TestService);

    container.clear();

    expect(container.has(TOKEN)).toBe(false);
  });
});

import { ipcMain } from 'electron';
import { Container, createToken, InjectionScope, isToken, type Token } from '../../shared/di';
import { WindowManager, SettingsManager } from '../services';
import {
  AppHandlers,
  SettingsHandlers,
  WindowHandlers,
  DialogHandlers,
  getGlobalIpcRegistry,
} from '../ipc';
import {
  ElectronIntroUseCase,
  ElectronArchitectureUseCase,
  ElectronSecurityUseCase,
  ElectronPackagingUseCase,
  ElectronNativeAPIsUseCase,
  ElectronPerformanceUseCase,
  ElectronDevelopmentUseCase,
  ElectronVersionsUseCase,
} from '../use-cases';

export * from '../../shared/di';

// Service tokens
export const WINDOW_MANAGER_TOKEN = createToken<WindowManager>('WindowManager');
export const SETTINGS_MANAGER_TOKEN = createToken<SettingsManager>('SettingsManager');

// Use case tokens
export const USE_CASES_TOKEN = {
  INTRO: createToken('ElectronIntroUseCase'),
  ARCHITECTURE: createToken('ElectronArchitectureUseCase'),
  SECURITY: createToken('ElectronSecurityUseCase'),
  PACKAGING: createToken('ElectronPackagingUseCase'),
  NATIVE_APIS: createToken('ElectronNativeAPIsUseCase'),
  PERFORMANCE: createToken('ElectronPerformanceUseCase'),
  DEVELOPMENT: createToken('ElectronDevelopmentUseCase'),
  VERSIONS: createToken('ElectronVersionsUseCase'),
};

// IPC Handler tokens
export const IPC_HANDLER_TOKENS = {
  APP: createToken('AppHandlers'),
  SETTINGS: createToken('SettingsHandlers'),
  WINDOW: createToken('WindowHandlers'),
  DIALOG: createToken('DialogHandlers'),
};

export const backendContainer = new Container();

/**
 * Initialize the backend dependency injection container
 * Registers all services, handlers, and use cases
 */
export function initializeBackendContainer(): void {
  // Register services
  backendContainer.register(WINDOW_MANAGER_TOKEN, WindowManager, InjectionScope.Singleton);
  backendContainer.register(SETTINGS_MANAGER_TOKEN, SettingsManager, InjectionScope.Singleton);

  // Register IPC handlers
  backendContainer.registerFactory(
    IPC_HANDLER_TOKENS.APP,
    () => getAppHandlers(),
    []
  );

  backendContainer.registerFactory(
    IPC_HANDLER_TOKENS.SETTINGS,
    () => createSettingsHandlers(backendContainer.resolve(SETTINGS_MANAGER_TOKEN)),
    [SETTINGS_MANAGER_TOKEN]
  );

  backendContainer.registerFactory(
    IPC_HANDLER_TOKENS.WINDOW,
    () => getWindowHandlers(),
    []
  );

  backendContainer.registerFactory(
    IPC_HANDLER_TOKENS.DIALOG,
    () => createDialogHandlers(backendContainer.resolve(WINDOW_MANAGER_TOKEN)),
    [WINDOW_MANAGER_TOKEN]
  );

  // Register use cases
  const useCaseClasses = [
    { token: USE_CASES_TOKEN.INTRO, cls: ElectronIntroUseCase },
    { token: USE_CASES_TOKEN.ARCHITECTURE, cls: ElectronArchitectureUseCase },
    { token: USE_CASES_TOKEN.SECURITY, cls: ElectronSecurityUseCase },
    { token: USE_CASES_TOKEN.PACKAGING, cls: ElectronPackagingUseCase },
    { token: USE_CASES_TOKEN.NATIVE_APIS, cls: ElectronNativeAPIsUseCase },
    { token: USE_CASES_TOKEN.PERFORMANCE, cls: ElectronPerformanceUseCase },
    { token: USE_CASES_TOKEN.DEVELOPMENT, cls: ElectronDevelopmentUseCase },
    { token: USE_CASES_TOKEN.VERSIONS, cls: ElectronVersionsUseCase },
  ];

  useCaseClasses.forEach(({ token, cls }) => {
    backendContainer.registerFactory(token, () => new cls(ipcMain), []);
  });
}

/**
 * Register all IPC handlers with the registry
 */
export function registerAllIpcHandlers(): void {
  const registry = getGlobalIpcRegistry();

  // Register core IPC handlers
  registry.register(getAppHandlers());
  registry.register(getWindowHandlers());
  registry.register(createSettingsHandlers(backendContainer.resolve(SETTINGS_MANAGER_TOKEN)));
  registry.register(createDialogHandlers(backendContainer.resolve(WINDOW_MANAGER_TOKEN)));

  // Register use case handlers
  const useCases = [
    backendContainer.resolve(USE_CASES_TOKEN.INTRO),
    backendContainer.resolve(USE_CASES_TOKEN.ARCHITECTURE),
    backendContainer.resolve(USE_CASES_TOKEN.SECURITY),
    backendContainer.resolve(USE_CASES_TOKEN.PACKAGING),
    backendContainer.resolve(USE_CASES_TOKEN.NATIVE_APIS),
    backendContainer.resolve(USE_CASES_TOKEN.PERFORMANCE),
    backendContainer.resolve(USE_CASES_TOKEN.DEVELOPMENT),
    backendContainer.resolve(USE_CASES_TOKEN.VERSIONS),
  ];

  useCases.forEach((useCase) => {
    useCase.registerHandlers();
  });

  registry.registerAll();
}

export function provide<T>(token: Token<T> | symbol, value: T): void {
  backendContainer.registerInstance(token, value);
}

export function inject<T>(token: Token<T> | symbol, defaultValue?: T): T {
  if (backendContainer.has(token)) {
    return backendContainer.resolve(token);
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  const name = isToken(token) ? token.name || token.token.description : String(token);
  throw new Error(`No provider found for ${name}`);
}

export function injectOptional<T>(token: Token<T> | symbol): T | undefined {
  return backendContainer.resolveOptional(token, undefined);
}

export function registerService<T>(
  token: Token<T> | symbol,
  factory: (...args: unknown[]) => T,
  deps: (Token<unknown> | symbol)[] = []
): void {
  backendContainer.registerFactory(token, factory, deps);
}

export function registerClass<T>(
  token: Token<T> | symbol,
  Ctor: new (...args: unknown[]) => T,
  scope: InjectionScope = InjectionScope.Singleton
): void {
  backendContainer.register(token, Ctor, scope);
}

export function registerSingleton<T>(
  token: Token<T> | symbol,
  Ctor: new (...args: unknown[]) => T
): void {
  backendContainer.register(token, Ctor, InjectionScope.Singleton);
}

// Helper imports for factory functions
function getAppHandlers() {
  const { getAppHandlers } = require('../ipc/app-handlers');
  return getAppHandlers();
}

function createSettingsHandlers(settingsManager: SettingsManager) {
  const { createSettingsHandlers } = require('../ipc/settings-handlers');
  return createSettingsHandlers(settingsManager);
}

function getWindowHandlers() {
  const { getWindowHandlers } = require('../ipc/window-handlers');
  return getWindowHandlers();
}

function createDialogHandlers(windowManager: WindowManager) {
  const { createDialogHandlers } = require('../ipc/dialog-handlers');
  return createDialogHandlers(windowManager);
}

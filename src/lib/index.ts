// Export shared utilities
export * from './shared';

// Export backend and frontend utilities separately to avoid naming conflicts
export * as BackendUtils from './backend';
export * as FrontendUtils from './frontend';

// Export specific utilities individually to avoid naming conflicts
export {
  // Backend specific
  WindowManager,
  IPCChannel,
  IPCRouter,
  AppLifecycle,
  SettingsManager,
  DataStore,
  MenuBuilder,
  ProtocolHandler,
  PowerMonitor,
  TrayManager,
  NotificationManager,
  CryptoUtils,
  ObjectUtils as BackendObjectUtils,
  ArrayUtils,
  StringUtils,
  FileSystemUtils,
  JsonUtils as BackendJsonUtils,
  LogUtils as BackendLogUtils,
  PathUtils as BackendPathUtils,
  TypeUtils as BackendTypeUtils,
  ValidationUtils as BackendValidationUtils,
} from './backend';

export {
  // Frontend specific
  HttpClient,
  StorageUtils,
  SessionStorageUtils,
  ElectronAPI,
  DOMUtils,
  AnimationUtils,
  EventEmitter,
  EventBus,
  KeyboardUtils,
  MathUtils,
  ColorUtils,
  DateUtils,
  NumberUtils,
  ObjectUtils as FrontendObjectUtils,
} from './frontend';

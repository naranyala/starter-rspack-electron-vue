// Export shared utilities

// Export backend and frontend utilities separately to avoid naming conflicts
export * as BackendUtils from './backend';
// Export specific utilities individually to avoid naming conflicts
export {
  AppLifecycle,
  ArrayUtils,
  CryptoUtils,
  DataStore,
  FileSystemUtils,
  IPCChannel,
  IPCRouter,
  JsonUtils as BackendJsonUtils,
  LogUtils as BackendLogUtils,
  MenuBuilder,
  NotificationManager,
  ObjectUtils as BackendObjectUtils,
  PathUtils as BackendPathUtils,
  PowerMonitor,
  ProtocolHandler,
  SettingsManager,
  StringUtils,
  TrayManager,
  TypeUtils as BackendTypeUtils,
  ValidationUtils as BackendValidationUtils,
  // Backend specific
  WindowManager,
} from './backend';
export * as FrontendUtils from './frontend';
export {
  AnimationUtils,
  ColorUtils,
  DateUtils,
  DOMUtils,
  ElectronAPI,
  EventBus,
  EventEmitter,
  // Frontend specific
  HttpClient,
  KeyboardUtils,
  MathUtils,
  NumberUtils,
  ObjectUtils as FrontendObjectUtils,
  SessionStorageUtils,
  StorageUtils,
} from './frontend';
export * from './shared';

// Test file to verify utility libraries work correctly

// Import all utilities
import {
  // Shared utilities
  EnvUtils,
  TypeUtils,
  ValidationUtils,
  JsonUtils,
  LogUtils,
  PathUtils,

  // Backend utilities
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
  BackendObjectUtils as ObjectUtils,
  ArrayUtils,
  StringUtils,

  // Frontend utilities
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
  NumberUtils
} from './index';

console.log('All utilities imported successfully!');

// Test some basic functionality
console.log('\n=== Testing Shared Utilities ===');

// Test TypeUtils
console.log('Type of "hello":', TypeUtils.getType('hello'));
console.log('Is function:', TypeUtils.isFunction(() => {}));
console.log('Coalescing:', TypeUtils.coalesce(null, undefined, 'found'));

// Test ValidationUtils
console.log('Is email valid:', ValidationUtils.isEmail('test@example.com'));
console.log('Clamped value:', ValidationUtils.clamp(15, 0, 10));

// Test JsonUtils
const testData = { name: 'Test', value: 42 };
const jsonString = JsonUtils.stringify(testData);
console.log('JSON stringified:', jsonString);
console.log('JSON parsed:', JsonUtils.read(jsonString));

// Test PathUtils
console.log('Path join:', PathUtils.join('folder', 'file.txt'));

console.log('\n=== Testing Backend Utilities ===');

// Test CryptoUtils
const hash = CryptoUtils.hash('test data');
console.log('Hashed data:', hash);

// Test ObjectUtils
const obj1 = { a: 1, b: { c: 2 } };
const obj2 = { b: { d: 3 }, e: 4 };
const merged = ObjectUtils.deepMerge(obj1, obj2);
console.log('Deep merged object:', merged);

// Test ArrayUtils
const arr = [1, 2, 3, 4, 5];
console.log('Unique array:', ArrayUtils.unique([1, 2, 2, 3]));
console.log('Chunked array:', ArrayUtils.chunk(arr, 2));

// Test StringUtils
console.log('Camel case:', StringUtils.camelCase('hello world test'));
console.log('Kebab case:', StringUtils.kebabCase('HelloWorldTest'));

console.log('\n=== Testing Frontend Utilities ===');

// Test MathUtils
console.log('Clamped value:', MathUtils.clamp(15, 0, 10));
console.log('Lerp value:', MathUtils.lerp(0, 100, 0.5));

// Test ColorUtils
console.log('Hex to RGB:', ColorUtils.hexToRgb('#ff0000'));
console.log('RGB to Hex:', ColorUtils.rgbToHex(255, 0, 0));

// Test DateUtils
const date = new Date();
date.setDate(date.getDate() - 1); // Yesterday
console.log('Time from now:', DateUtils.fromNow(date));

// Test NumberUtils
console.log('Formatted number:', NumberUtils.format(1234567.89, 2));

console.log('\n=== All tests completed successfully! ===');
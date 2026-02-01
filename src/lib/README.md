# Utility Libraries

This project contains three sets of utility libraries organized by environment:

## Backend Utilities (`src/lib/backend`)

Backend utilities are designed for Node.js/Electron environments and include:

### Electron Utilities
- `WindowManager`: Manage Electron browser windows
- `IPCChannel` and `IPCRouter`: Handle inter-process communication
- `AppLifecycle`: Manage Electron app lifecycle events
- `SettingsManager`: Store and retrieve application settings
- `DataStore`: Simple key-value storage
- `MenuBuilder`: Build and manage Electron menus
- `ProtocolHandler`: Handle custom protocols
- `PowerMonitor`: Monitor system power events
- `TrayManager`: Manage system tray icon
- `NotificationManager`: Show notifications

### Common Backend Utilities
- `CryptoUtils`: Encryption, hashing, and secure operations
- `ObjectUtils`: Deep cloning, merging, flattening objects
- `ArrayUtils`: Array manipulation methods
- `StringUtils`: String manipulation methods

### Environment-Specific Utilities
- `EnvUtils`: Environment variable management
- `FileSystemUtils`: File system operations
- `JsonUtils`: JSON parsing and serialization
- `LogUtils`: Colored logging
- `PathUtils`: Path manipulation
- `ValidationUtils`: Input validation
- `TypeUtils`: Type checking and conversion

## Frontend Utilities (`src/lib/frontend`)

Frontend utilities are designed for browser environments and include:

### API Utilities
- `HttpClient`: HTTP client with interceptors
- `StorageUtils`: Local storage management
- `SessionStorageUtils`: Session storage management
- `ElectronAPI`: Electron API abstraction

### DOM Utilities
- `DOMUtils`: DOM manipulation methods
- `AnimationUtils`: CSS animations

### Event Utilities
- `EventEmitter`: Event emission and handling
- `KeyboardUtils`: Keyboard shortcut detection

### Async Utilities
- `debounce`, `throttle`, `once`, `memoize`: Function decorators
- `sleep`, `retry`: Async helpers

### General Utilities
- `MathUtils`: Mathematical operations
- `ColorUtils`: Color conversions and manipulations
- `DateUtils`: Date formatting and manipulation
- `NumberUtils`: Number formatting and operations
- `ObjectUtils`: Object manipulation methods

## Shared Utilities (`src/lib/shared`)

Shared utilities work in both environments and include:

- `EnvUtils`: Environment variable management (browser-compatible)
- `TypeUtils`: Type checking and conversion
- `ValidationUtils`: Input validation
- `JsonUtils`: JSON operations
- `LogUtils`: Logging (browser-compatible)
- `PathUtils`: Path manipulation (browser-compatible)

## Usage

Import utilities from the main lib entry point:

```typescript
import { HttpClient, DOMUtils, FileSystemUtils, ValidationUtils } from '@/lib';
```

Or import specific utilities:

```typescript
import { HttpClient } from '@/lib/frontend';
import { FileSystemUtils } from '@/lib/backend';
import { ValidationUtils } from '@/lib/shared';
```
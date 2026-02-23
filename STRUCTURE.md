# Project Structure Documentation

## 📁 Directory Structure

This Electron + Vue + Rspack project follows a modular architecture with clear separation between backend (main process), frontend (renderer process), and shared utilities.

```
project-root/
├── src/
│   ├── backend/                    # Electron Main Process (Backend)
│   │   ├── config/                 # Configuration files
│   │   ├── di/                     # Dependency Injection setup
│   │   │   ├── container.ts        # DI container with circular dependency detection
│   │   │   ├── decorators.ts       # DI decorators and tokens
│   │   │   └── index.ts            # DI exports and helper functions
│   │   ├── ipc/                    # IPC handlers
│   │   │   ├── base-ipc-handler.ts # Base class for IPC handlers
│   │   │   ├── app-handlers.ts     # App lifecycle IPC handlers
│   │   │   ├── settings-handlers.ts# Settings IPC handlers
│   │   │   ├── window-handlers.ts  # Window management IPC handlers
│   │   │   ├── dialog-handlers.ts  # Dialog IPC handlers
│   │   │   ├── ipc-registry.ts     # IPC handler registry
│   │   │   └── index.ts            # IPC module exports
│   │   ├── services/               # Backend services
│   │   │   ├── window-manager.ts   # Window management service
│   │   │   ├── database.ts         # Data store and settings manager
│   │   │   └── index.ts            # Services exports
│   │   ├── use-cases/              # Business logic use cases
│   │   │   ├── base-use-case.ts    # Base use case class
│   │   │   └── *.ts                # Specific use cases
│   │   ├── lib/                    # Backend utilities
│   │   │   ├── utils/              # Utility functions
│   │   │   ├── utils-enhanced/     # Enhanced utilities
│   │   │   ├── electron.ts         # Electron-specific utilities
│   │   │   └── index.ts            # Lib exports
│   │   ├── main.ts                 # Main process entry point
│   │   └── preload.ts              # Preload script (IPC bridge)
│   │
│   ├── frontend/                   # Renderer Process (Frontend)
│   │   ├── components/             # Vue components
│   │   │   ├── base/               # Reusable base components
│   │   │   ├── layout/             # Layout components
│   │   │   ├── feature/            # Feature-specific components
│   │   │   └── App.vue             # Root component
│   │   ├── views/                  # Page/view components
│   │   │   └── HomeView.vue        # Home page (main dashboard)
│   │   ├── stores/                 # Pinia state management
│   │   │   ├── app.ts              # App UI state store
│   │   │   ├── settings.ts         # Settings store
│   │   │   ├── plugins/            # Pinia plugins
│   │   │   └── index.ts            # Stores exports
│   │   ├── composables/            # Vue 3 composables
│   │   │   ├── useElectron.ts      # Electron API composables
│   │   │   ├── useEventBus.ts      # Event bus composables
│   │   │   └── index.ts            # Composables exports
│   │   ├── services/               # Frontend services
│   │   │   ├── electron-api.ts     # Typed Electron API service
│   │   │   ├── window-factory.ts   # WinBox window creation factory
│   │   │   └── index.ts            # Services exports
│   │   ├── events/                 # Frontend event bus
│   │   │   ├── frontend-event-bus.ts # Frontend event bus implementation
│   │   │   ├── useEventBus.ts      # Vue composables for events
│   │   │   └── index.ts            # Events exports
│   │   ├── lib/                    # Frontend utilities
│   │   │   ├── utils/              # Utility functions
│   │   │   ├── utils-enhanced/     # Enhanced utilities
│   │   │   ├── api.ts              # HTTP client utilities
│   │   │   ├── dom.ts              # DOM manipulation utilities
│   │   │   ├── events.ts           # Event system utilities
│   │   │   ├── async.ts            # Async utilities
│   │   │   └── index.ts            # Lib exports
│   │   ├── styles/                 # CSS/SCSS files
│   │   │   ├── global.css          # Global styles
│   │   │   └── App.css             # App-specific styles
│   │   └── main.ts                 # Renderer entry point
│   │
│   ├── shared/                     # Shared code (backend + frontend)
│   │   ├── config/                 # Shared configuration
│   │   ├── constants/              # Shared constants
│   │   ├── di/                     # Shared DI base
│   │   │   ├── container.ts        # DI container implementation
│   │   │   ├── decorators.ts       # DI decorators
│   │   │   └── index.ts            # DI exports
│   │   ├── errors/                 # Error handling
│   │   │   ├── app-error.ts        # Base error classes
│   │   │   ├── error-handler.ts    # Global error handler
│   │   │   └── index.ts            # Error exports
│   │   ├── logger/                 # Logging abstraction
│   │   │   ├── logger.ts           # Logger implementation
│   │   │   └── index.ts            # Logger exports
│   │   ├── validation/             # Validation utilities
│   │   │   ├── zod.ts              # Zod validation schemas
│   │   │   └── index.ts            # Validation exports
│   │   ├── types/                  # Shared TypeScript types
│   │   ├── utils/                  # Shared utilities
│   │   ├── constants.ts            # Common constants
│   │   └── utils.ts                # Common utilities
│   │
│   ├── assets/                     # Static assets
│   │   └── icons/                  # Application icons
│   ├── index.html                  # HTML template
│   ├── reset.css                   # CSS reset
│   └── index.css                   # Global styles
│
├── test/
│   ├── unit/                       # Unit tests
│   │   ├── backend/                # Backend unit tests
│   │   ├── frontend/               # Frontend unit tests
│   │   └── shared/                 # Shared code unit tests
│   │       ├── di/                 # DI tests
│   │       ├── errors.test.ts      # Error handling tests
│   │       ├── logger.test.ts      # Logger tests
│   │       └── validation.test.ts  # Validation tests
│   ├── integration/                # Integration tests
│   │   └── backend/                # Backend integration tests
│   └── security/                   # Security tests
│
├── types/                          # TypeScript type definitions
│   └── electron-api.d.ts           # Electron API type definitions
│
├── scripts/                        # Build and development scripts
│   ├── utils/                      # Script utilities
│   ├── build.ts                    # Build script
│   ├── clean.ts                    # Clean script
│   ├── dev.ts                      # Development server script
│   ├── setup.ts                    # Setup script
│   └── icons.ts                    # Icon generation script
│
├── docs/                           # Documentation
├── dist/                           # Build output (generated)
├── node_modules/                   # Dependencies (generated)
│
├── .env.development                # Development environment variables
├── .env.production                 # Production environment variables
├── .env.example                    # Environment variables template
├── package.json                    # Project dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── rspack.config.ts                # Rspack build configuration
├── biome.json                      # Biome linting/formatting config
└── STRUCTURE.md                    # This file
```

---

## 🔧 Backend (Main Process) - `src/backend/`

### Architecture

The backend follows a layered architecture:

```
Entry Point (main.ts)
    ↓
DI Container (di/)
    ↓
Services (services/) → Use Cases (use-cases/)
    ↓
IPC Handlers (ipc/) ←→ Preload Script (preload.ts)
```

### Dependency Injection

The project uses a custom DI container with:
- **Singleton/Transient scopes**
- **Circular dependency detection**
- **Lifecycle hooks** (onInit, onDestroy)
- **Token-based resolution**

```typescript
// Register services
container.register(WINDOW_MANAGER_TOKEN, WindowManager, InjectionScope.Singleton);

// Resolve services
const windowManager = inject(WINDOW_MANAGER_TOKEN);
```

### IPC Handlers

All IPC communication follows a standardized pattern:

```typescript
// Base class for all handlers
abstract class BaseIpcHandler {
  protected abstract get channelPrefix(): string;
  protected registerHandler(channel: string, handler: Function): void;
  registerHandlers(): void;
  unregisterHandlers(): void;
}

// Example implementation
export class WindowHandlers extends BaseIpcHandler {
  protected get channelPrefix(): string { return 'window'; }
  
  registerHandlers(): void {
    this.registerHandler('minimize', this.handleMinimize);
    this.registerHandler('maximize', this.handleMaximize);
  }
}
```

### Available IPC Channels

| Channel | Description |
|---------|-------------|
| `app:getVersion` | Get application version |
| `app:getName` | Get application name |
| `settings:get` | Get specific setting |
| `settings:set` | Set specific setting |
| `settings:getAll` | Get all settings |
| `dialog:showMessageBox` | Show dialog box |
| `window:minimize` | Minimize window |
| `window:maximize` | Maximize/unmaximize window |
| `window:close` | Close window |

---

## 🎨 Frontend (Renderer Process) - `src/frontend/`

### Architecture

This project uses **WinBox.js** as a router-like solution for window management instead of traditional Vue Router. Each "view" is displayed in a WinBox window, providing a native desktop experience.

```
Entry Point (main.ts)
    ↓
Vue App + Pinia + Event Bus
    ↓
HomeView (Dashboard) → WinBox Windows (Feature Views)
    ↓
Components → Composables → Services
                      ↓
                Electron API
                      ↓
                WinBox.js (Window Management)
```

### WinBox as Router

WinBox.js provides window-based navigation instead of URL-based routing:

```typescript
// src/frontend/services/window-factory.ts
export class WindowFactory {
  static createWindow(title: string, options: WindowOptions = {}) {
    const winbox = new WinBox({
      title,
      width: '550px',
      height: '450px',
      x: 'center',
      y: 'center',
      ...options,
    });
    
    // Emit event for cross-window communication
    eventBus.emit('window:created', { windowId: winbox.id, title });
    
    return winbox;
  }
}
```

**Benefits of WinBox over Vue Router:**
- Native desktop window management
- Multiple independent views simultaneously
- Draggable, resizable, minimizable windows
- True multi-tasking experience
- No URL/hash management needed

### State Management (Pinia)

Stores are organized by feature:

```typescript
// stores/app.ts
export const useAppStore = defineStore('app', () => {
  // State
  const sidebarVisible = ref(false);
  
  // Getters
  const hasOpenWindows = computed(() => openWindows.value.length > 0);
  
  // Actions
  function toggleSidebar() { ... }
  
  return { sidebarVisible, hasOpenWindows, toggleSidebar };
});
```

### Composables

Reusable logic is encapsulated in composables:

```typescript
// composables/useElectron.ts
export function useElectronApp() {
  const api = getElectronApiService();
  const version = ref('');
  
  onMounted(() => {
    version.value = await api.getVersion();
  });
  
  return { version };
}
```

### Services

Frontend services provide typed abstractions:

```typescript
// services/electron-api.ts
export class ElectronApiService implements ElectronAPI {
  async getVersion(): Promise<string> {
    return window.electronAPI.getVersion();
  }
}
```

---

## 🔄 Communication Flow

```
┌─────────────────┐
│  Vue Component  │
└────────┬────────┘
         │ uses
         ↓
┌─────────────────┐
│   Composable    │
└────────┬────────┘
         │ uses
         ↓
┌─────────────────┐
│  ElectronApi    │
│    Service      │
└────────┬────────┘
         │ calls
         ↓
┌─────────────────┐
│ window.electronAPI │ (contextBridge)
└────────┬────────┘
         │ IPC
         ↓
┌─────────────────┐
│  preload.ts     │
└────────┬────────┘
         │ ipcRenderer.invoke
         ↓
┌─────────────────┐
│  IPC Handler    │
└────────┬────────┘
         │ uses
         ↓
┌─────────────────┐
│   Service       │
└─────────────────┘
```

---

## 📦 Shared Modules

### Error Handling (`src/shared/errors/`)

Hierarchical error system:

```
AppError (base)
├── IpcError
├── ValidationError
├── ConfigError
├── FileSystemError
├── WindowError
└── SettingsError
```

Usage:
```typescript
try {
  // operation
} catch (error) {
  getGlobalErrorHandler().handle(error);
}
```

### Logger (`src/shared/logger/`)

Consistent logging across the app:

```typescript
const logger = createLogger('MyService', { level: 'info' });
logger.info('Operation started', { data });
logger.error('Operation failed', error);
```

### Validation (`src/shared/validation/`)

Zod-based validation:

```typescript
import { z, validate, schemas } from '@/shared/validation';

const schema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
});

const result = validate(schema, data);
```

---

## 🧪 Testing

### Test Structure

```
test/
├── unit/           # Isolated unit tests
│   ├── backend/
│   ├── frontend/
│   └── shared/
├── integration/    # Integration tests
│   └── backend/
└── security/       # Security-focused tests
```

### Running Tests

```bash
# All tests
bun test

# Unit tests only
bun test test/unit/

# With coverage
bun test --coverage

# Watch mode
bun test --watch
```

---

## 🚀 Development Workflow

### Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run package` | Package distributable |
| `bun run lint` | Run linter |
| `bun run format` | Format code |
| `bun run test` | Run tests |
| `bun run type-check` | Type check |

### Environment Variables

```bash
# .env.development
NODE_ENV=development
PORT=1234

# .env.production
NODE_ENV=production
```

---

## 📝 Best Practices

### Backend

1. **Use DI for all services** - Never instantiate services directly
2. **Handle errors gracefully** - Use `GlobalErrorHandler`
3. **Log appropriately** - Use correct log levels
4. **Validate IPC input** - Always validate incoming data
5. **Keep use cases focused** - Single responsibility principle

### Frontend

1. **Use composables** - Extract reusable logic
2. **Type your stores** - Define interfaces for state
3. **Handle loading states** - Show appropriate UI during async operations
4. **Use the service layer** - Don't call `window.electronAPI` directly
5. **Follow Vue 3 patterns** - Use `<script setup>` syntax

### Security

1. **Never expose nodeIntegration** - Keep it disabled
2. **Use contextIsolation** - Always enabled
3. **Validate all IPC data** - Use Zod schemas
4. **Minimize preload API** - Only expose what's necessary
5. **Use CSP** - Configure Content Security Policy

---

## 📈 Scalability Guidelines

### When to Create Feature Modules

When a feature grows beyond 5-10 files, consider:

```
src/backend/features/
└── window-management/
    ├── window-manager.service.ts
    ├── window.ipc.ts
    ├── window.use-case.ts
    └── window.config.ts
```

### When to Split Stores

When a store exceeds 200 lines:

```
src/frontend/stores/
├── app.ts          # UI state
├── settings.ts     # App settings
├── windows.ts      # Window management
└── user.ts         # User state
```

### When to Add Integration Tests

For critical paths:
- IPC communication
- Data persistence
- External API calls
- Complex workflows

---

## 🔐 Security Considerations

1. **Preload Script** - Only expose necessary APIs
2. **IPC Validation** - Validate all incoming data
3. **Context Isolation** - Always enabled
4. **Node Integration** - Always disabled in renderer
5. **Web Security** - Keep enabled except for specific dev scenarios

---

## 📚 Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Rspack Documentation](https://rspack.dev/)
- [Zod Documentation](https://zod.dev/)

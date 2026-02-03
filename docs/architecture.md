# Architecture Deep Dive

## Multi-Process Architecture

The application follows Electron's recommended multi-process architecture for security and performance:

### Backend Process (`src/backend/`)
- Manages application lifecycle and startup
- Handles native operating system integration
- Controls window creation and management
- Executes privileged system operations
- Contains utility libraries for configuration, file system operations, and IPC

### Frontend Process (`src/frontend/`)
- Vue.js application entry point and routing
- Component-based user interface architecture
- Communicates with backend process via secure IPC channels
- Runs in sandboxed environment for security
- Contains utility libraries for API calls, DOM manipulation, and event handling

## Communication Flow

```
Renderer Process (Frontend)
    ↓ (via window.electronAPI)
IPC Bridge (preload.ts)
    ↓ (via ipcRenderer/ipcMain)
Main Process (Backend)
    ↓ (via services)
Services and Data Stores
```

## Library Organization

### Backend Process Components (`src/backend/`)
- `lib/`: Backend utility functions and helpers
  - `utils-enhanced/`: Comprehensive backend utilities with enhanced functionality
    - Object manipulation, string processing, validation, file system operations
    - Cryptography, logging, path handling, environment management
    - Caching, async operations, and performance utilities
- `use-cases/`: Business logic implementations and IPC handlers for backend
- `config/`: Application configuration and settings
- `services/`: Core services like window management and database

### Frontend Process Components (`src/frontend/`)
- `lib/`: Frontend utility functions and helpers
  - `utils-enhanced/`: Comprehensive frontend utilities with enhanced functionality
    - Math, color, date, number utilities
    - DOM manipulation, animation, event handling
    - Storage management, API communication
    - Caching, async operations, and performance utilities
  - `async.ts`: Enhanced asynchronous utilities with debounce, throttle, retry, etc.
- `use-cases/`: Frontend business logic and UI components
- `services/`: Window component services and generators
- `main.ts`: Frontend process entry point

### Shared Components (`src/shared/`)
- `constants.ts`: Shared constants
- `types.ts`: Shared types and interfaces
- `utils/`: Utilities shared between processes
  - Object manipulation, string processing, validation, array operations
  - Caching utilities, async utilities, type utilities
  - Type definitions and interfaces for consistent data handling

## Security Model

- Node integration disabled in renderer process
- Context isolation enabled
- IPC bridge only exposes necessary methods
- File operations restricted to main process
- Input validation on all IPC channels

## Build System Architecture

The build system uses Rspack with the following features:
- Separate entry points for main and renderer processes
- Module resolution with path aliases (@, @/renderer, @/main, etc.)
- Development and production optimization settings
- Asset handling and processing pipelines
- Hot module replacement for rapid development

## Window Management

Each window type follows a modular pattern:
```
src/backend/use-cases/  # Backend process window controllers and IPC handlers
src/frontend/services/  # Frontend-side window components and UI logic
```

This structure encapsulates window-specific logic and keeps the codebase organized and scalable.
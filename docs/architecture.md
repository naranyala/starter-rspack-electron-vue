# Architecture Deep Dive

## Multi-Process Architecture

The application follows Electron's recommended multi-process architecture for security and performance:

### Main Process (`src/main/`)
- Manages application lifecycle and startup
- Handles native operating system integration
- Controls window creation and management
- Executes privileged system operations
- Contains utility libraries for configuration, file system operations, and IPC

### Renderer Process (`src/renderer/`)
- Vue.js application entry point and routing
- Component-based user interface architecture
- Communicates with main process via secure IPC channels
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

### Main Process Components (`src/main/`)
- `config/`: Application configuration and settings
- `services/`: Core services like window management and database
- `use-cases/`: Business logic implementations for main process

### Renderer Process Components (`src/renderer/`)
- `services/`: Window component services and generators
- `main.ts`: Renderer process entry point

### Shared Libraries (`src/lib/`)
- `backend/`: Backend utility functions and helpers
- `frontend/`: Frontend utility functions and helpers
- `shared/`: Utilities shared between processes

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
src/main/use-cases/     # Main process window controllers
src/renderer/services/  # Renderer-side window components
```

This structure encapsulates window-specific logic and keeps the codebase organized and scalable.
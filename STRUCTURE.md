# Project Structure Documentation

## 📁 Directory Structure

This Electron + Vue + Rspack project is properly separated between main process (backend) and renderer process (frontend) with dedicated `lib` folders for utility functions.

```
src/
├── main/                          # Electron Main Process (Backend)
│   ├── lib/                       # Main process utilities
│   │   ├── config.js              # App configuration
│   │   ├── utils.js               # Window, IPC, File system utilities
│   │   └── database.js           # Data store and settings
│   ├── main.js                   # Main process entry point
│   └── preload.js                # Preload script (IPC bridge)
│
├── renderer/                      # Renderer Process (Frontend)
│   ├── lib/                       # Renderer process utilities
│   │   ├── api.js                 # HTTP client, storage, Electron API
│   │   ├── dom.js                 # DOM manipulation and animations
│   │   ├── events.js              # Event system and keyboard utilities
│   │   ├── menu-data.ts           # Application menu data
│   │   └── window-generator.ts    # WinBox window generators
│   ├── styles/                    # CSS files
│   ├── App.vue                   # Root Vue component
│   └── main.js                   # Renderer entry point
│
├── assets/                        # Static assets
│   └── icons/
├── index.html                     # HTML template
├── reset.css                      # CSS reset
└── index.css                      # Global styles
```

## 🔧 Backend (Main Process) - `src/main/`

### Lib Folder Structure:

#### `config.js`
- Application configuration
- Window settings
- Menu configurations

#### `utils.js`
- **WindowManager**: Create and manage BrowserWindow instances
- **FileSystemUtils**: File operations with error handling
- **IPCUtils**: Inter-process communication helpers
- **AppLifecycleUtils**: App event handlers

#### `database.js`
- **DataStore**: In-memory data storage (replace with SQLite in production)
- **SettingsManager**: Application settings persistence

### IPC Handlers Available:
- `app:getVersion` - Get application version
- `app:getName` - Get application name
- `settings:get` - Get specific setting
- `settings:set` - Set specific setting
- `settings:getAll` - Get all settings
- `dialog:showMessageBox` - Show dialog box
- `window:minimize` - Minimize window
- `window:maximize` - Maximize/unmaximize window
- `window:close` - Close window

## 🎨 Frontend (Renderer Process) - `src/renderer/`

### Lib Folder Structure:

#### `api.js`
- **HttpClient**: HTTP client with timeout and error handling
- **StorageUtils**: LocalStorage utilities with JSON serialization
- **ElectronAPI**: Electron bridge utilities

#### `dom.js`
- **DOMUtils**: Element creation, selection, manipulation
- **AnimationUtils**: Fade, slide, and other animations

#### `events.js`
- **EventEmitter**: Custom event system
- **KeyboardUtils**: Keyboard event helpers
- **EventBus**: Global application event bus
- **debounce/throttle**: Performance utilities

#### `menu-data.ts` & `window-generator.ts`
- Application menu data and WinBox window generators

### API Available (via window.electronAPI):
- `getVersion()` - Get app version
- `getSetting(key)` - Get setting
- `setSetting(key, value)` - Set setting
- `getAllSettings()` - Get all settings
- `showMessageBox(options)` - Show dialog
- `minimizeWindow()` - Minimize window
- `maximizeWindow()` - Maximize/unmaximize window
- `closeWindow()` - Close window
- `on(channel, callback)` - Listen for events
- `removeListener(channel, callback)` - Remove event listener

## 🔄 Communication Flow

```
Renderer Process (Frontend)
    ↓ (via window.electronAPI)
IPC Bridge (preload.js)
    ↓ (via ipcRenderer/invoke)
Main Process (Backend)
    ↓ (via IPCUtils)
Utils & Services
```

## 📝 Best Practices

### Main Process:
- Use `WindowManager` for window operations
- Use `IPCUtils` for communication
- Use `SettingsManager` for persistence
- Handle errors gracefully

### Renderer Process:
- Use `DOMUtils` for DOM operations
- Use `HttpClient` for API calls
- Use `ElectronAPI` for main process communication
- Use `EventBus` for component communication

### Security:
- Node integration disabled in renderer
- Context isolation enabled
- IPC bridge only exposes necessary methods
- File operations only in main process

## 🚀 Development Workflow

1. **Development**: `bun run dev` - Starts both Rspack dev server and Electron
2. **Build**: `bun run build` - Builds application for production
3. **Package**: `bun run package` - Packages application as distributable

The build system includes robust error handling with automatic dependency installation and recovery mechanisms.
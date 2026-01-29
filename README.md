# Electron + Vue + Rspack Starter Template

A modern, production-ready starter template for building cross-platform desktop applications using Electron, Vue.js 3, and Rspack with robust error handling and comprehensive utility libraries.

## 🚀 Key Features

- **🎯 Proper Architecture** - Clean separation between Electron main process (backend) and renderer process (frontend)
- **🔧 Robust Build System** - Enhanced error handling with automatic dependency recovery
- **⚡ Vue.js 3** - Progressive JavaScript framework with Composition API
- **🦀 Rspack** - Fast Rust-based bundler with webpack compatibility
- **🖥️ Electron** - Cross-platform desktop application framework
- **🔄 Hot Module Replacement** - Real-time updates during development
- **🛡️ Security First** - Context isolation, disabled node integration in renderer
- **📦 Comprehensive Utils** - Dedicated utility libraries for both backend and frontend
- **🎨 Modern Tooling** - TypeScript support, CSS processing, asset management
- **🔌 IPC Communication** - Secure inter-process communication bridge

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Framework** | Vue.js 3 (Composition API) | ^3.5.27 |
| **Bundler** | Rspack (fast Rust-based) | ^1.7.4 |
| **Runtime** | Electron (desktop framework) | ^40.1.0 |
| **Language** | JavaScript/TypeScript | ESNext |
| **Package Manager** | Bun (recommended) / npm | Latest |
| **Code Quality** | Biome (linting/formatting) | Latest |

## 📋 Prerequisites

Ensure you have the following installed:

- **[Node.js](https://nodejs.org/)** (v18 or higher recommended)
- **[Bun](https://bun.sh/)** (recommended) or npm/yarn
- **[Git](https://git-scm.com/)** for version control

### Quick Install Commands

```bash
# Install Bun (recommended)
curl -fsSL https://bun.sh/install | bash

# Or ensure you have Node.js + npm
# Node.js includes npm by default
```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd starter-rspack-electron-vue

# Install dependencies (Bun recommended)
bun install

# Or using npm
npm install
```

### 2. Start Development

```bash
# Start development server with automatic Electron launch
bun run dev

# Or use npm
npm run dev
```

**That's it!** The development server will:
- Validate and install missing dependencies automatically
- Start Rspack dev server with hot reload
- Launch Electron application
- Handle all configuration automatically

## 🧰 Available Scripts

| Command | Description | Usage |
|---------|-------------|--------|
| `dev` | 🚀 Start development server + Electron (recommended) | `bun run dev` |
| `build` | 🏗️ Build application for production | `bun run build` |
| `package` | 📦 Package app for distribution | `bun run package` |
| `setup` | ⚙️ Initial project setup | `bun run setup` |
| `type-check` | 🧪 Check TypeScript types | `bun run type-check` |
| `lint` | 🔍 Lint and fix code | `bun run lint` |
| `format` | ✨ Format code with Biome | `bun run format` |
| `deps:latest` | ⬆️ Update dependencies to latest | `bun run deps:latest` |

### Advanced Commands

| Command | Description | Usage |
|---------|-------------|--------|
| `rspack-dev` | Start Rspack dev server only | `bun run rspack-dev` |
| `electron-dev` | Start Electron in dev mode only | `bun run electron-dev` |
| `start` | Launch Electron (production mode) | `bun run start` |
| `dist` | Alias for package command | `bun run dist` |

## 🏗️ Project Architecture

### Directory Structure

```
starter-rspack-electron-vue/
├── src/                           # Source code
│   ├── main/                       # Electron Main Process (Backend)
│   │   ├── lib/                    # Backend utilities
│   │   │   ├── config.js           # App configuration
│   │   │   ├── utils.js            # Window, IPC, File system
│   │   │   └── database.js        # Data store & settings
│   │   ├── main.js                # Main process entry point
│   │   └── preload.js             # IPC bridge (security)
│   ├── renderer/                    # Vue Renderer Process (Frontend)
│   │   ├── lib/                   # Frontend utilities
│   │   │   ├── api.js             # HTTP client, storage
│   │   │   ├── dom.js             # DOM manipulation
│   │   │   ├── events.js          # Event system
│   │   │   ├── menu-data.ts       # Application data
│   │   │   └── window-generator.ts # UI components
│   │   ├── styles/                # CSS files
│   │   ├── App.vue               # Root Vue component
│   │   └── main.js               # Renderer entry point
│   ├── assets/                     # Static assets
│   │   └── icons/                 # Application icons
│   ├── index.html                  # HTML template
│   ├── reset.css                   # CSS reset
│   └── index.css                  # Global styles
├── scripts/                       # Build and utility scripts
│   ├── build-robust.js            # Enhanced build system
│   ├── start-dev-robust.js         # Development server
│   ├── package-robust.js           # Packaging system
│   └── build-icons.js             # Icon processing
├── dist/                          # Build output (auto-generated)
├── rspack.config.cjs               # Rspack configuration
├── package.json                    # Project metadata
├── STRUCTURE.md                   # Detailed architecture docs
└── README.md                      # This file
```

### Backend/Frontend Separation

#### **Main Process** (`src/main/`) - The Backend
- **Purpose**: Electron app lifecycle, native OS integration, file system access
- **Security**: Full Node.js access, can interact with operating system
- **Key Classes**:
  - `WindowManager` - Browser window creation and management
  - `IPCUtils` - Inter-process communication
  - `FileSystemUtils` - File operations
  - `SettingsManager` - Application settings persistence

#### **Renderer Process** (`src/renderer/`) - The Frontend  
- **Purpose**: Vue.js UI, user interface, application logic
- **Security**: Sandboxed, no Node.js access, communicates via IPC bridge
- **Key Classes**:
  - `HttpClient` - HTTP requests with timeout and error handling
  - `DOMUtils` - DOM manipulation and animations
  - `EventBus` - Component communication
  - `ElectronAPI` - Secure bridge to main process

## 🔧 Configuration Files

### Rspack Configuration (`rspack.config.cjs`)
- **Vue Integration**: vue-loader with proper configuration
- **Asset Processing**: Images, fonts, CSS modules
- **Development Server**: Hot module replacement, port management
- **Path Aliases**: `@/`, `@/renderer-lib`, `@/main-lib`
- **Target**: `electron-renderer` for optimal Electron compatibility

### Main Process Configuration
- **Security**: Context isolation enabled, node integration disabled in renderer
- **IPC Handlers**: 10+ secure communication channels
- **Error Handling**: Comprehensive error recovery and logging
- **Development**: Automatic reload, dev tools integration

## 🎯 Development Workflow

### 1. **Development Mode** (Recommended)
```bash
# Start everything automatically
bun run dev
```
**What happens:**
1. ✅ Validates dependencies, auto-installs missing ones
2. ✅ Starts Rspack dev server with HMR
3. ✅ Launches Electron application
4. ✅ Sets up IPC communication bridge
5. ✅ Handles errors and recovers automatically

### 2. **Production Build**
```bash
# Create optimized production build
bun run build

# Package for distribution
bun run package
```
**What happens:**
1. ✅ Creates optimized production bundle
2. ✅ Packages as platform-specific installer
3. ✅ Creates .dmg (macOS), .deb (Linux), .msi (Windows)

### 3. **Code Quality**
```bash
# Type checking
bun run type-check

# Linting and auto-fix
bun run lint

# Code formatting
bun run format
```

## 📦 Build and Distribution

### Development Build
```bash
bun run build
# Output: dist/ (development build with debugging)
```

### Production Package
```bash
bun run package
# Output: dist/ (platform-specific installers)
```

**Supported Platforms:**
- **Windows**: MSI installer
- **macOS**: DMG disk image  
- **Linux**: AppImage, .deb package
- **All**: Portable executables available

### Deployment Options
1. **Direct Distribution**: Upload installers to your website
2. **GitHub Releases**: Use GitHub's automatic release system
3. **Auto-updater**: Implement with electron-updater
4. **App Stores**: Microsoft Store, Mac App Store, Snap Store

## 🔌 IPC Communication

### Available Channels

**Renderer → Main:**
- `app:getVersion` - Get application version
- `settings:get`/`set` - Application settings
- `dialog:showMessageBox` - Show native dialogs
- `window:minimize`/`maximize`/`close` - Window controls

**Main → Renderer:**
- `settings:changed` - Settings updated
- `app:menu-click` - Menu interactions
- `window:focus`/`blur` - Window state changes

### Usage Example (Renderer)
```javascript
// Using the exposed electronAPI
const version = await window.electronAPI.getVersion();
await window.electronAPI.setSetting('theme', 'dark');
await window.electronAPI.showMessageBox({
  type: 'info',
  message: 'Hello from Electron!'
});
```

## 🛡️ Security Features

1. **Context Isolation**: ✅ Enabled
2. **Node Integration**: ✅ Disabled in renderer
3. **Preload Script**: ✅ Secure bridge to main process
4. **Input Validation**: ✅ All IPC calls validated
5. **Error Boundaries**: ✅ Graceful error handling

## 💡 Best Practices

### Main Process (Backend)
- ✅ Use `WindowManager` for window operations
- ✅ Use `IPCUtils` for communication
- ✅ Use `SettingsManager` for persistence
- ✅ Handle all async operations properly
- ✅ Validate all incoming IPC requests

### Renderer Process (Frontend)
- ✅ Use `DOMUtils` for DOM operations
- ✅ Use `HttpClient` for API calls
- ✅ Use `ElectronAPI` for main process access
- ✅ Use `EventBus` for component communication
- ✅ Never access Node.js APIs directly

### Development
- ✅ Use Bun for faster package management
- ✅ Use TypeScript for type safety
- ✅ Use Biome for consistent code formatting
- ✅ Test on multiple platforms before release

## 🔧 Troubleshooting

### Common Issues

#### **Build Failures**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
bun install

# Use robust build (auto-recovers)
bun run build
```

#### **Development Server Issues**
```bash
# Kill existing processes
lsof -ti :1234 | xargs kill -9
# Or use fuser: fuser -k 1234/tcp

# Restart development
bun run dev
```

#### **Electron Not Found**
```bash
# The build system auto-installs missing Electron
# But you can manually install:
bun add electron --dev

# Or rebuild if corrupted:
npm rebuild electron
```

#### **IPC Communication Issues**
- Check preload.js is properly configured
- Verify context isolation is enabled
- Use `window.electronAPI` (not direct `ipcRenderer`)
- Check main process handlers are registered

### Performance Tips

#### **Development**
- Use Bun for faster installs
- Enable TypeScript strict mode
- Use HMR for faster iteration
- Keep bundle sizes small

#### **Production**
- Use `bun run build` for optimized bundles
- Test on target platforms
- Use code signing for distribution
- Enable auto-updater

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes with clear messages (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request with detailed description

### Code Style
- Use **TypeScript** for new files
- Follow **Vue Composition API** patterns
- Use **Biome** for formatting (`bun run format`)
- Add **JSDoc** comments for public APIs
- Test on **multiple platforms**

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

If you encounter issues or have questions:

1. **Check**: [GitHub Issues](https://github.com/your-username/starter-rspack-electron-vue/issues)
2. **Search**: Existing issues before creating new ones
3. **Provide**: OS, Node.js version, and error details
4. **Include**: Steps to reproduce the problem

### Quick Links
- **Documentation**: [STRUCTURE.md](STRUCTURE.md) for detailed architecture
- **Rspack Guide**: [Official Rspack Documentation](https://rspack.dev/)
- **Electron Docs**: [Official Electron Guide](https://www.electronjs.org/docs)
- **Vue.js Guide**: [Official Vue Documentation](https://vuejs.org/guide/)

---

## 🎉 Getting Started Summary

```bash
# 1. Clone and install
git clone <repository-url>
cd starter-rspack-electron-vue
bun install

# 2. Start development (automatically handles everything)
bun run dev

# 3. Start building amazing things! 🚀
```

**That's it!** You now have a production-ready Electron + Vue + Rspack application with:

- ✅ Robust error handling and recovery
- ✅ Professional architecture with backend/frontend separation
- ✅ Comprehensive utility libraries
- ✅ Security best practices
- ✅ Modern development tooling
- ✅ Cross-platform build system

Happy coding! 🎯